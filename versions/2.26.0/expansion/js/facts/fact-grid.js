/**
 * Fact Mastery Grid
 * 13×13 interactive grid showing fact mastery with color coding.
 */

import { COLOURS } from '../expansion-config.js';
import { loadExpansionData } from '../data/expansion-storage.js';
import { getOverallFluency, initAllFacts, getFactHistory } from './fact-mastery.js';
import { generateFactKey, getInverseFacts } from '../expansion-utils.js';

let currentOperation = 'addition';

/**
 * Renders the fact mastery grid.
 * @param {HTMLElement} container - Container element
 * @param {string} operation - 'addition' or 'subtraction'
 */
export function renderFactGrid(container, operation = 'addition') {
  currentOperation = operation;
  initAllFacts(); // Ensure all facts are initialized

  container.innerHTML = '';
  container.className = 'fact-grid-container';

  // Create header with stats and toggle
  const header = createGridHeader();
  container.appendChild(header);

  // Create grid
  const grid = createGrid();
  container.appendChild(grid);

  // Create popup panel (hidden by default)
  const popup = createPopup();
  container.appendChild(popup);
}

/**
 * Creates grid header with stats and operation toggle.
 * @returns {HTMLElement} Header element
 */
function createGridHeader() {
  const data = loadExpansionData();
  const factsKey = currentOperation === 'addition' ? 'additionFacts' : 'subtractionFacts';
  const facts = Object.values(data[factsKey].individualFacts);

  const totalFacts = facts.length;
  const fluent = facts.filter(f => f.masteryLevel === 'fluent').length;
  const secure = facts.filter(f => f.masteryLevel === 'secure').length;
  const developing = facts.filter(f => f.masteryLevel === 'developing').length;
  const learning = facts.filter(f => f.masteryLevel === 'learning').length;
  const fluencyPercent = getOverallFluency(currentOperation);

  const header = document.createElement('div');
  header.className = 'grid-header';
  header.innerHTML = `
    <div class="grid-stats">
      <h2>${currentOperation === 'addition' ? 'Addition' : 'Subtraction'} Fact Mastery Grid</h2>
      <div class="stat-badges">
        <span class="stat-badge" style="background: ${COLOURS.fluent}">Fluent: ${fluent}</span>
        <span class="stat-badge" style="background: ${COLOURS.secure}">Secure: ${secure}</span>
        <span class="stat-badge" style="background: ${COLOURS.developing}">Developing: ${developing}</span>
        <span class="stat-badge" style="background: ${COLOURS.learning}">Learning: ${learning}</span>
      </div>
      <p class="fluency-score">Overall Fluency: ${fluencyPercent}% (${fluent}/${totalFacts})</p>
    </div>
    <div class="grid-controls">
      <button class="btn btn-primary" id="toggle-operation">
        Switch to ${currentOperation === 'addition' ? 'Subtraction' : 'Addition'}
      </button>
    </div>
  `;

  return header;
}

/**
 * Creates the 13×13 grid.
 * @returns {HTMLElement} Grid element
 */
