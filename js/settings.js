/* settings.js - App settings management with toggle UI */

const Settings = {

    DEFAULTS: {
        spacedRepetition: true,
        encouragingMessages: true,
        showAvatar: true,
        dailyChallengeReminder: true,
    },

    _key: 'mentalMaths_settings',

    getAll() {
        try {
            const raw = localStorage.getItem(this._key);
            return raw ? { ...this.DEFAULTS, ...JSON.parse(raw) } : { ...this.DEFAULTS };
        } catch {
            return { ...this.DEFAULTS };
        }
    },

    get(key, defaultVal) {
        const all = this.getAll();
        return key in all ? all[key] : (defaultVal !== undefined ? defaultVal : this.DEFAULTS[key]);
    },

    set(key, value) {
        const all = this.getAll();
        all[key] = value;
        localStorage.setItem(this._key, JSON.stringify(all));
    },

    // Teacher PIN management
    getTeacherPIN() {
        return localStorage.getItem('mentalMaths_teacherPIN') || null;
    },

    setTeacherPIN(pin) {
        localStorage.setItem('mentalMaths_teacherPIN', pin);
    },

    hasTeacherPIN() {
        return !!this.getTeacherPIN();
    },

    verifyPIN(input) {
        const stored = this.getTeacherPIN();
        if (!stored) return true; // No PIN set = open access
        return input === stored;
    },

    _firebaseStatusText(status) {
        if (!status?.enabled) return 'Cloud sync unavailable (Firebase not loaded).';
        if (!status.authReady) return 'Connecting to Firebase authentication...';
        if (!status.signedIn) return 'Not signed in. Local storage only until you log in.';
        return `Signed in as ${status.userEmail || 'account user'}. Cloud sync active.`;
    },

    // Render settings screen content
    renderSettings() {
        const settings = this.getAll();
        const syncStatus = window.FirebaseSync?.status ? window.FirebaseSync.status() : null;

        const settingsList = [
            { key: 'spacedRepetition', label: 'Spaced Repetition', desc: 'Use SM-2 algorithm to schedule strategy reviews based on your performance' },
            { key: 'encouragingMessages', label: 'Encouraging Messages', desc: 'Show motivational messages during practice' },
            { key: 'showAvatar', label: 'Show Avatar', desc: 'Display a character that reacts to your performance' },
            { key: 'dailyChallengeReminder', label: 'Daily Challenge', desc: 'Show daily challenge on home screen' },
        ];

        let html = '<div class="settings-list">';
        settingsList.forEach(s => {
            html += `
            <div class="settings-row">
                <div class="settings-info">
                    <div class="settings-label">${s.label}</div>
                    <div class="settings-desc">${s.desc}</div>
                </div>
                <label class="toggle">
                    <input type="checkbox" data-setting="${s.key}" ${settings[s.key] ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>`;
        });
        html += '</div>';

        html += `
        <div class="settings-section">
            <h3>Cloud Sync Account (Firebase)</h3>
            <div class="settings-row cloud-auth-row">
                <div class="settings-info">
                    <div class="settings-label">Sync Status</div>
                    <div class="settings-desc" id="firebase-auth-status">${this._firebaseStatusText(syncStatus)}</div>
                </div>
                <span class="cloud-auth-pill ${syncStatus?.signedIn ? 'is-online' : 'is-offline'}" id="firebase-auth-pill">${syncStatus?.signedIn ? 'Signed In' : 'Local Only'}</span>
            </div>
            <div class="cloud-auth-form" id="cloud-auth-form" ${syncStatus?.signedIn ? 'hidden' : ''}>
                <input type="email" id="firebase-email" class="cloud-auth-input" placeholder="Email" autocomplete="email">
                <input type="password" id="firebase-password" class="cloud-auth-input" placeholder="Password (6+ chars)" autocomplete="current-password">
                <div class="cloud-auth-actions">
                    <button class="btn btn-small" id="btn-firebase-sign-in">Sign In</button>
                    <button class="btn btn-small btn-primary" id="btn-firebase-sign-up">Create Account</button>
                </div>
            </div>
            <button class="btn btn-small" id="btn-firebase-sign-out" ${syncStatus?.signedIn ? '' : 'hidden'}>Sign Out</button>
        </div>`;

        // Teacher PIN section
        html += `
        <div class="settings-section">
            <h3>Teacher Dashboard</h3>
            <div class="settings-row">
                <div class="settings-info">
                    <div class="settings-label">Dashboard PIN</div>
                    <div class="settings-desc">${this.hasTeacherPIN() ? 'PIN is set. Tap to change.' : 'Set a PIN to protect the teacher dashboard.'}</div>
                </div>
                <button class="btn btn-small" id="btn-set-pin">${this.hasTeacherPIN() ? 'Change' : 'Set PIN'}</button>
            </div>
        </div>`;

        return html;
    },

    bindSettingsEvents(container) {
        container.querySelectorAll('[data-setting]').forEach(input => {
            input.addEventListener('change', () => {
                this.set(input.dataset.setting, input.checked);
            });
        });

        const setStatusText = (status, messageOverride = null) => {
            const statusEl = container.querySelector('#firebase-auth-status');
            const pillEl = container.querySelector('#firebase-auth-pill');
            const formEl = container.querySelector('#cloud-auth-form');
            const signOutBtn = container.querySelector('#btn-firebase-sign-out');
            if (!statusEl || !pillEl || !formEl || !signOutBtn) return;

            statusEl.textContent = messageOverride || this._firebaseStatusText(status);
            pillEl.textContent = status?.signedIn ? 'Signed In' : 'Local Only';
            pillEl.classList.toggle('is-online', !!status?.signedIn);
            pillEl.classList.toggle('is-offline', !status?.signedIn);
            formEl.hidden = !!status?.signedIn;
            signOutBtn.hidden = !status?.signedIn;
        };

        const readCredentials = () => {
            const email = (container.querySelector('#firebase-email')?.value || '').trim();
            const password = container.querySelector('#firebase-password')?.value || '';
            if (!email || !password) {
                throw new Error('Please enter both email and password.');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters.');
            }
            if (!window.FirebaseSync?.signIn || !window.FirebaseSync?.signUp) {
                throw new Error('Cloud auth is not ready yet. Please wait a moment and try again.');
            }
            return { email, password };
        };

        const signInBtn = container.querySelector('#btn-firebase-sign-in');
        if (signInBtn) {
            signInBtn.addEventListener('click', async () => {
                try {
                    const { email, password } = readCredentials();
                    await window.FirebaseSync.signIn(email, password);
                    setStatusText(window.FirebaseSync.status(), 'Signed in. Cloud sync is now active.');
                } catch (error) {
                    setStatusText(window.FirebaseSync.status(), `Sign-in failed: ${error.message}`);
                }
            });
        }

        const signUpBtn = container.querySelector('#btn-firebase-sign-up');
        if (signUpBtn) {
            signUpBtn.addEventListener('click', async () => {
                try {
                    const { email, password } = readCredentials();
                    await window.FirebaseSync.signUp(email, password);
                    setStatusText(window.FirebaseSync.status(), 'Account created and signed in. Cloud sync is active.');
                } catch (error) {
                    setStatusText(window.FirebaseSync.status(), `Account creation failed: ${error.message}`);
                }
            });
        }

        const signOutBtn = container.querySelector('#btn-firebase-sign-out');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                await window.FirebaseSync.signOut();
                setStatusText(window.FirebaseSync.status(), 'Signed out. Data continues saving locally.');
            });
        }

        if (window.FirebaseSync?.onStatusChange) {
            window.FirebaseSync.onStatusChange((status) => setStatusText(status));
        }

        const pinBtn = container.querySelector('#btn-set-pin');
        if (pinBtn) {
            pinBtn.addEventListener('click', () => {
                const pin = prompt('Enter a 4-digit PIN for the teacher dashboard:');
                if (pin && /^\d{4}$/.test(pin)) {
                    this.setTeacherPIN(pin);
                    alert('PIN saved!');
                    pinBtn.previousElementSibling.querySelector('.settings-desc').textContent = 'PIN is set. Tap to change.';
                    pinBtn.textContent = 'Change';
                } else if (pin !== null) {
                    alert('Please enter exactly 4 digits.');
                }
            });
        }
    },
};
