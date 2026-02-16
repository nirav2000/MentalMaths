# Mental Maths — App Guide

An adaptive number-sense and times-tables training app for children. Designed for tablets and phones, works offline as a PWA.

---

## Getting Started

1. **Open `index.html`** in a browser (or install as a PWA from the browser menu)
2. **Add a player** — type a name and tap **+**
3. **Tap the player name** to enter the home screen
4. **Tap Practice** to start a session, or tap any strategy/table card directly

---

## Home Screen Sections

The home screen has two sections, controlled by the **tab bar** at the top:

| Tab | What it contains |
|---|---|
| **Number Sense** | 12 addition/subtraction strategies with visual aids and scaffolded difficulty |
| **Times Tables** | Multiplication and division fact tables 1–20, plus custom tables |

Tap a tab to switch. The **Practice** button auto-selects the best strategy or table to work on in whichever section is active.

---

## Number Sense Strategies

The 12 strategies are taught in a progression. Some start unlocked; others require a prerequisite strategy to reach 50% mastery before they unlock.

| # | Strategy | Short Name | Description | Unlocks After |
|---|---|---|---|---|
| 1 | One More, One Less | +1 / -1 | Add or subtract 1 | — |
| 2 | Know About 0 | ± 0 | Adding or subtracting 0 changes nothing | — |
| 3 | Two More, Two Less | +2 / -2 | Add or subtract 2 | +1 / -1 at 50% |
| 4 | Five and a Bit | 5 + ? | Numbers 6–9 are 5 and a bit | — |
| 5 | Number Neighbours | Neighbours | Adjacent numbers differ by 1 or 2 | +2 / -2 at 50% |
| 6 | Doubles & Near Doubles | Doubles | Double a number, then adjust by 1 | +1 / -1 at 50% |
| 7 | Number 10 Fact Families | 10 Facts | Pairs that add to 10 | — |
| 8 | 7 Tree & 9 Square | 7 & 9 | Visual images for 7 and 9 families | 5 + ? at 50% |
| 9 | Swap It | Swap | Order of addends doesn't matter | — |
| 10 | Ten and a Bit | 10 + ? | Numbers 11–20 are 10 and a bit | 10 Facts at 50% |
| 11 | Make Ten and Then... | Make 10 | Cross the 10 boundary by making 10 first | 10 + ? at 50% |
| 12 | Adjust It | Adjust | Calculate by adjusting from a known fact | Make 10 at 50% |

Teachers can also manually unlock any locked strategy from the Teacher Dashboard.

---

## Times Tables

Tables 1 through 20 are built in. Each table generates multiplication and division questions.

**Custom tables** — Tap the **+** card at the end of the grid to add any number (e.g. 25, 50, 100). Custom tables can be removed by tapping the **×** on their card.

### Times Table Level Progression

| Level | Multiplier Range | Operations |
|---|---|---|
| **L1** | × 1 to × 5 | Multiplication only |
| **L2** | × 1 to × 10 | Multiplication only |
| **L3** | × 1 to × 12 | Multiplication + division (40% chance) |
| **L4** | × 1 to × 15 | Mixed multiplication and division |
| **L5** | × 1 to × 20 | Mixed, full range |

---

## Levels & Mastery — What L1, L2, etc. Mean

Every strategy and times table tracks two key metrics: **Level** (L1–L5) and **Mastery** (0–100%).

### How Mastery Works

- **Correct answers** increase mastery: +8 if fast (under 3s), +4 if moderate (under 8s), +2 if slow
- **Streaks** of 5+ correct in a row give a +2 bonus
- **Wrong answers** decrease mastery by 8
- Mastery is displayed as a percentage on each card and in stats

### How Levels Work

Levels control the difficulty of questions generated (bigger numbers, harder operations):

| Level | Meaning | Promotion | Demotion |
|---|---|---|---|
| **L1** | Beginner — small numbers, simple operations | — | — |
| **L2** | Developing — slightly larger numbers | Reach 80% mastery at L1 | Drop below 30% at L2 |
| **L3** | Intermediate — wider range, new operations | Reach 80% mastery at L2 | Drop below 30% at L3 |
| **L4** | Advanced — larger numbers, mixed types | Reach 80% mastery at L3 | Drop below 30% at L4 |
| **L5** | Expert — full range, speed focus | Reach 80% mastery at L4 | Drop below 30% at L5 |

When you **level up**, mastery resets to 60% (a fresh start at the harder level). When you **level down**, mastery resets to 50%.

### Card Display

Each card on the home screen shows: `L2 · 65%` meaning Level 2 with 65% mastery at that level.

The mastery bar colour indicates overall status:
- **Green** — 80%+ (strong)
- **Orange** — 40–79% (developing)
- **Red** — below 40% (needs attention)

---

## Quiz Sessions

Each session is **10 questions**. During a session you'll see:

- **Strategy/table name** at the top
- **Progress** (e.g. "3 / 10")
- **Streak counter** showing consecutive correct answers
- **Visual aids** and **hints** shown automatically when struggling
- **Avatar** that reacts to your performance (can be toggled in Settings)
- **Encouraging messages** after correct and incorrect answers

### How Auto-Practice Selects What to Work On

When you tap **Practice** without selecting a specific card, the engine picks the strategy/table where you'll benefit most, based on:

