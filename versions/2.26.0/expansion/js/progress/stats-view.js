// Stats View - Progress Dashboard Rendering
// Displays comprehensive progress analytics

import { loadExpansionData } from '../data/expansion-storage.js';
import { getSessionStats, getSessionHistory } from './session-logger.js';
import { COLOURS, MASTERY_LEVELS } from '../expansion-config.js';
import { getAllMisunderstandings } from '../diagnostics/misunderstanding-tracker.js';

export function renderProgressDashboard() {
  const container = document.createElement('div');
  container.className = 'progress-dashboard';

  const data = loadExpansionData();
  const stats = getSessionStats();

  container.innerHTML = '<div class="progress-header"><h2>Your Progress</h2></div>';

  container.appendChild(renderSummaryCards(stats));
  container.appendChild(renderFactFluency(data));
  container.appendChild(renderLevelProgress(data));
  container.appendChild(renderMethodProficiency(data));
  container.appendChild(renderMisunderstandingTimeline());
  container.appendChild(renderRecentSessions());

  return container;
}

function renderSummaryCards(stats) {
  const section = document.createElement('div');
  section.className = 'summary-cards';

  const cards = [
    { label: 'Practice Sessions', value: stats.totalSessions, icon: '📚' },
    { label: 'Questions Answered', value: stats.totalQuestions.toLocaleString(), icon: '✍️' },
    { label: 'Overall Accuracy', value: `${Math.round(stats.overallAccuracy * 100)}%`, icon: '🎯' },
    { label: 'Current Streak', value: `${stats.streakDays} day${stats.streakDays !== 1 ? 's' : ''}`, icon: '🔥' }
  ];

  section.innerHTML = cards.map(c => `
    <div class="summary-card">
      <div class="card-icon">${c.icon}</div>
      <div class="card-content">
        <div class="card-value">${c.value}</div>
        <div class="card-label">${c.label}</div>
      </div>
    </div>
  `).join('');

  return section;
}

function renderFactFluency(data) {
  const section = document.createElement('div');
  section.className = 'progress-section';
  section.innerHTML = '<h3>Fact Fluency</h3>';

  const addFluency = calculateFluency(data.additionFacts?.individualFacts || {});
  const subFluency = calculateFluency(data.subtractionFacts?.individualFacts || {});

  section.appendChild(createProgressBar('Addition Facts', addFluency, COLOURS.fluent));
  section.appendChild(createProgressBar('Subtraction Facts', subFluency, COLOURS.fluent));

  return section;
}

function calculateFluency(facts) {
  const keys = Object.keys(facts);
  if (keys.length === 0) return 0;
  const fluent = keys.filter(k =>
    facts[k].accuracy >= MASTERY_LEVELS.fluent.minAcc &&
    facts[k].avgTime <= MASTERY_LEVELS.fluent.maxTime
  ).length;
  return fluent / keys.length;
}

function createProgressBar(label, value, color) {
  const bar = document.createElement('div');
  bar.className = 'progress-bar-container';
  const pct = Math.round(value * 100);
  bar.innerHTML = `
    <div class="progress-bar-label">
      <span>${label}</span>
      <span class="progress-percentage">${pct}%</span>
    </div>
    <div class="progress-bar-track">
      <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
    </div>
  `;
  return bar;
}

function renderLevelProgress(data) {
  const section = document.createElement('div');
  section.className = 'progress-section';
  section.innerHTML = '<h3>Level Progress</h3>';

  const levels = [
    { id: 'level1', name: 'Single Digit', icon: '1️⃣' },
    { id: 'level2', name: 'Two-Digit ± Single', icon: '2️⃣' },
    { id: 'level3', name: 'Two-Digit ± Two-Digit', icon: '3️⃣' },
    { id: 'level4', name: 'Three-Digit', icon: '4️⃣' },
    { id: 'level5', name: 'Four-Digit+', icon: '5️⃣' },
    { id: 'level6', name: 'Mixed Operations', icon: '🔀' },
    { id: 'level7', name: 'Word Problems', icon: '📖' }
  ];

  const grid = document.createElement('div');
  grid.className = 'level-grid';
  grid.innerHTML = levels.map(l => {
    const unlocked = data.unlockedLevels?.includes(l.id) || l.id === 'level1';
    return `
      <div class="level-card ${unlocked ? 'unlocked' : 'locked'}">
        <div class="level-icon">${l.icon}</div>
        <div class="level-name">${l.name}</div>
        <div class="level-status">${unlocked ? '✓' : '🔒'}</div>
      </div>
    `;
  }).join('');

  section.appendChild(grid);
  return section;
}

