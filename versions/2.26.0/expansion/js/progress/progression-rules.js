// Progression Rules
// Controls what content is locked/unlocked based on user progress

import { loadExpansionData, saveExpansionData } from '../data/expansion-storage.js';

// Unlock rules based on prerequisites
const unlockRules = {
  // Addition Facts Strategy Groups
  'counting_on': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked
  'doubles': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked
  'doubles_near': () => checkStrategyMastered('addition', 'doubles'),
  'doubles_near_2': () => checkStrategyMastered('addition', 'doubles_near'),
  'making_10': () => checkStrategyMastered('addition', 'doubles'),
  'bridge_through_10': () => checkStrategyMastered('addition', 'making_10'),
  'commutative': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked
  'adding_10': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked
  'adding_9': () => checkStrategyMastered('addition', 'adding_10'),
  'adding_0': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked

  // Subtraction Facts Strategy Groups
  'counting_back': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked
  'subtracting_0': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked
  'think_addition': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked
  'doubles_subtraction': () => checkStrategyMastered('subtraction', 'think_addition'),
  'subtract_from_10': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked
  'bridge_back_10': () => checkStrategyMastered('subtraction', 'subtract_from_10'),
  'subtracting_10': () => ({ unlocked: true, prerequisites: [] }), // Always unlocked
  'subtracting_9': () => checkStrategyMastered('subtraction', 'subtracting_10'),
  'compensation': () => checkStrategyMastered('subtraction', 'subtracting_9'),
  'same_difference': () => checkStrategyMastered('subtraction', 'compensation'),

  // Progressive Levels (Module B)
  'level2': () => checkFactsFluency(0.70, 0.60), // 70% addition, 60% subtraction fluency
  'level3': () => checkLevelMastered('level2'),
  'level4': () => checkLevelMastered('level3'),
  'level5': () => checkLevelMastered('level4'),

  // Word Problems
  'word_problems': () => checkLevelMastered('level3'), // Can start after level 3

  // Methods - available once level 2 is unlocked, but some require strategy mastery
  'partitioning': () => checkUnlocked('level2'),
  'sequencing': () => checkUnlocked('level2'),
  'compensation_method': () => {
    const level2 = checkUnlocked('level2');
    const making10 = checkStrategyMastered('addition', 'making_10');
    const adding9 = checkStrategyMastered('addition', 'adding_9');

    if (!level2.unlocked) return level2;
    if (!making10.unlocked || !adding9.unlocked) {
      return {
        unlocked: false,
        prerequisites: [
          ...level2.prerequisites,
          ...(making10.unlocked ? [] : [{ name: 'Making 10 strategy', met: false, progress: making10.prerequisites[0]?.progress || 0 }]),
          ...(adding9.unlocked ? [] : [{ name: 'Adding 9 strategy', met: false, progress: adding9.prerequisites[0]?.progress || 0 }])
        ]
      };
    }
    return { unlocked: true, prerequisites: [] };
  },
  'same_difference_method': () => checkMethodConfident('compensation_method'),
  'column_method': () => checkUnlocked('level2'),
  'counting_on_method': () => checkUnlocked('level2')
};

// Check if a strategy is mastered
function checkStrategyMastered(operation, strategyId) {
  const data = loadExpansionData();
  const factData = operation === 'addition' ? data.additionFacts : data.subtractionFacts;
  const strategy = factData.strategyGroups[strategyId];

  if (!strategy) {
    return { unlocked: false, prerequisites: [{ name: `${strategyId} strategy`, met: false, progress: 0 }] };
  }

  const mastered = strategy.status === 'mastered' || strategy.percentComplete >= 90;

  return {
    unlocked: mastered,
    prerequisites: mastered ? [] : [{
      name: `${formatStrategyName(strategyId)} strategy`,
      met: false,
      progress: strategy.percentComplete || 0
    }]
  };
}

