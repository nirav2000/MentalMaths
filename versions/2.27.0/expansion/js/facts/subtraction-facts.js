/**
 * Subtraction Facts Module
 * Generates subtraction problems, hints, and manages fact databases.
 */

import { SUBTRACTION_STRATEGIES } from '../expansion-config.js';
import { generateFactKey, randomInt, shuffle } from '../expansion-utils.js';
import { getAllAdditionFacts } from './addition-facts.js';

/**
 * Generates a subtraction problem for a given strategy.
 * @param {string} strategyId - Strategy identifier
 * @returns {{a: number, b: number, answer: number, factKey: string, strategy: string, hint: string}}
 */
export function generateSubtractionProblem(strategyId) {
  let a, b;

  switch (strategyId) {
    case 'counting_back':
      a = randomInt(4, 15);
      b = randomInt(1, 3);
      if (b > a) b = a;
      break;
    case 'subtracting_0':
      a = randomInt(0, 20);
      b = 0;
      break;
    case 'think_addition':
      a = randomInt(5, 20);
      b = randomInt(1, Math.min(12, a));
      break;
    case 'doubles_subtraction':
      const n = randomInt(1, 12);
      a = 2 * n;
      b = n;
      break;
    case 'subtract_from_10':
      a = 10;
      b = randomInt(1, 10);
      break;
    case 'bridge_back_10':
      a = randomInt(11, 18);
      b = randomInt(3, 9);
      if (a - b >= 10) b = a - randomInt(2, 8);
      break;
    case 'subtracting_10':
      a = randomInt(11, 22);
      b = 10;
      break;
    case 'subtracting_9':
      a = randomInt(10, 21);
      b = 9;
      break;
    case 'compensation':
      a = randomInt(11, 20);
      b = randomInt(6, 9);
      break;
    case 'same_difference':
      a = randomInt(30, 99);
      b = randomInt(20, a - 5);
      // Ensure b ends in 7, 8, or 9 for compensation
      b = Math.floor(b / 10) * 10 + randomInt(7, 9);
      if (b >= a) b = a - randomInt(7, 9);
      break;
    default:
      a = randomInt(1, 20);
      b = randomInt(0, a);
  }

  const answer = a - b;
  const factKey = generateFactKey(a, '-', b);
  const hint = generateHint(strategyId, a, b);

  return { a, b, answer, factKey, strategy: strategyId, hint };
}

/**
 * Generates a step-by-step hint for solving a subtraction problem.
 * @param {string} strategyId - Strategy identifier
 * @param {number} a - Minuend
 * @param {number} b - Subtrahend
 * @returns {string} Hint text
 */
export function generateHint(strategyId, a, b) {
  const difference = a - b;

  switch (strategyId) {
    case 'counting_back':
      const steps = [];
      for (let i = 1; i <= b; i++) {
        steps.push(a - i);
      }
      return `Start at ${a}, count back ${b}: ${a} → ${steps.join(' → ')} = ${difference}`;
    case 'subtracting_0':
      return `Subtracting 0 doesn't change the number: ${a} - 0 = ${a}`;
    case 'think_addition':
      return `Think: ${b} + ? = ${a}. So ${b} + ${difference} = ${a}, meaning ${a} - ${b} = ${difference}`;
    case 'doubles_subtraction':
      return `${a} is double ${b}, so ${a} - ${b} = ${b} (half of ${a})`;
    case 'subtract_from_10':
      return `What do you add to ${b} to make 10? ${b} + ${difference} = 10, so 10 - ${b} = ${difference}`;
    case 'bridge_back_10':
      const toTen = a - 10;
      const remainder = b - toTen;
      return `${a} - ${toTen} = 10, then 10 - ${remainder} = ${difference}`;
    case 'subtracting_10':
      return `${a} - 10 = ${difference} (the ones digit stays the same!)`;
    case 'subtracting_9':
      return `${a} - 10 = ${a - 10}, then add 1 back → ${difference}`;
    case 'compensation':
      const nearTen = Math.round(b / 10) * 10;
      const adjust = b - nearTen;
      if (adjust > 0) {
        return `${a} - ${nearTen} = ${a - nearTen}, then subtract ${adjust} more → ${difference}`;
      } else {
        return `${a} - ${nearTen} = ${a - nearTen}, then add ${Math.abs(adjust)} back → ${difference}`;
      }
    case 'same_difference':
      const adjust2 = (10 - (b % 10)) % 10;
      const newA = a + adjust2;
      const newB = b + adjust2;
      return `Add ${adjust2} to both: ${newA} - ${newB} = ${difference} (easier to calculate!)`;
    default:
      return `${a} - ${b} = ${difference}`;
  }
}

/**
 * Gets all subtraction facts derived from addition facts.
 * @returns {Array<{a: number, b: number, answer: number, factKey: string, strategy: string}>}
 */
export function getAllSubtractionFacts() {
  const facts = [];
  const additionFacts = getAllAdditionFacts();

  // Derive subtraction facts from addition facts
  additionFacts.forEach(addFact => {
    // For a + b = c, create c - b = a and c - a = b
    const sum = addFact.answer;

    // First subtraction fact: sum - b = a
    const fact1Key = generateFactKey(sum, '-', addFact.b);
    const strategy1 = determineStrategy(sum, addFact.b);
    facts.push({
      a: sum,
      b: addFact.b,
      answer: addFact.a,
      factKey: fact1Key,
      strategy: strategy1
    });

    // Second subtraction fact: sum - a = b (avoid duplicates)
    if (addFact.a !== addFact.b) {
      const fact2Key = generateFactKey(sum, '-', addFact.a);
      const strategy2 = determineStrategy(sum, addFact.a);
      facts.push({
        a: sum,
        b: addFact.a,
        answer: addFact.b,
        factKey: fact2Key,
        strategy: strategy2
      });
    }
  });

  // Remove duplicates based on factKey
  const uniqueFacts = Array.from(
    new Map(facts.map(f => [f.factKey, f])).values()
  );

  return uniqueFacts;
}

/**
 * Determines the primary strategy for a given subtraction fact.
 * @param {number} a - Minuend
 * @param {number} b - Subtrahend
 * @returns {string} Strategy ID
 */
function determineStrategy(a, b) {
  // Check strategies in teaching order
  for (const strategy of SUBTRACTION_STRATEGIES) {
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
  const allFacts = getAllSubtractionFacts();
  return allFacts.filter(fact => fact.strategy === strategyId);
}