1. **Mastery deficit** — lower mastery = higher priority
2. **Recency** — strategies not practised recently get priority
3. **Spaced repetition** (if enabled) — SM-2 algorithm schedules reviews

---

## Adaptive Features

### Spaced Repetition (SM-2)

When enabled in Settings, the app uses the SM-2 algorithm to schedule strategy reviews. Performance quality is rated 0–5 based on correctness and response time:

| Quality | Meaning |
|---|---|
| 5 | Correct, fast (under 3s) |
| 4 | Correct, moderate (under 8s) |
| 3 | Correct, slow (under 15s) |
| 2 | Correct, very slow |
| 1 | Incorrect |

The algorithm adjusts review intervals and ease factors to optimise long-term retention.

### Strategy Intervention

If you get **2+ wrong in a row** on the same strategy, an intervention popup appears with:
- A worked example explaining the strategy
- The option to enter **Practice Mode** (no timer, for stress-free learning)
- Or skip and continue the session

### Flagged Questions

Incorrect answers are automatically flagged for retry. In future sessions, up to 2 flagged questions are mixed in to reinforce weak areas. Answering them correctly removes the flag.

---

## Stats & Progress Dashboard

Access via the chart icon on the home screen. The dashboard shows:

- **Overview** — total sessions, questions, accuracy, correct answers
- **Focus Area** — your weakest strategy highlighted for attention
- **Accuracy by Strategy** — bar chart comparing all strategies
- **Speed by Strategy** — average response times per strategy
- **Improvement Over Time** — line charts of accuracy and speed across sessions
- **Strategy Progress** — each strategy with level, mastery %, avg time, and sparkline. Tap to expand and see **question history**: every variation asked, how many times, correctness rate, and average time
- **Times Tables** — same detail for times table progress (appears after first practice)
- **Flagged for Review** — questions you've gotten wrong that are queued for retry
- **Recent Sessions** — tap to expand and see every question, answer, and response time
- **Goals** — active goals with progress bars

---

## Goals

Set goals from the Stats screen (Goals tab) or the dedicated Goals screen:

- Choose a **strategy** to target
- Set a **target mastery %**
- Optionally set a **deadline** and **description**
- Progress bars track how close you are
- Completed goals are archived and displayed separately

---

## Daily Challenge

A card on the home screen (Number Sense section) offers **"Today's 10 Questions"** — a consistent daily challenge using seeded randomisation so every player gets the same questions that day. Completing it tracks your streak of consecutive days.

---

## Teacher / Parent Dashboard

Access from the Welcome screen. Optionally protected by a 4-digit PIN (set in Settings).

### Features

- **Student overview cards** — mastery, accuracy, sessions, questions per student
- **Status badges** — Struggling / Developing / Good based on overall mastery
- **Strategy comparison chart** — compare all students' performance on any strategy
- **Needs Attention alerts** — students below 40% mastery flagged automatically
- **Manage Modules** — select a student and toggle-unlock locked strategies. Strategies earned through mastery show as "Earned" (cannot be re-locked). Teachers can unlock any locked strategy for a student.

---

## Settings

Accessible via the gear icon on the home screen:

| Setting | Default | Description |
|---|---|---|
| Spaced Repetition | On | Use SM-2 algorithm for strategy scheduling |
| Encouraging Messages | On | Show motivational messages during quizzes |
| Show Avatar | On | Display animated character during quizzes |
| Daily Challenge | On | Show daily challenge card on home screen |
| Dashboard PIN | None | Set a 4-digit PIN for the teacher dashboard |

---

## Data & Export

All data is stored locally in the browser (localStorage). No server or account required.

### Export Options (from Stats screen)

- **JSON** — full data dump including profile, progress, sessions, question logs, flagged questions, teacher unlocks
- **CSV** — tabular format for spreadsheet analysis
- **PDF** — formatted report for printing or sharing

---

## Offline / PWA Support

The app works fully offline once loaded. It can be installed as a Progressive Web App:

1. Open in Chrome/Safari
2. Use "Add to Home Screen" or the install prompt
3. The app caches all files via a service worker

---

## Version History

Tap the version number at the bottom of any screen to view the full changelog and access archived versions of the app.

---

## Technical Notes

- Pure HTML/CSS/JS — no frameworks or build tools
- SVG-based charts (no external chart libraries)
- localStorage-based data layer following a Firestore-like path structure
- Module pattern: `App` object split across `app-core.js`, `app-quiz.js`, `app-screens.js` using `Object.assign`
- Service worker with cache-first strategy for offline support

---

## One-click testing

Run the browser-driven smoke suite with (test tooling only; the app itself remains vanilla client-side JS):

```bash
./testing/run-smoke.sh
```

### Prerequisites

- Node.js 18+ (used only to run smoke tooling, not by the app at runtime)
- Smoke assertions execute against real in-browser DOM/UI behavior (vanilla client-side JS app runtime)
- No Python files are used for testing; the local static server is Node-based.
- Test dependencies installed once:

```bash
cd testing && npm install
```

### Expected output format

The command drives the app UI in a real browser session (main app and expansion routes) and prints a concise pass/fail report grouped into:

- **Core**
- **Expansion**
- **Regression**

Each line includes a test case ID (for example `CORE-001`) and status (`PASS`/`FAIL`). The process exits with code `0` when all checks pass, and non-zero when any check fails (CI-friendly behavior).
