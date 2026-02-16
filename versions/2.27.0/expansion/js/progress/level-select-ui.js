// Level Selection UI
// Visual progression path showing locked/unlocked content

import { isUnlocked, getUnlockProgress, getAllLockedItems } from './progression-rules.js';
import { loadExpansionData } from '../data/expansion-storage.js';

export function renderProgressionPath(onLevelSelect, onStrategySelect, onMethodSelect) {
  const container = document.createElement('div');
  container.className = 'progression-path-container';

  const data = loadExpansionData();

  container.innerHTML = `
    <div class="card">
      <h1>Your Learning Journey 🗺️</h1>
      <p>Progress through addition and subtraction facts, then apply your skills to larger numbers!</p>
    </div>
  `;

  // Module A: Facts Section
  const factsSection = renderFactsSection(data, onStrategySelect);
  container.appendChild(factsSection);

  // Module B: Progressive Levels Section
  const levelsSection = renderLevelsSection(data, onLevelSelect);
  container.appendChild(levelsSection);

  // Methods Section
  const methodsSection = renderMethodsSection(data, onMethodSelect);
  container.appendChild(methodsSection);

  // Word Problems Section
  const wordProblemsSection = renderWordProblemsSection(data);
  container.appendChild(wordProblemsSection);

  return container;
}

function renderFactsSection(data, onStrategySelect) {
  const section = document.createElement('div');
  section.className = 'progression-section';

  section.innerHTML = `
    <h2 class="section-title">📚 Module A: Addition & Subtraction Facts</h2>
    <p class="section-description">Master mental math strategies for single-digit calculations</p>
  `;

  // Addition Facts
  const additionCard = document.createElement('div');
  additionCard.className = 'facts-group-card';
  additionCard.innerHTML = `
    <h3>➕ Addition Facts (0-12)</h3>
    <div class="facts-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${Math.round(data.additionFacts.overallFluency * 100)}%"></div>
      </div>
      <span class="progress-label">${Math.round(data.additionFacts.overallFluency * 100)}% Fluency</span>
    </div>
  `;

  const additionStrategies = document.createElement('div');
  additionStrategies.className = 'strategy-list';

  Object.keys(data.additionFacts.strategyGroups).forEach(strategyId => {
    const strategy = data.additionFacts.strategyGroups[strategyId];
    const unlockResult = getUnlockProgress(strategyId);

    const strategyItem = createStrategyItem(strategyId, strategy, unlockResult, () => {
      if (onStrategySelect && unlockResult.unlocked) {
        onStrategySelect('addition', strategyId);
      }
    });

    additionStrategies.appendChild(strategyItem);
  });

  additionCard.appendChild(additionStrategies);
  section.appendChild(additionCard);

  // Subtraction Facts
  const subtractionCard = document.createElement('div');
  subtractionCard.className = 'facts-group-card';
  subtractionCard.innerHTML = `
    <h3>➖ Subtraction Facts (0-12)</h3>
    <div class="facts-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${Math.round(data.subtractionFacts.overallFluency * 100)}%"></div>
      </div>
      <span class="progress-label">${Math.round(data.subtractionFacts.overallFluency * 100)}% Fluency</span>
    </div>
  `;

  const subtractionStrategies = document.createElement('div');
  subtractionStrategies.className = 'strategy-list';

  Object.keys(data.subtractionFacts.strategyGroups).forEach(strategyId => {
    const strategy = data.subtractionFacts.strategyGroups[strategyId];
    const unlockResult = getUnlockProgress(strategyId);

    const strategyItem = createStrategyItem(strategyId, strategy, unlockResult, () => {
      if (onStrategySelect && unlockResult.unlocked) {
        onStrategySelect('subtraction', strategyId);
      }
    });

    subtractionStrategies.appendChild(strategyItem);
  });

  subtractionCard.appendChild(subtractionStrategies);
  section.appendChild(subtractionCard);

  return section;
}

