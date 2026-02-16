/* firebase-sync.js - optional Firestore cloud sync layer
   localStorage remains source of truth; Firebase mirrors authenticated user data.
*/

window.FirebaseSync = {
    _db: null,
    _auth: null,
    _enabled: false,
    _authReady: false,
    _pendingWrites: [],
    _user: null,
    _statusListeners: [],

    _firebaseConfig: {
        apiKey: 'AIzaSyDlev9zW1J_VoqwAkgO25DBm6-tj8HMUdY',
        authDomain: 'fractionworksheet.firebaseapp.com',
        projectId: 'fractionworksheet',
        storageBucket: 'fractionworksheet.firebasestorage.app',
        messagingSenderId: '299874880737',
        appId: '1:299874880737:web:27ad3f1315ca10ab29fba0'
    },

    _friendlyAuthError(error, fallback = 'Authentication failed.') {
        const code = error?.code || '';
        const messages = {
            'auth/email-already-in-use': 'That email is already registered. Try signing in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
            'auth/operation-not-allowed': 'Email/password sign-in is disabled in Firebase Console.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found for this email. Create an account first.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-credential': 'Invalid email/password credentials.',
            'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
            'auth/network-request-failed': 'Network error. Check your connection and try again.'
        };
        return messages[code] || error?.message || fallback;
    },

    async init() {
        try {
            if (!window.firebase?.initializeApp) {
                console.warn('Firebase SDK not available, cloud sync disabled.');
                return;
            }

            if (!window.firebase.apps.length) {
                window.firebase.initializeApp(this._firebaseConfig);
            }

            this._db = window.firebase.firestore();
            this._auth = window.firebase.auth ? window.firebase.auth() : null;
            this._enabled = true;

            if (this._auth) {
                this._auth.onAuthStateChanged(async (user) => {
                    this._user = user || null;
                    this._authReady = true;
                    if (this.canWrite()) {
                        await this.flushPendingWrites();
                    }
                    this._notifyStatus();
                });
            } else {
                this._authReady = true;
                this._notifyStatus();
            }

            console.log('Firebase initialized.', this.status());
        } catch (error) {
            console.warn('Firebase init failed, cloud sync disabled:', error);
            this._enabled = false;
            this._authReady = false;
            this._notifyStatus();
        }
    },

    onStatusChange(listener) {
        if (typeof listener !== 'function') return () => {};
        this._statusListeners.push(listener);
        listener(this.status());
        return () => {
            this._statusListeners = this._statusListeners.filter((l) => l !== listener);
        };
    },

    _notifyStatus() {
        const snapshot = this.status();
        this._statusListeners.forEach((listener) => {
            try {
                listener(snapshot);
            } catch (error) {
                console.warn('FirebaseSync status listener error:', error);
            }
        });
    },

    isReady() {
        return this._enabled && !!this._db && this._authReady;
    },

    canWrite() {
        return this.isReady() && !!this._user;
    },

    currentUser() {
        return this._user;
    },

    status() {
        return {
            enabled: this._enabled,
            authReady: this._authReady,
            signedIn: !!this._user,
            userEmail: this._user?.email || null,
            userId: this._user?.uid || null,
            dbReady: !!this._db,
            queuedWrites: this._pendingWrites.length
        };
    },

    async signUp(email, password) {
        if (!this._auth) {
            throw new Error('Firebase Auth is unavailable.');
        }

        try {
            const credential = await this._auth.createUserWithEmailAndPassword(email, password);
            this._notifyStatus();
            return credential.user;
        } catch (error) {
            throw new Error(this._friendlyAuthError(error, 'Account creation failed.'));
        }
    },

    async signIn(email, password) {
        if (!this._auth) {
            throw new Error('Firebase Auth is unavailable.');
        }

        try {
            const credential = await this._auth.signInWithEmailAndPassword(email, password);
            this._notifyStatus();
            return credential.user;
        } catch (error) {
            throw new Error(this._friendlyAuthError(error, 'Sign-in failed.'));
        }
    },

    async signOut() {
        if (!this._auth) return;
        await this._auth.signOut();
        this._notifyStatus();
    },

    _docId(path) {
        const uid = this._user?.uid || 'guest';
        return encodeURIComponent(`${uid}:${path}`);
    },

    _playerIdFromPath(path) {
        const match = path.match(/^players\/([^/]+)/);
        return match ? match[1] : null;
    },

    async _saveNow(path, data) {
        if (!this.canWrite()) {
            throw new Error('Not authenticated for cloud write.');
        }

        await this._db.collection('mentalMathsData').doc(this._docId(path)).set({
            path,
            data,
            playerId: this._playerIdFromPath(path),
            userId: this._user.uid,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    },

    async save(path, data) {
        if (!this.canWrite()) {
            this._pendingWrites.push({ path, data });
            this._notifyStatus();
            return;
        }

        try {
            await this._saveNow(path, data);
            console.debug('Cloud sync write ok:', path);
        } catch (error) {
            console.warn('Cloud sync write failed:', path, error);
            this._pendingWrites.push({ path, data });
            this._notifyStatus();
        }
    },

    async flushPendingWrites() {
        if (!this.canWrite() || this._pendingWrites.length === 0) return;

        const writes = [...this._pendingWrites];
        this._pendingWrites = [];

        for (const write of writes) {
            try {
                await this._saveNow(write.path, write.data);
            } catch (error) {
                console.warn('Cloud sync retry failed:', write.path, error);
                this._pendingWrites.push(write);
            }
        }

        this._notifyStatus();
    },

    async fetchPlayerData(playerId) {
        if (!this.canWrite() || !playerId) return [];

        try {
            const snap = await this._db
                .collection('mentalMathsData')
                .where('userId', '==', this._user.uid)
                .where('playerId', '==', playerId)
                .get();

            return snap.docs.map((doc) => doc.data()).filter((d) => d?.path);
        } catch (error) {
            console.warn('Cloud sync read failed:', error);
            return [];
        }
    }
};

window.FirebaseSync.init();