function renderMethodProficiency(data) {
  const section = document.createElement('div');
  section.className = 'progress-section';
  section.innerHTML = '<h3>Method Proficiency</h3>';

  const methods = {
    partitioning: { name: 'Partitioning', icon: '🧩' },
    sequencing: { name: 'Sequencing', icon: '➡️' },
    compensation: { name: 'Compensation', icon: '🔄' },
    same_difference: { name: 'Same Difference', icon: '⚖️' },
    column: { name: 'Column Method', icon: '📝' },
    counting_on: { name: 'Counting On', icon: '🔢' }
  };

  const chart = document.createElement('div');
  chart.className = 'method-chart';
  chart.innerHTML = Object.entries(methods).map(([id, info]) => {
    const acc = (data.methods?.[id]?.accuracy || 0) * 100;
    return `
      <div class="method-bar">
        <div class="method-label">
          <span class="method-icon">${info.icon}</span>
          <span>${info.name}</span>
        </div>
        <div class="method-bar-track">
          <div class="method-bar-fill" style="width: ${acc}%"></div>
        </div>
        <div class="method-accuracy">${Math.round(acc)}%</div>
      </div>
    `;
  }).join('');

  section.appendChild(chart);
  return section;
}

function renderMisunderstandingTimeline() {
  const section = document.createElement('div');
  section.className = 'progress-section';
  section.innerHTML = '<h3>Misunderstanding Timeline</h3>';

  const { active, resolved } = getAllMisunderstandings();
  const issues = [...active, ...resolved].sort((a, b) =>
    new Date(b.detectedAt || 0) - new Date(a.detectedAt || 0)
  );

  if (issues.length === 0) {
    section.innerHTML += '<p class="empty-state">No misunderstandings identified yet. Keep practicing!</p>';
    return section;
  }

  const timeline = document.createElement('div');
  timeline.className = 'misunderstanding-timeline';
  timeline.innerHTML = issues.map(m => {
    const icon = m.remediationStatus === 'resolved' ? '✅' :
                 m.remediationStatus === 'in_progress' ? '⏳' : '🔍';
    const status = m.remediationStatus === 'resolved' ? 'Resolved' :
                   m.remediationStatus === 'in_progress' ? 'Working on it' : 'Identified';
    return `
      <div class="timeline-item ${m.remediationStatus}">
        <div class="timeline-marker">${icon}</div>
        <div class="timeline-content">
          <div class="timeline-title">${m.name}</div>
          <div class="timeline-date">${formatDate(m.detectedAt)}</div>
          <div class="timeline-status">${status}</div>
        </div>
      </div>
    `;
  }).join('');

  section.appendChild(timeline);
  return section;
}

function renderRecentSessions() {
  const section = document.createElement('div');
  section.className = 'progress-section';
  section.innerHTML = '<h3>Recent Sessions</h3>';

  const sessions = getSessionHistory(10);
  if (sessions.length === 0) {
    section.innerHTML += '<p class="empty-state">No practice sessions yet. Start practicing to see your progress!</p>';
    return section;
  }

  const list = document.createElement('div');
  list.className = 'session-list';
  list.innerHTML = sessions.map(s => {
    const accClass = s.accuracy >= 0.8 ? 'high' : s.accuracy >= 0.6 ? 'medium' : 'low';
    const module = {
      addition_facts: 'Addition Facts',
      subtraction_facts: 'Subtraction Facts',
      level_practice: 'Level Practice',
      word_problems: 'Word Problems',
      diagnostic: 'Diagnostic Quiz'
    }[s.module] || s.module;

    return `
      <div class="session-item">
        <div class="session-date">${formatDate(s.date)}</div>
        <div class="session-module">${module}</div>
        <div class="session-stats">
          <span class="session-questions">${s.questionsAttempted} questions</span>
          <span class="session-accuracy ${accClass}">${Math.round(s.accuracy * 100)}%</span>
          <span class="session-duration">${formatDuration(s.duration)}</span>
        </div>
      </div>
    `;
  }).join('');

  section.appendChild(list);
  return section;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const dateOnly = date.toISOString().split('T')[0];

  if (dateOnly === today) return 'Today';
  if (dateOnly === yesterday) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}