function createStrategyItem(strategyId, strategy, unlockResult, onClick) {
  const item = document.createElement('div');
  item.className = `strategy-item ${unlockResult.unlocked ? 'unlocked' : 'locked'} ${strategy.status === 'mastered' ? 'mastered' : ''}`;

  const statusIcon = strategy.status === 'mastered' ? '✓' :
                     unlockResult.unlocked ? '○' : '🔒';

  const strategyNames = {
    'counting_on': 'Counting On',
    'doubles': 'Doubles',
    'doubles_near': 'Doubles ±1',
    'doubles_near_2': 'Doubles ±2',
    'making_10': 'Making 10',
    'bridge_through_10': 'Bridge Through 10',
    'commutative': 'Commutative',
    'adding_10': 'Adding 10',
    'adding_9': 'Adding 9',
    'adding_0': 'Adding 0',
    'counting_back': 'Counting Back',
    'subtracting_0': 'Subtracting 0',
    'think_addition': 'Think Addition',
    'doubles_subtraction': 'Doubles',
    'subtract_from_10': 'Subtract from 10',
    'bridge_back_10': 'Bridge Back Through 10',
    'subtracting_10': 'Subtracting 10',
    'subtracting_9': 'Subtracting 9',
    'compensation': 'Compensation',
    'same_difference': 'Same Difference'
  };

  item.innerHTML = `
    <span class="strategy-status">${statusIcon}</span>
    <span class="strategy-name">${strategyNames[strategyId] || strategyId}</span>
    <span class="strategy-progress">${strategy.percentComplete || 0}%</span>
  `;

  if (!unlockResult.unlocked && unlockResult.prerequisites.length > 0) {
    const lockInfo = document.createElement('div');
    lockInfo.className = 'lock-info';
    lockInfo.textContent = `Requires: ${unlockResult.prerequisites[0].name}`;
    item.appendChild(lockInfo);
  }

  if (unlockResult.unlocked) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', onClick);
  }

  return item;
}

function renderLevelsSection(data, onLevelSelect) {
  const section = document.createElement('div');
  section.className = 'progression-section';

  section.innerHTML = `
    <h2 class="section-title">📈 Module B: Progressive Number Application</h2>
    <p class="section-description">Apply your skills to two-digit, three-digit, and four-digit numbers</p>
  `;

  const levelPath = document.createElement('div');
  levelPath.className = 'level-path';

  const levels = [
    { id: 'level2', name: 'Level 2', description: 'Two-digit ± Single-digit', examples: '34 + 7, 52 - 8' },
    { id: 'level3', name: 'Level 3', description: 'Two-digit ± Two-digit', examples: '47 + 35, 82 - 46' },
    { id: 'level4', name: 'Level 4', description: 'Three-digit Numbers', examples: '347 + 256, 503 - 187' },
    { id: 'level5', name: 'Level 5', description: 'Four-digit and Beyond', examples: '4,372 + 1,859' }
  ];

  levels.forEach((level, index) => {
    const levelData = data.progressiveLevels?.[level.id] || { status: 'locked', percentComplete: 0 };
    const unlockResult = getUnlockProgress(level.id);

    const levelNode = createLevelNode(level, levelData, unlockResult, () => {
      if (onLevelSelect && unlockResult.unlocked) {
        onLevelSelect(level.id);
      }
    });

    levelPath.appendChild(levelNode);

    // Add connector line (except after last level)
    if (index < levels.length - 1) {
      const connector = document.createElement('div');
      connector.className = 'level-connector';
      levelPath.appendChild(connector);
    }
  });

  section.appendChild(levelPath);
  return section;
}

function createLevelNode(level, levelData, unlockResult, onClick) {
  const node = document.createElement('div');
  node.className = `level-node ${unlockResult.unlocked ? 'unlocked' : 'locked'} ${levelData.status === 'mastered' ? 'mastered' : ''}`;

  const statusIcon = levelData.status === 'mastered' ? '✓' :
                     unlockResult.unlocked ? level.id.replace('level', '') : '🔒';

  node.innerHTML = `
    <div class="level-icon">${statusIcon}</div>
    <div class="level-content">
      <h3 class="level-name">${level.name}</h3>
      <p class="level-description">${level.description}</p>
      <p class="level-examples">${level.examples}</p>
      ${unlockResult.unlocked ? `
        <div class="level-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${levelData.percentComplete || 0}%"></div>
          </div>
          <span class="progress-label">${levelData.percentComplete || 0}% Complete</span>
        </div>
      ` : ''}
    </div>
  `;

  if (!unlockResult.unlocked && unlockResult.prerequisites.length > 0) {
    const lockInfo = document.createElement('div');
    lockInfo.className = 'level-lock-info';
    unlockResult.prerequisites.forEach(prereq => {
      const prereqItem = document.createElement('div');
      prereqItem.className = 'prerequisite-item';
      prereqItem.innerHTML = `
        <span class="prereq-name">${prereq.name}</span>
        <span class="prereq-progress">${prereq.progress}%</span>
      `;
      lockInfo.appendChild(prereqItem);
    });
    node.querySelector('.level-content').appendChild(lockInfo);
  }

  if (unlockResult.unlocked) {
    node.style.cursor = 'pointer';
    node.addEventListener('click', onClick);
    node.addEventListener('mouseenter', () => {
      node.style.transform = 'scale(1.02)';
    });
    node.addEventListener('mouseleave', () => {
      node.style.transform = 'scale(1)';
    });
  }

  return node;
}

