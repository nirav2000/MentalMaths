import * as partitioning from './partitioning.js';
import * as sequencing from './sequencing.js';
import * as compensation from './compensation.js';
import * as sameDifference from './same-difference.js';
import * as columnMethod from './column-method.js';
import * as countingOn from './counting-on.js';

const methodModules = {
  partitioning,
  sequencing,
  compensation,
  same_difference: sameDifference,
  column: columnMethod,
  counting_on: countingOn
};

const methodMetadata = {
  partitioning: { name: 'Partitioning', description: 'Split into place values, operate, recombine', icon: '🔢', type: 'mental', difficulty: 'medium' },
  sequencing: { name: 'Sequencing', description: 'Left-to-right sequential jumps', icon: '➡️', type: 'mental', difficulty: 'easy' },
  compensation: { name: 'Compensation', description: 'Round to easier number, then adjust', icon: '⚖️', type: 'mental', difficulty: 'easy' },
  same_difference: { name: 'Same Difference', description: 'Shift both numbers equally (subtraction)', icon: '↔️', type: 'mental', difficulty: 'medium' },
  column: { name: 'Column Method', description: 'Traditional written algorithm', icon: '📝', type: 'written', difficulty: 'easy' },
  counting_on: { name: 'Counting On', description: 'Count up to find the difference', icon: '🔢', type: 'mental', difficulty: 'very_easy' }
};

function nearRound(n) {
  return Math.min(n % 10, n % 100, n % 1000, 10 - (n % 10), 100 - (n % 100), 1000 - (n % 1000));
}

function calculateSuitability(methodId, a, op, b) {
  const digits = Math.max(String(a).length, String(b).length);
  let score = 50;

  if (methodId === 'compensation') {
    const minClose = Math.min(nearRound(a), nearRound(b));
    score = minClose <= 5 ? 95 : minClose <= 10 ? 85 : minClose <= 20 ? 70 : 50;
  } else if (methodId === 'counting_on' && op === '-') {
    const diff = a - b;
    score = diff <= 5 ? 95 : diff <= 10 ? 85 : diff <= 20 ? 70 : 50;
  } else if (methodId === 'same_difference' && op === '-') {
    const bClose = nearRound(b);
    score = bClose <= 5 ? 90 : bClose <= 10 ? 80 : bClose <= 20 ? 65 : 50;
  } else if (methodId === 'column') {
    score = 60;
  } else if (methodId === 'partitioning') {
    score = digits === 2 ? 75 : digits === 3 ? 70 : 65;
  } else if (methodId === 'sequencing') {
    score = digits === 2 ? 80 : digits === 3 ? 70 : 60;
  }

  return score;
}

export function getApplicableMethods(a, op, b) {
  const applicable = [];

  for (const [methodId, module] of Object.entries(methodModules)) {
    if (module.canApply(a, op, b)) {
      const suitability = calculateSuitability(methodId, a, op, b);
      applicable.push({
        id: methodId,
        ...methodMetadata[methodId],
        module,
        suitability
      });
    }
  }

  return applicable.sort((x, y) => y.suitability - x.suitability);
}

export function getRecommendedMethod(a, op, b) {
  const methods = getApplicableMethods(a, op, b);
  return methods.length > 0 ? methods[0] : null;
}

export function getUserPreferredMethod(a, op, b, userMethodMastery) {
  const methods = getApplicableMethods(a, op, b);
  const comfortScores = { expert: 40, confident: 30, practising: 15, novice: 0 };

  for (const method of methods) {
    const m = userMethodMastery[method.id] || { comfortLevel: 'novice', accuracy: 0, timesUsed: 0 };
    const comfortScore = comfortScores[m.comfortLevel] || 0;
    const accuracyScore = m.accuracy * 20;
    const experienceScore = Math.min(m.timesUsed * 2, 20);
    method.userScore = method.suitability + comfortScore + accuracyScore + experienceScore;
  }

  methods.sort((x, y) => y.userScore - x.userScore);
  return methods.length > 0 ? methods[0] : null;
}
