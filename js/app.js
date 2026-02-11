/* app.js - Main UI controller */

const App = {
    currentPlayer: null,
    currentQuestion: null,
    currentAnswer: '',
    questionStartTime: null,
    sessionQuestions: [],
    sessionIndex: 0,
    sessionResults: [],
    streak: 0,
    sessionId: null,
    showingFeedback: false,
    hintShownForCurrent: false,

    init() {
        document.title = `Mental Maths v${APP_VERSION}`;
        document.querySelectorAll('[id^="version-"]').forEach(el => {
            el.textContent = `v${APP_VERSION}`;
        });
        this.bindEvents();
        this.renderPlayerList();
        this.showScreen('screen-welcome');
    },

    // ----- Navigation -----

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    },

    // ----- Events -----

    bindEvents() {
        // Welcome
        document.getElementById('btn-add-player').addEventListener('click', () => this.addPlayer());
        document.getElementById('new-player-name').addEventListener('keydown', e => {
            if (e.key === 'Enter') this.addPlayer();
        });

        // Home
        document.getElementById('btn-back-welcome').addEventListener('click', () => {
            this.currentPlayer = null;
            this.showScreen('screen-welcome');
        });
        document.getElementById('btn-practice').addEventListener('click', () => this.startPractice());
        document.getElementById('btn-stats').addEventListener('click', () => this.showStats());

        // Quiz
        document.getElementById('btn-quit-quiz').addEventListener('click', () => this.quitQuiz());
        document.getElementById('numpad').addEventListener('click', e => {
            const btn = e.target.closest('.numpad-btn');
            if (btn) this.handleNumpad(btn.dataset.val);
        });

        // Summary
        document.getElementById('btn-summary-home').addEventListener('click', () => {
            this.showScreen('screen-home');
            this.renderHome();
        });

        // Stats
        document.getElementById('btn-back-home').addEventListener('click', () => this.showScreen('screen-home'));
        document.getElementById('btn-export-data').addEventListener('click', () => this.exportData());

        // Keyboard
        document.addEventListener('keydown', e => {
            if (!document.getElementById('screen-quiz').classList.contains('active')) return;
            if (e.key >= '0' && e.key <= '9') this.handleNumpad(e.key);
            else if (e.key === 'Backspace') this.handleNumpad('del');
            else if (e.key === 'Enter') this.handleNumpad('go');
        });
    },

    // ----- Players -----

    addPlayer() {
        const input = document.getElementById('new-player-name');
        const name = input.value.trim();
        if (!name) return;
        Storage.addPlayer(name);
        input.value = '';
        this.renderPlayerList();
    },

    renderPlayerList() {
        const list = document.getElementById('player-list');
        const players = Storage.getPlayers();
        list.innerHTML = '';
        players.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'btn player-btn';
            const profile = Storage.getProfile(p.id);
            const totalQ = profile ? profile.totalQuestions || 0 : 0;
            btn.innerHTML = `<span>${p.name}</span><span class="player-level">${totalQ} questions done</span>`;
            btn.addEventListener('click', () => this.selectPlayer(p));
            list.appendChild(btn);
        });
    },

    selectPlayer(player) {
        this.currentPlayer = player;
        this.showScreen('screen-home');
        this.renderHome();
    },

    // ----- Home -----

    renderHome() {
        if (!this.currentPlayer) return;
        document.getElementById('player-greeting').textContent = `Hi, ${this.currentPlayer.name}!`;

        const grid = document.getElementById('strategy-grid');
        grid.innerHTML = '';
        const allProg = Storage.getAllStrategyProgress(this.currentPlayer.id);

        STRATEGIES.forEach(s => {
            const prog = allProg[s.id];
            const mastery = prog?.mastery || 0;
            const unlocked = !s.unlockRequires || (allProg[s.unlockRequires]?.mastery >= 50);

            const card = document.createElement('div');
            card.className = 'strategy-card' + (unlocked ? '' : ' locked');

            const barColor = mastery >= 80 ? 'var(--success)' : mastery >= 40 ? 'var(--warning)' : 'var(--error)';
            card.innerHTML = `
                <div class="strategy-name">${s.shortName}</div>
                <div class="strategy-mastery">${unlocked ? `L${prog?.level || 1} · ${mastery}%` : 'Locked'}</div>
                <div class="mastery-bar"><div class="mastery-bar-fill" style="width:${mastery}%;background:${barColor};"></div></div>
            `;
            if (unlocked) card.addEventListener('click', () => this.startPractice(s));
            grid.appendChild(card);
        });
    },

    // ----- Quiz -----

    startPractice(specificStrategy) {
        const pid = this.currentPlayer.id;
        const plan = AdaptiveEngine.getSessionPlan(pid, specificStrategy);

        this.sessionQuestions = plan.questions;
        this.sessionIndex = 0;
        this.sessionResults = [];
        this.streak = 0;
        this.sessionId = Storage.logSession(pid, {
            strategyFocus: specificStrategy ? specificStrategy.id : 'auto',
            startTime: new Date().toISOString(),
            totalQuestions: plan.questions.length,
            completed: false,
        });

        this.showScreen('screen-quiz');
        this.nextQuestion();
    },

    nextQuestion() {
        if (this.sessionIndex >= this.sessionQuestions.length) {
            this.endSession();
            return;
        }

        const qPlan = this.sessionQuestions[this.sessionIndex];
        const question = AdaptiveEngine.generateQuestion(qPlan.strategyId, this.currentPlayer.id);
        if (!question) { this.sessionIndex++; this.nextQuestion(); return; }

        this.currentQuestion = { ...question, strategyId: qPlan.strategyId };
        this.currentAnswer = '';
        this.questionStartTime = Date.now();
        this.showingFeedback = false;
        this.hintShownForCurrent = false;

        // Update header
        const strat = STRATEGIES.find(s => s.id === qPlan.strategyId);
        document.getElementById('quiz-strategy-name').textContent = strat?.name || '';
        document.getElementById('quiz-progress').textContent = `${this.sessionIndex + 1} / ${this.sessionQuestions.length}`;
        document.getElementById('quiz-streak').innerHTML = `&#x1f525; ${this.streak}`;
        document.getElementById('quiz-question').textContent = question.questionText;
        document.getElementById('quiz-answer-display').innerHTML = '&nbsp;';

        // Teaching aids
        const shouldTeach = AdaptiveEngine.shouldShowTeaching(this.currentPlayer.id, qPlan.strategyId);
        const hintEl = document.getElementById('quiz-hint');
        const visualEl = document.getElementById('quiz-visual');

        if (shouldTeach && question.hint) {
            hintEl.textContent = question.hint;
            hintEl.classList.remove('hidden');
            this.hintShownForCurrent = true;
        } else {
            hintEl.classList.add('hidden');
        }

        if (shouldTeach && question.visual) {
            visualEl.innerHTML = VisualRenderer.render(question.visual);
            visualEl.classList.remove('hidden');
        } else {
            visualEl.classList.add('hidden');
        }

        // Hide feedback
        const fb = document.getElementById('quiz-feedback');
        fb.classList.add('hidden');
        fb.classList.remove('correct', 'incorrect');
    },

    handleNumpad(val) {
        if (this.showingFeedback) return;
        if (val === 'del') {
            this.currentAnswer = this.currentAnswer.slice(0, -1);
        } else if (val === 'go') {
            if (this.currentAnswer === '') return;
            this.submitAnswer();
            return;
        } else {
            if (this.currentAnswer.length >= 4) return;
            this.currentAnswer += val;
        }
        document.getElementById('quiz-answer-display').textContent = this.currentAnswer || '\u00A0';
    },

    submitAnswer() {
        const timeMs = Date.now() - this.questionStartTime;
        const userAnswer = parseInt(this.currentAnswer, 10);
        const correct = userAnswer === this.currentQuestion.answer;

        this.streak = correct ? this.streak + 1 : 0;

        const assessment = AdaptiveEngine.assessAnswer(
            this.currentPlayer.id, this.currentQuestion.strategyId, correct, timeMs
        );

        // Log question
        Storage.logQuestion(this.currentPlayer.id, {
            sessionId: this.sessionId,
            strategyId: this.currentQuestion.strategyId,
            questionText: this.currentQuestion.questionText,
            correctAnswer: this.currentQuestion.answer,
            userAnswer, correct, timeMs,
            hintShown: this.hintShownForCurrent,
            assessment: assessment.assessment,
            masteryAfter: assessment.newMastery,
            levelAfter: assessment.newLevel,
            date: new Date().toISOString(),
        });

        // Update profile
        const profile = Storage.getProfile(this.currentPlayer.id);
        Storage.updateProfile(this.currentPlayer.id, {
            totalQuestions: (profile.totalQuestions || 0) + 1,
            totalCorrect: (profile.totalCorrect || 0) + (correct ? 1 : 0),
        });

        this.sessionResults.push({
            questionText: this.currentQuestion.questionText,
            correctAnswer: this.currentQuestion.answer,
            userAnswer, correct, timeMs,
            strategyId: this.currentQuestion.strategyId,
        });

        this.showFeedback(correct, assessment);
    },

    showFeedback(correct, assessment) {
        this.showingFeedback = true;
        const fb = document.getElementById('quiz-feedback');
        const answerEl = document.getElementById('quiz-answer-display');

        document.getElementById('quiz-streak').innerHTML = `&#x1f525; ${this.streak}`;
        fb.classList.remove('hidden', 'correct', 'incorrect');

        if (correct) {
            fb.classList.add('correct');
            let msg = pick(['Correct!', 'Well done!', 'Great job!', 'Yes!', 'Perfect!']);
            if (this.streak >= 5) msg += ` ${this.streak} in a row!`;
            fb.textContent = msg;
            answerEl.classList.add('pulse-correct');
            setTimeout(() => answerEl.classList.remove('pulse-correct'), 600);
        } else {
            fb.classList.add('incorrect');
            fb.textContent = `The answer is ${this.currentQuestion.answer}`;
            answerEl.classList.add('shake');
            setTimeout(() => answerEl.classList.remove('shake'), 400);

            // Show teaching aids on wrong answer
            if (assessment.shouldShowHint && this.currentQuestion.hint) {
                const hintEl = document.getElementById('quiz-hint');
                hintEl.textContent = this.currentQuestion.hint;
                hintEl.classList.remove('hidden');
            }
            if (assessment.shouldShowVisual && this.currentQuestion.visual) {
                const visualEl = document.getElementById('quiz-visual');
                visualEl.innerHTML = VisualRenderer.render(this.currentQuestion.visual);
                visualEl.classList.remove('hidden');
            }
        }

        setTimeout(() => { this.sessionIndex++; this.nextQuestion(); }, correct ? 1000 : 2500);
    },

    quitQuiz() { this.endSession(); },

    endSession() {
        if (this.sessionId) {
            Storage.updateSession(this.currentPlayer.id, this.sessionId, {
                completed: true,
                endTime: new Date().toISOString(),
                totalCorrect: this.sessionResults.filter(r => r.correct).length,
                totalAnswered: this.sessionResults.length,
                avgTimeMs: this.sessionResults.length > 0
                    ? Math.round(this.sessionResults.reduce((s, r) => s + r.timeMs, 0) / this.sessionResults.length)
                    : 0,
            });
        }

        const profile = Storage.getProfile(this.currentPlayer.id);
        Storage.updateProfile(this.currentPlayer.id, {
            totalSessions: (profile.totalSessions || 0) + 1,
        });

        this.renderSummary();
        this.showScreen('screen-summary');
    },

    // ----- Summary -----

    renderSummary() {
        const results = this.sessionResults;
        const correct = results.filter(r => r.correct).length;
        const total = results.length;
        const avgTime = total > 0
            ? (Math.round(results.reduce((s, r) => s + r.timeMs, 0) / total / 100) / 10)
            : 0;
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

        document.getElementById('summary-title').textContent =
            pct >= 90 ? 'Amazing!' : pct >= 70 ? 'Great Work!' : pct >= 50 ? 'Good Effort!' : 'Keep Practising!';

        document.getElementById('summary-stats').innerHTML = `
            <div class="stat-box"><div class="stat-value">${correct}/${total}</div><div class="stat-label">Correct</div></div>
            <div class="stat-box"><div class="stat-value">${pct}%</div><div class="stat-label">Score</div></div>
            <div class="stat-box"><div class="stat-value">${avgTime}s</div><div class="stat-label">Avg Time</div></div>
        `;

        document.getElementById('summary-detail').innerHTML = results.map(r => `
            <div class="summary-row">
                <span class="q-text">${r.questionText}</span>
                <span class="q-result ${r.correct ? 'correct' : 'incorrect'}">
                    ${r.correct ? r.userAnswer : `${r.userAnswer} (${r.correctAnswer})`}
                </span>
            </div>
        `).join('');
    },

    // ----- Stats -----

    showStats() {
        const pid = this.currentPlayer.id;
        const profile = Storage.getProfile(pid);
        const allProg = Storage.getAllStrategyProgress(pid);
        const sessions = Storage.getSessions(pid);
        const accuracy = profile.totalQuestions > 0
            ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 0;

        let html = `
        <div class="stats-section"><h3>Overview</h3>
            <div class="stats-overview">
                <div class="stat-box"><div class="stat-value">${profile.totalSessions || 0}</div><div class="stat-label">Sessions</div></div>
                <div class="stat-box"><div class="stat-value">${profile.totalQuestions || 0}</div><div class="stat-label">Questions</div></div>
                <div class="stat-box"><div class="stat-value">${accuracy}%</div><div class="stat-label">Accuracy</div></div>
                <div class="stat-box"><div class="stat-value">${profile.totalCorrect || 0}</div><div class="stat-label">Correct</div></div>
            </div>
        </div>
        <div class="stats-section"><h3>Strategy Progress</h3>`;

        STRATEGIES.forEach(s => {
            const p = allProg[s.id];
            const mastery = p?.mastery || 0;
            const barColor = mastery >= 80 ? 'var(--success)' : mastery >= 40 ? 'var(--warning)' : 'var(--error)';
            html += `
            <div class="stats-strategy-row">
                <div class="name">${s.shortName} <span style="color:var(--text-muted);font-size:0.75rem;">L${p?.level || 1}</span></div>
                <div class="mastery">${mastery}%</div>
                <div class="bar-container"><div class="bar-fill" style="width:${mastery}%;background:${barColor};"></div></div>
            </div>`;
        });
        html += '</div>';

        html += '<div class="stats-section"><h3>Recent Sessions</h3><div class="session-log">';
        const recent = sessions.slice(-10).reverse();
        if (!recent.length) {
            html += '<p style="color:var(--text-muted);font-size:0.85rem;">No sessions yet.</p>';
        }
        recent.forEach(s => {
            const date = new Date(s.timestamp).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            const name = STRATEGIES.find(x => x.id === s.strategyFocus)?.shortName || 'Mixed';
            html += `<div class="log-entry">
                <div class="log-date">${date}</div>
                <div class="log-summary">${name} · ${s.totalCorrect || 0}/${s.totalAnswered || 0} correct${s.avgTimeMs ? ` · ${(s.avgTimeMs / 1000).toFixed(1)}s avg` : ''}</div>
            </div>`;
        });
        html += '</div></div>';

        document.getElementById('stats-content').innerHTML = html;
        this.showScreen('screen-stats');
    },

    // ----- Export -----

    exportData() {
        if (!this.currentPlayer) return;
        const data = Storage.exportAll(this.currentPlayer.id);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mental-maths-${this.currentPlayer.name}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
