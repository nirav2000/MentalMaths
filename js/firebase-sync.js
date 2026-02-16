/* firebase-sync.js - optional Firestore cloud sync layer
   Keeps localStorage as source of truth and mirrors writes to Firestore when available.
*/

window.FirebaseSync = {
    _db: null,
    _enabled: false,
    _authReady: false,
    _pendingWrites: [],

    async init() {
        try {
            if (!window.firebase || !window.firebase.initializeApp) {
                console.warn('Firebase SDK not available, cloud sync disabled.');
                return;
            }

            const firebaseConfig = {
                apiKey: 'AIzaSyDlev9zW1J_VoqwAkgO25DBm6-tj8HMUdY',
                authDomain: 'fractionworksheet.firebaseapp.com',
                projectId: 'fractionworksheet',
                storageBucket: 'fractionworksheet.firebasestorage.app',
                messagingSenderId: '299874880737',
                appId: '1:299874880737:web:27ad3f1315ca10ab29fba0'
            };

            if (!window.firebase.apps.length) {
                window.firebase.initializeApp(firebaseConfig);
            }

            if (window.firebase.auth) {
                try {
                    await window.firebase.auth().signInAnonymously();
                    this._authReady = true;
                } catch (authError) {
                    console.warn('Anonymous auth unavailable. Continuing with Firestore client only:', authError);
                }
            }

            this._db = window.firebase.firestore();
            this._enabled = true;
            await this.flushPendingWrites();
            console.log('Firebase cloud sync enabled.', this.status());
        } catch (error) {
            console.warn('Firebase init failed, cloud sync disabled:', error);
            this._enabled = false;
            this._authReady = false;
        }
    },

    isReady() {
        return this._enabled && !!this._db;
    },

    status() {
        return {
            enabled: this._enabled,
            authReady: this._authReady,
            dbReady: !!this._db,
            queuedWrites: this._pendingWrites.length
        };
    },

    _docId(path) {
        return encodeURIComponent(path);
    },

    _playerIdFromPath(path) {
        const match = path.match(/^players\/([^/]+)/);
        return match ? match[1] : null;
    },

    async _saveNow(path, data) {
        await this._db.collection('mentalMathsData').doc(this._docId(path)).set({
            path,
            data,
            playerId: this._playerIdFromPath(path),
            updatedAt: new Date().toISOString()
        }, { merge: true });
    },

    async save(path, data) {
        if (!this.isReady()) {
            this._pendingWrites.push({ path, data });
            return;
        }
        try {
            await this._saveNow(path, data);
            console.debug('Cloud sync write ok:', path);
        } catch (error) {
            console.warn('Cloud sync write failed:', path, error);
            this._pendingWrites.push({ path, data });
        }
    },

    async flushPendingWrites() {
        if (!this.isReady() || this._pendingWrites.length === 0) return;
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
    },

    async fetchPlayerData(playerId) {
        if (!this.isReady()) return [];
        try {
            const snap = await this._db.collection('mentalMathsData').where('playerId', '==', playerId).get();
            return snap.docs.map((doc) => doc.data()).filter((d) => d && d.path);
        } catch (error) {
            console.warn('Cloud sync read failed:', error);
            return [];
        }
    }
};

window.FirebaseSync.init();
