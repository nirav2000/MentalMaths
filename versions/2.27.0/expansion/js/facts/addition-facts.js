/**
 * Addition Facts Module
 * Generates addition problems, hints, and manages fact databases.
 */

import { ADDITION_STRATEGIES } from '../expansion-config.js';
import { generateFactKey, randomInt, shuffle } from '../expansion-utils.js';

/**
 * Generates an addition problem for a given strategy.
 * @param {string} strategyId - Strategy identifier
 * @returns {{a: number, b: number, answer: number, factKey: string, strategy: string, hint: string}}
 */
export function generateAdditionProblem(strategyId) {
  let a, b;

  switch (strategyId) {
    case 'counting_on':
      a = randomInt(4, 12);
      b = randomInt(1, 3);
      break;
    case 'doubles':
      a = randomInt(0, 12);
      b = a;
      break;
    case 'doubles_near':
      a = randomInt(2, 12);
      b = randomInt(0, 1) === 0 ? a + 1 : a - 1;
      if (b < 2) b = a + 1;
      break;
    case 'doubles_near_2':
      a = randomInt(2, 12);
      b = randomInt(0, 1) === 0 ? a + 2 : a - 2;
      if (b < 2) b = a + 2;
      break;
    case 'making_10':
      const pairs = [[1,9], [2,8], [3,7], [4,6], [5,5], [6,4], [7,3], [8,2], [9,1]];
      const pair = pairs[randomInt(0, pairs.length - 1)];
      a = pair[0];
      b = pair[1];
      break;
    case 'bridge_through_10':
      a = randomInt(6, 9);
      b = randomInt(6, 9);
      if (a + b <= 10 || a + b > 18) b = 11 - a;
      break;
    case 'commutative':
      a = randomInt(1, 8);
      b = a + randomInt(4, 8);
      if (b > 12) b = 12;
      break;
    case 'adding_10':
      a = randomInt(0, 12);
      b = 10;
      break;
    case 'adding_9':
      a = randomInt(0, 12);
      b = 9;
      break;
    case 'adding_0':
      a = randomInt(0, 12);
      b = 0;
      break;
    default:
      a = randomInt(0, 12);
      b = randomInt(0, 12);
  }

  const answer = a + b;
  const factKey = generateFactKey(a, '+', b);
  const hint = generateHint(strategyId, a, b);

  return { a, b, answer, factKey, strategy: strategyId, hint };
}

/**
 * Generates a step-by-step hint for solving an addition problem.
 * @param {string} strategyId - Strategy identifier
 * @param {number} a - First addend
 * @param {number} b - Second addend
 * @returns {string} Hint text
 */
export function generateHint(strategyId, a, b) {
  const sum = a + b;

  switch (strategyId) {
    case 'counting_on':
      return `Start at ${a}, then count up ${b}: ${a} → ${a+1}${b >= 2 ? ` → ${a+2}` : ''}${b >= 3 ? ` → ${a+3}` : ''} = ${sum}`;
    case 'doubles':
      return `Double ${a}: ${a} + ${a} = ${sum}`;
    case 'doubles_near':
      const double = Math.min(a, b);
      const diff = Math.abs(a - b);
      return `Think of ${double} + ${double} = ${double * 2}, then add ${diff} → ${sum}`;
    case 'doubles_near_2':
      const mid = (a + b) / 2;
      return `Think of ${mid} + ${mid} = ${mid * 2} (which is the same as ${a} + ${b})`;
    case 'making_10':
      return `${a} and ${b} make 10!`;
    case 'bridge_through_10':
      const toTen = 10 - a;
      const remainder = b - toTen;
      return `${a} + ${toTen} = 10, then 10 + ${remainder} = ${sum}`;
    case 'commutative':
      return `Turn it around: ${b} + ${a} = ${sum} (counting on from the larger number)`;
    case 'adding_10':
      return `${a} + 10 = ${sum} (the ones digit stays the same!)`;
    case 'adding_9':
      return `${a} + 10 = ${a + 10}, then subtract 1 → ${sum}`;
    case 'adding_0':
      return `Adding 0 doesn't change the number: ${a} + 0 = ${a}`;
    default:
      return `${a} + ${b} = ${sum}`;
  }
}

/**
 * Gets all addition facts (0+0 to 12+12) tagged with primary strategy.
 * @returns {Array<{a: number, b: number, answer: number, factKey: string, strategy: string}>}
 */
export function getAllAdditionFacts() {
  const facts = [];

  for (let a = 0; a <= 12; a++) {
    for (let b = 0; b <= 12; b++) {
      const answer = a + b;
      const factKey = generateFactKey(a, '+', b);
      const strategy = determineStrategy(a, b);
      facts.push({ a, b, answer, factKey, strategy });
    }
  }

  return facts;
}

/**
 * Determines the primary strategy for a given addition fact.
 * @param {number} a - First addend
 * @param {number} b - Second addend
 * @returns {string} Strategy ID
 */
function determineStrategy(a, b) {
  // Check strategies in teaching order
  for (const strategy of ADDITION_STRATEGIES) {
    if (strategy.factFilter(a, b)) {
      return strategy.id;
    }
  }
  return 'mixed';
}

/**
 * Gets facts filtered by strategy.
 * @param {string} strategyId - Strategy identifier
 * @returns {Array} Filtered facts array
 */
export function getFactsByStrategy(strategyId) {
  const allFacts = getAllAdditionFacts();
  return allFacts.filter(fact => fact.strategy === strategyId);
}
