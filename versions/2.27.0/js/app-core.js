/* app-core.js - Core App: state, init, navigation, events, players, home */

const App = {
    currentPlayer: null,
    currentQuestion: null,
    currentAnswer: '',
    questionStartTime: null,
    sessionQuestions: [],
    sessionIndex: 0,
    sessionResults: [],
    sessionAskedTexts: new Set(),
    streak: 0,
    sessionId: null,
    showingFeedback: false,
    hintShownForCurrent: false,
    practiceMode: false,
    isDailyChallenge: false,
    exportMenuOpen: false,
    activeSection: 'number-sense',
    isExpansionMode: false,
    selectedExpansionMethod: null,
    expansionBridge: null,

    init() {
        document.querySelectorAll('[id^="version-"]').forEach(el => {
            el.textContent = `v${APP_VERSION}`;
        });
        try { TimesTables.init(); } catch (e) { console.warn('TimesTables init failed:', e); }
        this.bindEvents();
        this.renderPlayerList();
        this.showScreen('screen-welcome');
        this.registerServiceWorker();
    },

    // ----- PWA -----

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        }
    },

    // ----- Navigation -----

    showScreen(id) {
        this.clearTransientScreenUI();
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
        this.isExpansionMode = id === 'screen-expansion';
    },

    clearTransientScreenUI() {
        const visualEl = document.getElementById('quiz-visual');
        if (visualEl) {
            visualEl.innerHTML = '';
            visualEl.classList.add('hidden');
        }

        const hintEl = document.getElementById('quiz-hint');
        if (hintEl) {
            hintEl.textContent = '';
            hintEl.classList.add('hidden');
        }

        const stepDisplayEl = document.getElementById('step-display');
        if (stepDisplayEl) {
            stepDisplayEl.innerHTML = '';
            stepDisplayEl.classList.add('hidden');
        }
    },

    handleBack() {
        if (this.isExpansionMode) {
            const expansionRoot = document.getElementById('expansion-root');
            if (window.expansionApp && expansionRoot && expansionRoot.innerHTML) {
                window.expansionApp.renderScreen('home');
            }
            this.showScreen('screen-home');
            this.renderHome();
            this.isExpansionMode = false;
            return;
        }

        if (document.getElementById('screen-method-select')?.classList.contains('active')) {
            this.showScreen('screen-home');
            this.renderHome();
            return;
        }

        if (document.getElementById('screen-quiz')?.classList.contains('active')) {
            this.quitQuiz();
            return;
        }

        if (
            document.getElementById('screen-stats')?.classList.contains('active') ||
            document.getElementById('screen-settings')?.classList.contains('active') ||
            document.getElementById('screen-goals')?.classList.contains('active') ||
            document.getElementById('screen-teacher')?.classList.contains('active') ||
            document.getElementById('screen-versions')?.classList.contains('active') ||
            document.getElementById('screen-summary')?.classList.contains('active')
        ) {
            this.showScreen(this.currentPlayer ? 'screen-home' : 'screen-welcome');
            if (this.currentPlayer) this.renderHome();
            return;
        }

        this.showScreen('screen-welcome');
    },

    async ensureExpansionBridge() {
        if (this.expansionBridge) return this.expansionBridge;

        const wordProblemModule = await import('../expansion/js/problems/word-problem-ui.js');
        this.expansionBridge = {
            renderWordProblem: wordProblemModule.renderWordProblem
        };
        return this.expansionBridge;
    },

    async loadExpansionModule() {
        const shell = document.getElementById('expansion-shell');
        if (!shell) return;

        if (shell.dataset.loaded !== 'true') {
            const response = await fetch('./expansion/expansion.html');
            const html = await response.text();
            const parsed = new DOMParser().parseFromString(html, 'text/html');

            parsed.querySelectorAll('head link[rel="stylesheet"]').forEach((link) => {
                const href = link.getAttribute('href');
                if (!href) return;
                const absoluteHref = href.startsWith('http') ? href : `./expansion/${href.replace(/^\.\//, '')}`;
                const existing = document.querySelector(`link[data-expansion-style="${absoluteHref}"]`);
                if (existing) return;
                const styleLink = document.createElement('link');
                styleLink.rel = 'stylesheet';
                styleLink.href = absoluteHref;
                styleLink.dataset.expansionStyle = absoluteHref;
                document.head.appendChild(styleLink);
            });

            const bodyNodes = [...parsed.body.children].filter((node) => node.tagName !== 'SCRIPT');
            shell.innerHTML = '';
            bodyNodes.forEach((node) => shell.appendChild(document.importNode(node, true)));

            const backLink = shell.querySelector('.back-link');
            if (backLink) {
                backLink.href = '#';
                backLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleBack();
                });
            }

            shell.dataset.loaded = 'true';
            await import('../expansion/js/expansion-app.js');
        }

        if (this.currentPlayer) {
            localStorage.setItem('mentalMathMainContext', JSON.stringify({
                playerId: this.currentPlayer.id,
                playerName: this.currentPlayer.name,
                selectedMethod: this.selectedExpansionMethod
            }));

            const expansionHeader = shell.querySelector('.expansion-header h1');
            if (expansionHeader) {
                expansionHeader.textContent = `Mental Math Expansion — ${this.currentPlayer.name}`;
            }
        }
    },

    async launchExpansion() {
        await this.loadExpansionModule();
        this.showScreen('screen-expansion');
        this.isExpansionMode = true;
        if (window.expansionApp?.renderScreen) {
            window.expansionApp.renderScreen('home');
        }
    },

    // ----- Events -----

    bindEvents() {
        // Welcome
        document.getElementById('btn-add-player').addEventListener('click', () => this.addPlayer());
        document.getElementById('new-player-name').addEventListener('keydown', e => {
            if (e.key === 'Enter') this.addPlayer();
        });
        document.getElementById('btn-teacher-dashboard').addEventListener('click', () => this.openTeacherDashboard());

        // Home
        document.getElementById('btn-back-welcome').addEventListener('click', () => {
            this.currentPlayer = null;
            this.showScreen('screen-welcome');
        });
        document.getElementById('btn-open-expansion').addEventListener('click', () => this.showMethodSelect());
        document.getElementById('btn-practice').addEventListener('click', () => {
            if (this.activeSection === 'times-tables') {
                TimesTables.ensureProgress(this.currentPlayer.id);
                const table = TimesTables.selectTable(this.currentPlayer.id);
                this.startPractice(null, { timesTable: table });
            } else {
                this.startPractice();
            }
        });
        document.getElementById('btn-stats').addEventListener('click', () => this.showStats());
        document.getElementById('btn-settings').addEventListener('click', () => this.showSettings());
        document.getElementById('btn-goals').addEventListener('click', () => this.showGoals());

        // Section tabs
        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeSection = tab.dataset.section;
                this.renderHome();
            });
        });

        // Quiz
        document.getElementById('btn-quit-quiz').addEventListener('click', () => this.handleBack());
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
        document.getElementById('btn-back-home').addEventListener('click', () => this.handleBack());
        document.getElementById('btn-export-data').addEventListener('click', () => this.toggleExportMenu());

        // Settings
        document.getElementById('btn-back-from-settings').addEventListener('click', () => this.handleBack());

        // Goals
        document.getElementById('btn-back-from-goals').addEventListener('click', () => this.handleBack());

        // Method select
        document.getElementById('btn-back-from-method-select').addEventListener('click', () => this.handleBack());

        // Teacher dashboard
        document.getElementById('btn-back-from-teacher').addEventListener('click', () => this.handleBack());

        // Version history
        document.querySelectorAll('.version-link').forEach(el => {
            el.addEventListener('click', () => this.showVersions());
        });
        document.getElementById('btn-back-from-versions').addEventListener('click', () => this.handleBack());

        // Keyboard
        document.addEventListener('keydown', e => {
            if (!document.getElementById('screen-quiz').classList.contains('active')) return;
            if (e.key >= '0' && e.key <= '9') this.handleNumpad(e.key);
            else if (e.key === 'Backspace') this.handleNumpad('del');
            else if (e.key === 'Enter') this.handleNumpad('go');
        });

        // Close export menu on outside click
        document.addEventListener('click', e => {
            if (this.exportMenuOpen && !e.target.closest('#btn-export-data') && !e.target.closest('.export-menu')) {
                this.closeExportMenu();
            }
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

    async selectPlayer(player) {
        this.currentPlayer = player;
        if (window.FirebaseSync?.isReady()) {
            try {
                await Storage.syncPlayerFromCloud(player.id);
            } catch (error) {
                console.warn('Cloud sync restore failed:', error);
            }
        }
        this.showScreen('screen-home');
        this.renderHome();
    },

    // ----- Home -----

    renderHome() {
        if (!this.currentPlayer) return;
        document.getElementById('player-greeting').textContent = `Hi, ${this.currentPlayer.name}!`;

        // Update section tab active state
        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === this.activeSection);
        });

        const homeContent = document.getElementById('home-content-area');
        const grid = document.getElementById('strategy-grid');
        const hint = document.getElementById('home-hint');

        if (this.activeSection === 'times-tables') {
            hint.textContent = 'Choose a table or auto-practice';
            homeContent.innerHTML = '';
            this.renderTimesTablesGrid(grid);
        } else {
            hint.textContent = 'Auto-selects what you need to work on';
            let html = '';

            // Daily challenge card
            if (Settings.get('dailyChallengeReminder', true)) {
                html += DailyChallenge.renderCard(this.currentPlayer.id);
            }

            // Active goals
            html += Goals.renderGoals(this.currentPlayer.id);

            homeContent.innerHTML = html;

            // Bind daily challenge click
            const dailyBtn = document.getElementById('btn-daily-challenge');
            if (dailyBtn) {
                dailyBtn.addEventListener('click', () => this.startDailyChallenge());
            }

            // Bind goal removal
            homeContent.querySelectorAll('.btn-goal-remove').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    Goals.remove(this.currentPlayer.id, btn.dataset.goalId);
                    this.renderHome();
                });
            });

            this.renderNumberSenseGrid(grid);
        }
    },

    renderNumberSenseGrid(grid) {
        grid.innerHTML = '';
        const allProg = Storage.getAllStrategyProgress(this.currentPlayer.id);

        STRATEGIES.forEach(s => {
            const prog = allProg[s.id];
            const mastery = prog?.mastery || 0;
            const unlocked = !s.unlockRequires || Storage.isTeacherUnlocked(this.currentPlayer.id, s.id) || (allProg[s.unlockRequires]?.mastery >= 50);

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

    renderTimesTablesGrid(grid) {
        grid.innerHTML = '';
        TimesTables.ensureProgress(this.currentPlayer.id);
        const tables = TimesTables.getAllTableNumbers();
        const customTables = TimesTables.getCustomTables();

        tables.forEach(n => {
            const id = TimesTables.getTableId(n);
            const prog = Storage.getStrategyProgress(this.currentPlayer.id, id);
            const mastery = prog?.mastery || 0;
            const isCustom = customTables.includes(n);
            const barColor = mastery >= 80 ? 'var(--success)' : mastery >= 40 ? 'var(--warning)' : 'var(--error)';

            const card = document.createElement('div');
            card.className = 'strategy-card';

            card.innerHTML = `
                ${isCustom ? '<span class="custom-badge">Custom</span>' : ''}
                <div class="strategy-name">${n}×</div>
                <div class="strategy-mastery">L${prog?.level || 1} · ${mastery}%</div>
                <div class="mastery-bar"><div class="mastery-bar-fill" style="width:${mastery}%;background:${barColor};"></div></div>
                ${isCustom ? '<button class="btn-remove-table" data-table="' + n + '">×</button>' : ''}
            `;
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-remove-table')) return;
                this.startPractice(null, { timesTable: n });
            });
            grid.appendChild(card);
        });

        // Bind remove buttons for custom tables
        grid.querySelectorAll('.btn-remove-table').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                TimesTables.removeCustomTable(parseInt(btn.dataset.table, 10));
                this.renderTimesTablesGrid(grid);
            });
        });

        // Add custom table card
        const addCard = document.createElement('div');
        addCard.className = 'strategy-card add-table-card';
        addCard.innerHTML = `<div class="strategy-name">+</div><div class="strategy-mastery">Custom Table</div>`;
        addCard.addEventListener('click', () => this.showAddCustomTable());
        grid.appendChild(addCard);
    },

    showAddCustomTable() {
        const overlay = document.createElement('div');
        overlay.className = 'pin-overlay';
        overlay.id = 'custom-table-overlay';
        overlay.innerHTML = `
            <div class="pin-dialog">
                <h3>Add Custom Table</h3>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">Enter a number (e.g. 25, 50, 100)</p>
                <input type="number" id="custom-table-input" min="1" max="999" inputmode="numeric" autocomplete="off"
                    style="font-size:1.5rem;text-align:center;width:100%;margin-bottom:16px;background:var(--bg-input);border:1px solid #444;border-radius:var(--radius-sm);padding:12px;color:var(--text-primary);font-family:var(--font);outline:none;">
                <div id="custom-table-error" style="color:var(--error);font-size:0.85rem;margin-bottom:12px;display:none;">Table already exists or invalid.</div>
                <div style="display:flex;gap:8px;">
                    <button class="btn" id="btn-custom-cancel" style="flex:1;">Cancel</button>
                    <button class="btn btn-primary" id="btn-custom-add" style="flex:1;">Add</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById('custom-table-input');
        input.focus();

        document.getElementById('btn-custom-cancel').addEventListener('click', () => overlay.remove());
        document.getElementById('btn-custom-add').addEventListener('click', () => {
            const n = parseInt(input.value, 10);
            if (TimesTables.addCustomTable(n)) {
                TimesTables.ensureProgress(this.currentPlayer.id);
                overlay.remove();
                this.renderHome();
            } else {
                document.getElementById('custom-table-error').style.display = 'block';
                input.value = '';
                input.focus();
            }
        });
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('btn-custom-add').click();
        });
    },
};
