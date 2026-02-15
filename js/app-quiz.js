/* app-quiz.js - Quiz flow, numpad, answer, feedback, avatar, session end, summary */

Object.assign(App, {

    isWordProblemQuestion(question) {
        return !!(
            question && (
                question.type === 'word-problem' ||
                question.module === 'expansion-word-problem' ||
                question.strategyId === 'word-problems'
            )
        );
    },

    async renderExpansionWordProblem(question) {
        const numpad = document.getElementById('numpad');
        if (numpad) numpad.classList.add('hidden');

        const hintEl = document.getElementById('quiz-hint');
        const visualEl = document.getElementById('quiz-visual');
        if (hintEl) hintEl.classList.add('hidden');
        if (!visualEl) return;

        try {
            const bridge = await this.ensureExpansionBridge();
            if (!bridge?.renderWordProblem) return;

            const problem = question.expansionProblem || {
                text: question.questionText,
                answer: question.answer,
                numberSentence: question.numberSentence || '',
                scaffolding: question.scaffolding || {}
            };

            visualEl.innerHTML = '';
            visualEl.classList.remove('hidden');
            visualEl.appendChild(bridge.renderWordProblem(problem, {
                showScaffoldingButtons: true,
                onAnswer: (correct, userAnswer) => {
                    this.currentAnswer = String(userAnswer ?? '');
                    if (!this.showingFeedback) {
                        this.submitAnswer();
                    }
                }
            }));
            this.wordProblemInputActive = true;
        } catch (error) {
            console.warn('Failed to load expansion word problem UI bridge:', error);
        }
    },

    startPractice(specificStrategy, options = {}) {
        const pid = this.currentPlayer.id;
        this.practiceMode = options.practiceMode || false;
        this.isDailyChallenge = options.dailyChallenge || false;

        let plan;
        if (options.timesTable) {
            TimesTables.ensureProgress(pid);
            plan = TimesTables.getSessionPlan(pid, options.timesTable);
        } else if (options.dailyChallenge) {
            const dailyPlan = DailyChallenge.generatePlan(pid);
            plan = { strategy: { id: 'daily', name: 'Daily Challenge' }, questions: dailyPlan };
        } else {
            plan = AdaptiveEngine.getSessionPlan(pid, specificStrategy);
        }

        this.sessionQuestions = plan.questions;
        this.sessionIndex = 0;
        this.sessionResults = [];
        this.sessionAskedTexts = new Set();
        this.streak = 0;
        Intervention.reset();

        const focusId = options.timesTable ? `times_${options.timesTable}`
            : specificStrategy ? specificStrategy.id
            : this.isDailyChallenge ? 'daily' : 'auto';
        this.sessionId = Storage.logSession(pid, {
            strategyFocus: focusId,
            startTime: new Date().toISOString(),
            totalQuestions: plan.questions.length,
            completed: false,
        });

        // Practice mode banner
        const banner = document.getElementById('practice-mode-banner');
        if (banner) banner.classList.toggle('hidden', !this.practiceMode);

        this.showScreen('screen-quiz');
        this.nextQuestion();
    },

    startDailyChallenge() {
        if (DailyChallenge.isCompletedToday(this.currentPlayer.id)) return;
        this.startPractice(null, { dailyChallenge: true });
    },

    startPracticeMode(strategyId) {
        const strat = STRATEGIES.find(s => s.id === strategyId);
        if (strat) this.startPractice(strat, { practiceMode: true });
    },

    nextQuestion() {
        if (this.sessionIndex >= this.sessionQuestions.length) {
            this.endSession();
            return;
        }

        const qPlan = this.sessionQuestions[this.sessionIndex];
        let question = null;
        for (let tries = 0; tries < 20; tries++) {
            const q = AdaptiveEngine.generateQuestion(qPlan.strategyId, this.currentPlayer.id);
            if (!q) break;
            if (!this.sessionAskedTexts.has(q.questionText) || tries === 19) {
                question = q;
                break;
            }
        }
        if (!question) { this.sessionIndex++; this.nextQuestion(); return; }
        this.sessionAskedTexts.add(question.questionText);

        this.currentQuestion = { ...question, strategyId: qPlan.strategyId };
        this.wordProblemInputActive = false;
        this.currentAnswer = '';
        this.questionStartTime = Date.now();
        this.showingFeedback = false;
        this.hintShownForCurrent = false;

        // Update header
        const strat = STRATEGIES.find(s => s.id === qPlan.strategyId);
        let headerName = '';
        if (this.isDailyChallenge) headerName = 'Daily Challenge';
        else if (strat) headerName = strat.name;
        else if (TimesTables.isTimesTable(qPlan.strategyId)) headerName = TimesTables.getTableName(qPlan.strategyId);
        document.getElementById('quiz-strategy-name').textContent = headerName;
        document.getElementById('quiz-progress').textContent = `${this.sessionIndex + 1} / ${this.sessionQuestions.length}`;
        document.getElementById('quiz-streak').innerHTML = `&#x1f525; ${this.streak}`;
        document.getElementById('quiz-question').textContent = question.questionText;
        document.getElementById('quiz-answer-display').innerHTML = '&nbsp;';
        const numpad = document.getElementById('numpad');
        if (numpad) numpad.classList.remove('hidden');

        // Avatar
        this.updateAvatar('neutral');

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
            visualEl.classList.add('quiz-visual-large');
            VisualRenderer.bindInteractions(visualEl);
        } else {
            visualEl.classList.add('hidden');
        }

        if (this.isWordProblemQuestion(this.currentQuestion)) {
            this.renderExpansionWordProblem(this.currentQuestion);
        }

        // Hide feedback & encouragement
        const fb = document.getElementById('quiz-feedback');
        fb.classList.add('hidden');
        fb.classList.remove('correct', 'incorrect');
        const enc = document.getElementById('quiz-encouragement');
        if (enc) enc.classList.remove('visible');
    },

    handleNumpad(val) {
        if (this.wordProblemInputActive) return;
        if (this.showingFeedback) return;
        if (val === 'del') {
            this.currentAnswer = this.currentAnswer.slice(0, -1);
        } else if (val === 'go') {
            if (this.currentAnswer === '') return;
            this.submitAnswer();
            return;
        } else {
            if (this.currentAnswer.length >= 5) return;
            this.currentAnswer += val;
        }
        document.getElementById('quiz-answer-display').textContent = this.currentAnswer || '\u00A0';
    },

    submitAnswer() {
        const timeMs = this.practiceMode ? 0 : (Date.now() - this.questionStartTime);
        const userAnswer = parseInt(this.currentAnswer, 10);
        const correct = userAnswer === this.currentQuestion.answer;

        this.streak = correct ? this.streak + 1 : 0;

        const assessment = AdaptiveEngine.assessAnswer(
            this.currentPlayer.id, this.currentQuestion.strategyId, correct, timeMs
        );

        // Flag incorrect questions for future retry
        if (!correct) {
            Storage.flagQuestion(this.currentPlayer.id, {
                questionText: this.currentQuestion.questionText,
                correctAnswer: this.currentQuestion.answer,
                userAnswer,
                strategyId: this.currentQuestion.strategyId,
            });
        } else {
            // Unflag if answered correctly (retry success)
            Storage.unflagQuestion(this.currentPlayer.id, this.currentQuestion.questionText);
        }

        // Check for intervention trigger (2+ wrong in a row)
        const shouldIntervene = Intervention.recordAnswer(this.currentQuestion.strategyId, correct);

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

        this.showFeedback(correct, assessment, shouldIntervene);
    },

    showFeedback(correct, assessment, shouldIntervene) {
        this.showingFeedback = true;
        const fb = document.getElementById('quiz-feedback');
        const answerEl = document.getElementById('quiz-answer-display');

        document.getElementById('quiz-streak').innerHTML = `&#x1f525; ${this.streak}`;
        fb.classList.remove('hidden', 'correct', 'incorrect');

        const mastery = assessment.newMastery || 0;
        const context = {
            correct,
            timeMs: Date.now() - this.questionStartTime,
            streak: this.streak,
            mastery,
        };

        if (correct) {
            fb.classList.add('correct');
            if (Settings.get('encouragingMessages', true)) {
                fb.textContent = Encouragement.getMessage(context);
            } else {
                let msg = pick(['Correct!', 'Well done!', 'Great job!', 'Yes!', 'Perfect!']);
                if (this.streak >= 5) msg += ` ${this.streak} in a row!`;
                fb.textContent = msg;
            }
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
                visualEl.classList.add('quiz-visual-large');
                VisualRenderer.bindInteractions(visualEl);
            }
        }

        // Avatar reaction
        this.updateAvatar(Encouragement.getMood(context));

        // Show encouragement below feedback on wrong answers
        const enc = document.getElementById('quiz-encouragement');
        if (enc && !correct && Settings.get('encouragingMessages', true)) {
            enc.textContent = Encouragement.getMessage(context);
            enc.classList.add('visible');
        }

        // Check for intervention (2+ wrong in a row on same strategy)
        if (shouldIntervene && !correct) {
            setTimeout(() => {
                Intervention.show(
                    this.currentQuestion.strategyId,
                    (stratId) => this.startPracticeMode(stratId),
                    () => { this.sessionIndex++; this.nextQuestion(); }
                );
            }, 1500);
            return;
        }

        setTimeout(() => { this.sessionIndex++; this.nextQuestion(); }, correct ? 1000 : 2500);
    },

    updateAvatar(mood) {
        const avatarEl = document.getElementById('quiz-avatar');
        if (!avatarEl) return;
        if (!Settings.get('showAvatar', true)) {
            avatarEl.classList.add('hidden');
            return;
        }
        avatarEl.classList.remove('hidden');
        avatarEl.innerHTML = Encouragement.renderAvatar(mood, 44);
        if (mood === 'excited' || mood === 'happy') {
            avatarEl.classList.add('bounce');
            setTimeout(() => avatarEl.classList.remove('bounce'), 500);
        }
    },

    quitQuiz() { this.endSession(); },

    endSession() {
        const totalCorrect = this.sessionResults.filter(r => r.correct).length;
        const totalAnswered = this.sessionResults.length;
        const avgTimeMs = totalAnswered > 0
            ? Math.round(this.sessionResults.reduce((s, r) => s + r.timeMs, 0) / totalAnswered)
            : 0;

        if (this.sessionId) {
            Storage.updateSession(this.currentPlayer.id, this.sessionId, {
                completed: true,
                endTime: new Date().toISOString(),
                totalCorrect,
                totalAnswered,
                avgTimeMs,
            });
        }

        const profile = Storage.getProfile(this.currentPlayer.id);
        Storage.updateProfile(this.currentPlayer.id, {
            totalSessions: (profile.totalSessions || 0) + 1,
        });

        // Check goals progress
        Goals.checkProgress(this.currentPlayer.id);

        // Daily challenge completion
        if (this.isDailyChallenge) {
            DailyChallenge.saveResult(this.currentPlayer.id, {
                correct: totalCorrect,
                total: totalAnswered,
                avgTime: totalAnswered > 0 ? (avgTimeMs / 1000).toFixed(1) : '0',
            });
            DailyChallenge.recordCompletion(this.currentPlayer.id);
        }

        this.practiceMode = false;
        this.isDailyChallenge = false;
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
});
