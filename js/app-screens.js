/* app-screens.js - Stats, export, settings, goals, teacher dashboard, versions, boot */

Object.assign(App, {

    // ----- Expansion Method Interstitial -----

    showMethodSelect() {
        const container = document.getElementById('method-select-content');
        const methods = [
            { id: 'partitioning', name: 'Partitioning', desc: 'Break numbers into place-value chunks.' },
            { id: 'compensation', name: 'Compensation', desc: 'Adjust numbers to make calculations easier.' },
            { id: 'bridging-10', name: 'Bridging Through 10', desc: 'Jump through friendly tens for speed.' },
            { id: 'mixed', name: 'Let Expansion Choose', desc: 'Auto-pick a suitable strategy per problem.' }
        ];

        container.innerHTML = `
            <p style="color: var(--text-secondary); margin-bottom: 12px;">
                Pick a method before entering the Expansion module.
            </p>
            <div class="method-select-list">
                ${methods.map((m) => `
                    <button class="btn method-select-card" data-method="${m.id}">
                        <strong>${m.name}</strong>
                        <small>${m.desc}</small>
                    </button>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('[data-method]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                this.selectedExpansionMethod = btn.dataset.method;
                await this.launchExpansion();
            });
        });

        this.showScreen('screen-method-select');
    },

    // ----- Stats -----

    showStats() {
        const pid = this.currentPlayer.id;
        const container = document.getElementById('stats-content');

        let html = '<div class="stats-tabs">';
        html += '<button class="stats-tab active" data-tab="dashboard">Dashboard</button>';
        html += '<button class="stats-tab" data-tab="goals">Goals</button>';
        html += '</div>';
        html += '<div id="stats-tab-content"></div>';

        container.innerHTML = html;

        // Tab switching
        container.querySelectorAll('.stats-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderStatsTab(tab.dataset.tab, pid);
            });
        });

        this.renderStatsTab('dashboard', pid);
        this.showScreen('screen-stats');
    },

    renderStatsTab(tab, playerId) {
        const content = document.getElementById('stats-tab-content');
        if (tab === 'dashboard') {
            content.innerHTML = StatsDashboard.render(playerId);
            StatsDashboard.bindEvents(content, playerId);
        } else if (tab === 'goals') {
            let html = Goals.renderGoalForm(playerId);
            html += Goals.renderGoals(playerId);
            html += Goals.renderCompleted(playerId);
            content.innerHTML = html;
            this.bindGoalForm(playerId, content);
        }
    },

    // ----- Export -----

    toggleExportMenu() {
        if (this.exportMenuOpen) {
            this.closeExportMenu();
            return;
        }
        const menu = document.createElement('div');
        menu.className = 'export-menu';
        menu.id = 'export-menu';
        menu.innerHTML = `
            <button class="export-menu-item" id="export-json">Export JSON</button>
            <button class="export-menu-item" id="export-csv">Export CSV</button>
            <button class="export-menu-item" id="export-pdf">Export PDF Report</button>
        `;
        document.getElementById('screen-stats').appendChild(menu);
        this.exportMenuOpen = true;

        document.getElementById('export-json').addEventListener('click', () => { this.exportJSON(); this.closeExportMenu(); });
        document.getElementById('export-csv').addEventListener('click', () => { ExportUtils.exportCSV(this.currentPlayer.id, this.currentPlayer.name); this.closeExportMenu(); });
        document.getElementById('export-pdf').addEventListener('click', () => { ExportUtils.exportPDF(this.currentPlayer.id, this.currentPlayer.name); this.closeExportMenu(); });
    },

    closeExportMenu() {
        const menu = document.getElementById('export-menu');
        if (menu) menu.remove();
        this.exportMenuOpen = false;
    },

    exportJSON() {
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

    // ----- Settings -----

    showSettings() {
        const container = document.getElementById('settings-content');
        container.innerHTML = Settings.renderSettings();
        Settings.bindSettingsEvents(container);
        this.showScreen('screen-settings');
    },

    // ----- Goals -----

    showGoals() {
        const pid = this.currentPlayer.id;
        const container = document.getElementById('goals-content');
        let html = Goals.renderGoalForm(pid);
        html += Goals.renderGoals(pid);
        html += Goals.renderCompleted(pid);
        container.innerHTML = html;
        this.bindGoalForm(pid, container);
        this.showScreen('screen-goals');
    },

    bindGoalForm(playerId, container) {
        const saveBtn = container.querySelector('#btn-save-goal');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const strategyId = container.querySelector('#goal-strategy').value;
                const targetMastery = parseInt(container.querySelector('#goal-target').value, 10);
                const deadline = container.querySelector('#goal-deadline').value || null;
                const description = container.querySelector('#goal-description').value || null;

                Goals.add(playerId, { strategyId, targetMastery, deadline, description });

                if (document.getElementById('screen-goals').classList.contains('active')) {
                    this.showGoals();
                } else {
                    this.renderStatsTab('goals', playerId);
                }
            });
        }

        container.querySelectorAll('.btn-goal-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                Goals.remove(playerId, btn.dataset.goalId);
                if (document.getElementById('screen-goals').classList.contains('active')) {
                    this.showGoals();
                } else {
                    this.renderStatsTab('goals', playerId);
                }
            });
        });
    },

    // ----- Teacher Dashboard -----

    openTeacherDashboard() {
        if (Settings.hasTeacherPIN()) {
            this.showPINDialog(() => this.renderTeacherDashboard());
        } else {
            this.renderTeacherDashboard();
        }
    },

    showPINDialog(onSuccess) {
        const overlay = document.createElement('div');
        overlay.className = 'pin-overlay';
        overlay.id = 'pin-overlay';
        overlay.innerHTML = `
            <div class="pin-dialog">
                <h3>Enter PIN</h3>
                <input type="password" id="pin-input" maxlength="4" inputmode="numeric" pattern="[0-9]*" autocomplete="off">
                <div class="pin-error" id="pin-error">Incorrect PIN. Try again.</div>
                <div style="display:flex;gap:8px;">
                    <button class="btn" id="btn-pin-cancel" style="flex:1;">Cancel</button>
                    <button class="btn btn-primary" id="btn-pin-submit" style="flex:1;">Enter</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById('pin-input');
        input.focus();

        document.getElementById('btn-pin-cancel').addEventListener('click', () => overlay.remove());
        document.getElementById('btn-pin-submit').addEventListener('click', () => {
            if (Settings.verifyPIN(input.value)) {
                overlay.remove();
                onSuccess();
            } else {
                document.getElementById('pin-error').style.display = 'block';
                input.value = '';
                input.focus();
            }
        });
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('btn-pin-submit').click();
        });
    },

    renderTeacherDashboard() {
        const container = document.getElementById('teacher-content');
        container.innerHTML = TeacherDashboard.render();
        TeacherDashboard.bindEvents(container);
        this.showScreen('screen-teacher');
    },

    // ----- Version History -----

    showVersions() {
        const container = document.getElementById('versions-content');
        let html = '';
        VERSION_HISTORY.forEach(v => {
            html += `
            <div class="version-entry${v.current ? ' current' : ''}">
                <div class="version-entry-header">
                    <div>
                        <span class="version-number">v${v.version}</span>
                        ${v.current ? '<span class="version-badge">Current</span>' : ''}
                    </div>
                    <span class="version-date">${v.date}</span>
                </div>
                <div class="version-title">${v.title}</div>
                <ul class="version-changes">
                    ${v.changes.map(c => `<li>${c}</li>`).join('')}
                </ul>
                ${!v.current ? `<span class="version-archive-link" onclick="window.open('versions/${v.version}/index.html','_blank')">Open archived v${v.version}</span>` : ''}
            </div>`;
        });
        container.innerHTML = html;
        this.showScreen('screen-versions');
    },
});

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