// Check if facts fluency meets requirements
function checkFactsFluency(additionRequired, subtractionRequired) {
  const data = loadExpansionData();
  const additionFluency = data.additionFacts.overallFluency || 0;
  const subtractionFluency = data.subtractionFacts.overallFluency || 0;

  const prerequisites = [];

  if (additionFluency < additionRequired) {
    prerequisites.push({
      name: `Addition facts fluency (${Math.round(additionRequired * 100)}% needed)`,
      met: false,
      progress: Math.round((additionFluency / additionRequired) * 100)
    });
  }

  if (subtractionFluency < subtractionRequired) {
    prerequisites.push({
      name: `Subtraction facts fluency (${Math.round(subtractionRequired * 100)}% needed)`,
      met: false,
      progress: Math.round((subtractionFluency / subtractionRequired) * 100)
    });
  }

  return {
    unlocked: prerequisites.length === 0,
    prerequisites
  };
}

// Check if a level is mastered
function checkLevelMastered(levelId) {
  const data = loadExpansionData();
  const levelData = data.progressiveLevels?.[levelId];

  if (!levelData) {
    return {
      unlocked: false,
      prerequisites: [{
        name: `Complete ${formatLevelName(levelId)}`,
        met: false,
        progress: 0
      }]
    };
  }

  const mastered = levelData.status === 'mastered' || levelData.percentComplete >= 80;

  return {
    unlocked: mastered,
    prerequisites: mastered ? [] : [{
      name: `Complete ${formatLevelName(levelId)}`,
      met: false,
      progress: levelData.percentComplete || 0
    }]
  };
}

// Check if item is unlocked (generic)
function checkUnlocked(itemId) {
  if (!unlockRules[itemId]) {
    return { unlocked: true, prerequisites: [] };
  }
  return unlockRules[itemId]();
}

// Check if method is confident (user has used it successfully)
function checkMethodConfident(methodId) {
  const data = loadExpansionData();
  const methodData = data.methodMastery?.[methodId];

  if (!methodData) {
    return {
      unlocked: false,
      prerequisites: [{
        name: `Gain confidence with ${formatMethodName(methodId)}`,
        met: false,
        progress: 0
      }]
    };
  }

  const confident = methodData.comfortLevel === 'confident' || methodData.comfortLevel === 'expert';

  return {
    unlocked: confident,
    prerequisites: confident ? [] : [{
      name: `Gain confidence with ${formatMethodName(methodId)}`,
      met: false,
      progress: methodData.accuracy ? Math.round(methodData.accuracy * 100) : 0
    }]
  };
}

// Format names for display
function formatStrategyName(id) {
  const names = {
    'counting_on': 'Counting On',
    'doubles': 'Doubles',
    'doubles_near': 'Doubles Near',
    'doubles_near_2': 'Doubles ±2',
    'making_10': 'Making 10',
    'bridge_through_10': 'Bridge Through 10',
    'commutative': 'Commutative Property',
    'adding_10': 'Adding 10',
    'adding_9': 'Adding 9',
    'adding_0': 'Adding 0',
    'counting_back': 'Counting Back',
    'subtracting_0': 'Subtracting 0',
    'think_addition': 'Think Addition',
    'doubles_subtraction': 'Doubles (Subtraction)',
    'subtract_from_10': 'Subtract from 10',
    'bridge_back_10': 'Bridge Back Through 10',
    'subtracting_10': 'Subtracting 10',
    'subtracting_9': 'Subtracting 9',
    'compensation': 'Compensation',
    'same_difference': 'Same Difference'
  };
  return names[id] || id;
}

function formatLevelName(id) {
  const names = {
    'level2': 'Level 2 (Two-digit ± Single-digit)',
    'level3': 'Level 3 (Two-digit ± Two-digit)',
    'level4': 'Level 4 (Three-digit)',
    'level5': 'Level 5 (Four-digit+)'
  };
  return names[id] || id;
}

