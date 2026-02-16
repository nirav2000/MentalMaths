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

    _writeLocal(path, data) {
        localStorage.setItem(this._getKey(path), JSON.stringify(data));
    },

    _write(path, data) {
        this._writeLocal(path, data);
        if (window.FirebaseSync?.isReady()) {
            window.FirebaseSync.save(path, data);
        }
    },

    async syncPlayerFromCloud(playerId) {
        if (!window.FirebaseSync?.isReady() || !playerId) return 0;
        const cloudDocs = await window.FirebaseSync.fetchPlayerData(playerId);
        cloudDocs.forEach((doc) => {
            this._writeLocal(doc.path, doc.data);
        });
        return cloudDocs.length;
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

        // Maintain question log index
        const qIndex = this._read(`players/${playerId}/questionLogIndex`) || [];
        qIndex.push(qId);
        this._write(`players/${playerId}/questionLogIndex`, qIndex);

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

    getQuestionLog(playerId) {
        const index = this._read(`players/${playerId}/questionLogIndex`) || [];
        return index.map(id => this._read(`players/${playerId}/questionLog/${id}`)).filter(Boolean);
    },

    // ----- Flagged Questions -----

    flagQuestion(playerId, questionData) {
        const flagged = this.getFlaggedQuestions(playerId);
        // Avoid duplicates by question text
        if (flagged.some(q => q.questionText === questionData.questionText)) return;
        flagged.push({
            ...questionData,
            flaggedAt: new Date().toISOString(),
        });
        this._write(`players/${playerId}/flaggedQuestions`, flagged);
    },

    getFlaggedQuestions(playerId) {
        return this._read(`players/${playerId}/flaggedQuestions`) || [];
    },

    unflagQuestion(playerId, questionText) {
        const flagged = this.getFlaggedQuestions(playerId).filter(q => q.questionText !== questionText);
        this._write(`players/${playerId}/flaggedQuestions`, flagged);
    },

    // Get flagged questions for a specific strategy (for retry in future sessions)
    getFlaggedForStrategy(playerId, strategyId) {
        return this.getFlaggedQuestions(playerId).filter(q => q.strategyId === strategyId);
    },

    // ----- Teacher Unlocks -----

    getTeacherUnlocks(playerId) {
        return this._read(`players/${playerId}/teacherUnlocks`) || {};
    },

    setTeacherUnlock(playerId, strategyId, unlocked) {
        const unlocks = this.getTeacherUnlocks(playerId);
        if (unlocked) {
            unlocks[strategyId] = { unlockedAt: new Date().toISOString() };
        } else {
            delete unlocks[strategyId];
        }
        this._write(`players/${playerId}/teacherUnlocks`, unlocks);
    },

    isTeacherUnlocked(playerId, strategyId) {
        const unlocks = this.getTeacherUnlocks(playerId);
        return !!unlocks[strategyId];
    },

    // ----- Question Log by Strategy -----

    getQuestionLogByStrategy(playerId, strategyId) {
        return this.getQuestionLog(playerId).filter(q => q.strategyId === strategyId);
    },

    // ----- Export -----

    exportAll(playerId) {
        return {
            profile: this.getProfile(playerId),
            progress: this.getAllStrategyProgress(playerId),
            sessions: this.getSessions(playerId),
            questionLog: this.getQuestionLog(playerId),
            flaggedQuestions: this.getFlaggedQuestions(playerId),
            teacherUnlocks: this.getTeacherUnlocks(playerId),
        };
    },
};