function createGrid() {
  const data = loadExpansionData();
  const factsKey = currentOperation === 'addition' ? 'additionFacts' : 'subtractionFacts';
  const operator = currentOperation === 'addition' ? '+' : '−';

  const gridWrapper = document.createElement('div');
  gridWrapper.className = 'grid-wrapper';

  const table = document.createElement('table');
  table.className = 'fact-grid';

  // Header row with column numbers
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th></th>'; // Top-left corner
  for (let col = 0; col <= 12; col++) {
    headerRow.innerHTML += `<th>${col}</th>`;
  }
  table.appendChild(headerRow);

  // Data rows
  for (let row = 0; row <= 12; row++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${row}</th>`; // Row header

    for (let col = 0; col <= 12; col++) {
      const a = row;
      const b = col;
      const factKey = generateFactKey(a, operator === '+' ? '+' : '-', b);
      const mastery = data[factsKey].individualFacts[factKey];

      const td = document.createElement('td');
      td.className = 'fact-cell';
      td.dataset.factKey = factKey;
      td.dataset.a = a;
      td.dataset.b = b;

      if (mastery) {
        const color = getMasteryColor(mastery.masteryLevel);
        td.style.backgroundColor = color;
        td.innerHTML = `<span class="fact-text">${a}${operator}${b}</span>`;
      } else {
        td.style.backgroundColor = COLOURS.locked;
        td.innerHTML = `<span class="fact-text">${a}${operator}${b}</span>`;
      }

      td.addEventListener('click', () => showFactDetails(factKey, a, b));
      tr.appendChild(td);
    }

    table.appendChild(tr);
  }

  gridWrapper.appendChild(table);
  return gridWrapper;
}

/**
 * Gets color for mastery level.
 * @param {string} level - Mastery level
 * @returns {string} Color code
 */
function getMasteryColor(level) {
  switch (level) {
    case 'fluent': return COLOURS.fluent;
    case 'secure': return COLOURS.secure;
    case 'developing': return COLOURS.developing;
    case 'learning': return COLOURS.learning;
    default: return COLOURS.locked;
  }
}

/**
 * Creates popup panel for fact details.
 * @returns {HTMLElement} Popup element
 */
function createPopup() {
  const popup = document.createElement('div');
  popup.id = 'fact-popup';
  popup.className = 'fact-popup hidden';
  return popup;
}

/**
 * Shows fact details in popup.
 * @param {string} factKey - Fact key
 * @param {number} a - First operand
 * @param {number} b - Second operand
 */
function showFactDetails(factKey, a, b) {
  const mastery = getFactHistory(factKey, currentOperation);
  const popup = document.getElementById('fact-popup');

  if (!mastery) {
    popup.innerHTML = '<p>No data for this fact yet.</p><button class="btn btn-secondary" id="close-popup">Close</button>';
    popup.classList.remove('hidden');
    document.getElementById('close-popup').addEventListener('click', () => popup.classList.add('hidden'));
    return;
  }

  const accuracy = mastery.attempts > 0 ? Math.round((mastery.correct / mastery.attempts) * 100) : 0;
  const avgTime = mastery.averageTimeMs > 0 ? (mastery.averageTimeMs / 1000).toFixed(1) : 'N/A';
  const operator = currentOperation === 'addition' ? '+' : '−';
  const answer = currentOperation === 'addition' ? a + b : a - b;

  // Get inverse facts
  let inverseFacts = [];
  try {
    inverseFacts = getInverseFacts(factKey);
  } catch (e) {
    console.warn('Could not get inverse facts:', e);
  }

  popup.innerHTML = `
    <div class="popup-content">
      <h3>${a} ${operator} ${b} = ${answer}</h3>
      <div class="fact-detail">
        <p><strong>Strategy:</strong> ${mastery.strategy}</p>
        <p><strong>Mastery Level:</strong> <span style="color: ${getMasteryColor(mastery.masteryLevel)}">${mastery.masteryLevel}</span></p>
        <p><strong>Attempts:</strong> ${mastery.attempts} (${mastery.correct} correct)</p>
        <p><strong>Accuracy:</strong> ${accuracy}%</p>
        <p><strong>Average Time:</strong> ${avgTime}s</p>
        ${mastery.lastSeen ? `<p><strong>Last Practiced:</strong> ${new Date(mastery.lastSeen).toLocaleDateString()}</p>` : ''}
      </div>
      ${inverseFacts.length > 0 ? `
        <div class="inverse-facts">
          <p><strong>Linked Facts:</strong> ${inverseFacts.join(', ')}</p>
        </div>
      ` : ''}
      <button class="btn btn-secondary" id="close-popup">Close</button>
    </div>
  `;

  popup.classList.remove('hidden');
  document.getElementById('close-popup').addEventListener('click', () => popup.classList.add('hidden'));
}