function formatMethodName(id) {
  const names = {
    'partitioning': 'Partitioning',
    'sequencing': 'Sequencing',
    'compensation_method': 'Compensation',
    'same_difference_method': 'Same Difference',
    'column_method': 'Column Method',
    'counting_on_method': 'Counting On'
  };
  return names[id] || id;
}

// Main function: check and update unlock status
export function checkUnlockStatus() {
  const data = loadExpansionData();
  let newUnlocks = [];

  // Check all addition strategies
  Object.keys(data.additionFacts.strategyGroups).forEach(strategyId => {
    const currentStatus = data.additionFacts.strategyGroups[strategyId].status;
    const unlockResult = checkUnlocked(strategyId);

    if (unlockResult.unlocked && currentStatus === 'locked') {
      data.additionFacts.strategyGroups[strategyId].status = 'unlocked';
      newUnlocks.push({ type: 'strategy', operation: 'addition', id: strategyId, name: formatStrategyName(strategyId) });
    }
  });

  // Check all subtraction strategies
  Object.keys(data.subtractionFacts.strategyGroups).forEach(strategyId => {
    const currentStatus = data.subtractionFacts.strategyGroups[strategyId].status;
    const unlockResult = checkUnlocked(strategyId);

    if (unlockResult.unlocked && currentStatus === 'locked') {
      data.subtractionFacts.strategyGroups[strategyId].status = 'unlocked';
      newUnlocks.push({ type: 'strategy', operation: 'subtraction', id: strategyId, name: formatStrategyName(strategyId) });
    }
  });

  // Check progressive levels
  if (!data.progressiveLevels) {
    data.progressiveLevels = {
      level2: { status: 'locked', percentComplete: 0 },
      level3: { status: 'locked', percentComplete: 0 },
      level4: { status: 'locked', percentComplete: 0 },
      level5: { status: 'locked', percentComplete: 0 }
    };
  }

  ['level2', 'level3', 'level4', 'level5'].forEach(levelId => {
    const currentStatus = data.progressiveLevels[levelId].status;
    const unlockResult = checkUnlocked(levelId);

    if (unlockResult.unlocked && currentStatus === 'locked') {
      data.progressiveLevels[levelId].status = 'unlocked';
      newUnlocks.push({ type: 'level', id: levelId, name: formatLevelName(levelId) });
    }
  });

  // Check word problems unlock
  if (!data.wordProblems) {
    data.wordProblems = { status: 'locked', categoriesCompleted: [] };
  }

  const wpUnlockResult = checkUnlocked('word_problems');
  if (wpUnlockResult.unlocked && data.wordProblems.status === 'locked') {
    data.wordProblems.status = 'unlocked';
    newUnlocks.push({ type: 'feature', id: 'word_problems', name: 'Word Problems' });
  }

  // Check methods
  if (!data.methodMastery) {
    data.methodMastery = {};
  }

  const methods = ['partitioning', 'sequencing', 'compensation_method', 'same_difference_method', 'column_method', 'counting_on_method'];
  methods.forEach(methodId => {
    if (!data.methodMastery[methodId]) {
      data.methodMastery[methodId] = { status: 'locked', comfortLevel: 'novice', accuracy: 0, timesUsed: 0 };
    }

    const currentStatus = data.methodMastery[methodId].status;
    const unlockResult = checkUnlocked(methodId);

    if (unlockResult.unlocked && currentStatus === 'locked') {
      data.methodMastery[methodId].status = 'unlocked';
      newUnlocks.push({ type: 'method', id: methodId, name: formatMethodName(methodId) });
    }
  });

  // Save updated data
  saveExpansionData(data);

  return newUnlocks;
}

// Check if specific item is unlocked
export function isUnlocked(itemId) {
  const result = checkUnlocked(itemId);
  return result.unlocked;
}

// Get unlock progress for specific item
export function getUnlockProgress(itemId) {
  return checkUnlocked(itemId);
}