function renderMethodsSection(data, onMethodSelect) {
  const section = document.createElement('div');
  section.className = 'progression-section';

  section.innerHTML = `
    <h2 class="section-title">🧠 Mental Math Methods</h2>
    <p class="section-description">Learn different strategies for solving multi-digit problems</p>
  `;

  const methodsGrid = document.createElement('div');
  methodsGrid.className = 'methods-grid';

  const methods = [
    { id: 'partitioning', name: 'Partitioning', icon: '🧩', description: 'Split by place value' },
    { id: 'sequencing', name: 'Sequencing', icon: '🔢', description: 'Left to right jumps' },
    { id: 'compensation_method', name: 'Compensation', icon: '🔄', description: 'Round and adjust' },
    { id: 'same_difference_method', name: 'Same Difference', icon: '⚖️', description: 'Shift both numbers' },
    { id: 'column_method', name: 'Column Method', icon: '📝', description: 'Traditional algorithm' },
    { id: 'counting_on_method', name: 'Counting On', icon: '🔢', description: 'Count up to find difference' }
  ];

  methods.forEach(method => {
    const methodData = data.methodMastery?.[method.id] || { status: 'locked', comfortLevel: 'novice' };
    const unlockResult = getUnlockProgress(method.id);

    const methodCard = createMethodCard(method, methodData, unlockResult, () => {
      if (onMethodSelect && unlockResult.unlocked) {
        onMethodSelect(method.id);
      }
    });

    methodsGrid.appendChild(methodCard);
  });

  section.appendChild(methodsGrid);
  return section;
}

function createMethodCard(method, methodData, unlockResult, onClick) {
  const card = document.createElement('div');
  card.className = `method-card ${unlockResult.unlocked ? 'unlocked' : 'locked'}`;

  card.innerHTML = `
    <div class="method-icon">${unlockResult.unlocked ? method.icon : '🔒'}</div>
    <h3 class="method-name">${method.name}</h3>
    <p class="method-description">${method.description}</p>
    ${unlockResult.unlocked ? `
      <div class="method-comfort-badge ${methodData.comfortLevel}">${formatComfortLevel(methodData.comfortLevel)}</div>
    ` : ''}
  `;

  if (!unlockResult.unlocked && unlockResult.prerequisites.length > 0) {
    const lockInfo = document.createElement('div');
    lockInfo.className = 'method-lock-info';
    lockInfo.textContent = unlockResult.prerequisites[0].name;
    card.appendChild(lockInfo);
  }

  if (unlockResult.unlocked) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', onClick);
  }

  return card;
}

function formatComfortLevel(level) {
  const labels = {
    'novice': 'New',
    'practising': 'Learning',
    'confident': 'Confident',
    'expert': 'Expert'
  };
  return labels[level] || 'New';
}

function renderWordProblemsSection(data) {
  const section = document.createElement('div');
  section.className = 'progression-section';

  const wpData = data.wordProblems || { status: 'locked' };
  const unlockResult = getUnlockProgress('word_problems');

  section.innerHTML = `
    <h2 class="section-title">📖 Word Problems</h2>
    <p class="section-description">Apply your skills to real-world situations</p>
  `;

  const wpCard = document.createElement('div');
  wpCard.className = `word-problems-card ${unlockResult.unlocked ? 'unlocked' : 'locked'}`;

  wpCard.innerHTML = `
    <div class="wp-icon">${unlockResult.unlocked ? '📖' : '🔒'}</div>
    <div class="wp-content">
      <h3>Word Problems</h3>
      <p>Solve real-world math problems with natural language</p>
      ${unlockResult.unlocked ? `
        <button class="btn btn-primary">Practice Word Problems</button>
      ` : ''}
    </div>
  `;

  if (!unlockResult.unlocked && unlockResult.prerequisites.length > 0) {
    const lockInfo = document.createElement('div');
    lockInfo.className = 'wp-lock-info';
    lockInfo.innerHTML = `<strong>Unlock by:</strong> ${unlockResult.prerequisites[0].name}`;
    wpCard.querySelector('.wp-content').appendChild(lockInfo);
  }

  if (unlockResult.unlocked) {
    wpCard.style.cursor = 'pointer';
    wpCard.querySelector('.btn').addEventListener('click', (e) => {
      e.stopPropagation();
      window.expansionApp.renderScreen('word-problems');
    });
  }

  section.appendChild(wpCard);
  return section;
}
