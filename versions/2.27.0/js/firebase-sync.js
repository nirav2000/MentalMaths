/* firebase-sync.js - optional Firestore cloud sync layer
   Keeps localStorage as source of truth and mirrors writes to Firestore when available.
*/

window.FirebaseSync = {
    _db: null,
    _enabled: false,

    init() {
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

            this._db = window.firebase.firestore();
            this._enabled = true;
        } catch (error) {
            console.warn('Firebase init failed, cloud sync disabled:', error);
            this._enabled = false;
        }
    },

    isReady() {
        return this._enabled && !!this._db;
    },

    _docId(path) {
        return encodeURIComponent(path);
    },

    _playerIdFromPath(path) {
        const match = path.match(/^players\/([^/]+)/);
        return match ? match[1] : null;
    },

    async save(path, data) {
        if (!this.isReady()) return;
        try {
            await this._db.collection('mentalMathsData').doc(this._docId(path)).set({
                path,
                data,
                playerId: this._playerIdFromPath(path),
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.warn('Cloud sync write failed:', error);
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