// Get next item closest to being unlocked
export function getNextToUnlock() {
  const data = loadExpansionData();
  const candidates = [];

  // Check all locked items
  const allItems = [
    ...Object.keys(data.additionFacts.strategyGroups).map(id => ({ type: 'strategy', operation: 'addition', id })),
    ...Object.keys(data.subtractionFacts.strategyGroups).map(id => ({ type: 'strategy', operation: 'subtraction', id })),
    ...(data.progressiveLevels ? Object.keys(data.progressiveLevels).map(id => ({ type: 'level', id })) : []),
    ...(data.methodMastery ? Object.keys(data.methodMastery).map(id => ({ type: 'method', id })) : []),
    { type: 'feature', id: 'word_problems' }
  ];

  allItems.forEach(item => {
    const unlockResult = checkUnlocked(item.id);
    if (!unlockResult.unlocked && unlockResult.prerequisites.length > 0) {
      const avgProgress = unlockResult.prerequisites.reduce((sum, p) => sum + (p.progress || 0), 0) / unlockResult.prerequisites.length;
      candidates.push({
        ...item,
        name: item.type === 'strategy' ? formatStrategyName(item.id) :
              item.type === 'level' ? formatLevelName(item.id) :
              item.type === 'method' ? formatMethodName(item.id) : 'Word Problems',
        progress: avgProgress,
        prerequisites: unlockResult.prerequisites
      });
    }
  });

  // Sort by progress (highest first)
  candidates.sort((a, b) => b.progress - a.progress);

  return candidates.length > 0 ? candidates[0] : null;
}

// Get all locked items with progress
export function getAllLockedItems() {
  const data = loadExpansionData();
  const locked = [];

  // Addition strategies
  Object.keys(data.additionFacts.strategyGroups).forEach(strategyId => {
    if (data.additionFacts.strategyGroups[strategyId].status === 'locked') {
      const unlockResult = checkUnlocked(strategyId);
      if (!unlockResult.unlocked) {
        locked.push({
          type: 'strategy',
          operation: 'addition',
          id: strategyId,
          name: formatStrategyName(strategyId),
          prerequisites: unlockResult.prerequisites
        });
      }
    }
  });

  // Subtraction strategies
  Object.keys(data.subtractionFacts.strategyGroups).forEach(strategyId => {
    if (data.subtractionFacts.strategyGroups[strategyId].status === 'locked') {
      const unlockResult = checkUnlocked(strategyId);
      if (!unlockResult.unlocked) {
        locked.push({
          type: 'strategy',
          operation: 'subtraction',
          id: strategyId,
          name: formatStrategyName(strategyId),
          prerequisites: unlockResult.prerequisites
        });
      }
    }
  });

  // Levels
  if (data.progressiveLevels) {
    Object.keys(data.progressiveLevels).forEach(levelId => {
      if (data.progressiveLevels[levelId].status === 'locked') {
        const unlockResult = checkUnlocked(levelId);
        if (!unlockResult.unlocked) {
          locked.push({
            type: 'level',
            id: levelId,
            name: formatLevelName(levelId),
            prerequisites: unlockResult.prerequisites
          });
        }
      }
    });
  }

  // Word problems
  if (data.wordProblems && data.wordProblems.status === 'locked') {
    const unlockResult = checkUnlocked('word_problems');
    if (!unlockResult.unlocked) {
      locked.push({
        type: 'feature',
        id: 'word_problems',
        name: 'Word Problems',
        prerequisites: unlockResult.prerequisites
      });
    }
  }

  // Methods
  if (data.methodMastery) {
    Object.keys(data.methodMastery).forEach(methodId => {
      if (data.methodMastery[methodId].status === 'locked') {
        const unlockResult = checkUnlocked(methodId);
        if (!unlockResult.unlocked) {
          locked.push({
            type: 'method',
            id: methodId,
            name: formatMethodName(methodId),
            prerequisites: unlockResult.prerequisites
          });
        }
      }
    });
  }

  return locked;
}
