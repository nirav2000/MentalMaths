/* storage.js - Firebase-compatible data layer using localStorage

   Data structure mirrors Firestore collections:
   players/{playerId}/profile
   players/{playerId}/strategyProgress/{strategyId}
   players/{playerId}/sessions/{sessionId}
   players/{playerId}/questionLog/{questionId}
*/

const Storage = {
    _prefix: 'mentalMaths_',

    _getKey(path) {
        return this._prefix + path;
    },

    _read(path) {
        try {
            const raw = localStorage.getItem(this._getKey(path));
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    _write(path, data) {
        localStorage.setItem(this._getKey(path), JSON.stringify(data));
    },

    // ----- Player CRUD -----

    getPlayers() {
        return this._read('playerList') || [];
    },

    addPlayer(name) {
        const players = this.getPlayers();
        const id = 'player_' + Date.now();
        const player = { id, name, createdAt: new Date().toISOString() };
        players.push(player);
        this._write('playerList', players);

        // Init profile
        this._write(`players/${id}/profile`, {
            name,
            createdAt: player.createdAt,
            totalSessions: 0,
            totalQuestions: 0,
            totalCorrect: 0,
        });

        // Init strategy progress
        STRATEGIES.forEach(s => {
            this._write(`players/${id}/strategyProgress/${s.id}`, {
                strategyId: s.id,
                mastery: 0,
                level: 1,
                totalAttempts: 0,
                totalCorrect: 0,
                streak: 0,
                bestStreak: 0,
                avgTimeMs: 0,
                lastPracticed: null,
                assessmentNotes: '',
            });
        });

        return player;
    },

    getProfile(playerId) {
        return this._read(`players/${playerId}/profile`);
    },

    updateProfile(playerId, updates) {
        const profile = this.getProfile(playerId) || {};
        Object.assign(profile, updates);
        this._write(`players/${playerId}/profile`, profile);
    },

    getStrategyProgress(playerId, strategyId) {
        return this._read(`players/${playerId}/strategyProgress/${strategyId}`);
    },

    updateStrategyProgress(playerId, strategyId, updates) {
        const prog = this.getStrategyProgress(playerId, strategyId) || {};
        Object.assign(prog, updates);
        this._write(`players/${playerId}/strategyProgress/${strategyId}`, prog);
    },

    getAllStrategyProgress(playerId) {
        const result = {};
        STRATEGIES.forEach(s => {
            result[s.id] = this.getStrategyProgress(playerId, s.id) || {
                strategyId: s.id, mastery: 0, level: 1,
                totalAttempts: 0, totalCorrect: 0, streak: 0,
                bestStreak: 0, avgTimeMs: 0, lastPracticed: null,
            };
        });
        return result;
    },

    // ----- Session Logging -----

    logSession(playerId, sessionData) {
        const sessionId = 'sess_' + Date.now();
        const data = {
            ...sessionData,
            id: sessionId,
            playerId,
            timestamp: new Date().toISOString(),
        };
        this._write(`players/${playerId}/sessions/${sessionId}`, data);

        const index = this._read(`players/${playerId}/sessionIndex`) || [];
        index.push(sessionId);
        this._write(`players/${playerId}/sessionIndex`, index);
        return sessionId;
    },

    getSession(playerId, sessionId) {
        return this._read(`players/${playerId}/sessions/${sessionId}`);
    },

    updateSession(playerId, sessionId, updates) {
        const session = this.getSession(playerId, sessionId) || {};
        Object.assign(session, updates);
        this._write(`players/${playerId}/sessions/${sessionId}`, session);
    },

    getSessions(playerId) {
        const index = this._read(`players/${playerId}/sessionIndex`) || [];
        return index.map(id => this._read(`players/${playerId}/sessions/${id}`)).filter(Boolean);
    },

    // ----- Question Logging -----

    logQuestion(playerId, questionData) {
        const qId = 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        const data = {
            ...questionData,
            id: qId,
            playerId,
            timestamp: new Date().toISOString(),
        };
        this._write(`players/${playerId}/questionLog/${qId}`, data);

        // Append to session's question list
        if (questionData.sessionId) {
            const session = this.getSession(playerId, questionData.sessionId);
            if (session) {
                session.questions = session.questions || [];
                session.questions.push(qId);
                this._write(`players/${playerId}/sessions/${questionData.sessionId}`, session);
            }
        }
        return qId;
    },

    // ----- Export -----

    exportAll(playerId) {
        return {
            appVersion: APP_VERSION,
            profile: this.getProfile(playerId),
            progress: this.getAllStrategyProgress(playerId),
            sessions: this.getSessions(playerId),
        };
    },
};
