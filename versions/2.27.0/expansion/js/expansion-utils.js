/**
 * Expansion Utilities
 * Shared helper functions for the mental math expansion module.
 */

import { MASTERY_LEVELS } from './expansion-config.js';

/**
 * Determines mastery level based on accuracy and average time.
 * @param {number} accuracy - Accuracy as a decimal (0-1)
 * @param {number} avgTimeMs - Average response time in milliseconds
 * @returns {string} Mastery level: 'learning', 'developing', 'secure', or 'fluent'
 */
export function getMasteryLevel(accuracy, avgTimeMs) {
  if (accuracy >= MASTERY_LEVELS.fluent.minAcc && avgTimeMs <= MASTERY_LEVELS.fluent.maxTime) {
    return 'fluent';
  }
  if (accuracy >= MASTERY_LEVELS.secure.minAcc && avgTimeMs <= MASTERY_LEVELS.secure.maxTime) {
    return 'secure';
  }
  if (accuracy >= MASTERY_LEVELS.developing.minAcc && avgTimeMs <= MASTERY_LEVELS.developing.maxTime) {
    return 'developing';
  }
  return 'learning';
}

/**
 * Generates a unique key for a math fact.
 * @param {number} a - First operand
 * @param {string} op - Operation ('+' or '-')
 * @param {number} b - Second operand
 * @returns {string} Fact key (e.g., "7+5" or "12-5")
 */
export function generateFactKey(a, op, b) {
  return `${a}${op}${b}`;
}

/**
 * Parses a fact key into its components.
 * @param {string} key - Fact key (e.g., "7+5" or "12-5")
 * @returns {{a: number, op: string, b: number}} Parsed components
 */
export function parseFactKey(key) {
  const match = key.match(/^(\d+)([\+\-])(\d+)$/);
  if (!match) {
    throw new Error(`Invalid fact key: ${key}`);
  }
  return {
    a: parseInt(match[1], 10),
    op: match[2],
    b: parseInt(match[3], 10)
  };
}

/**
 * Gets inverse facts for a given fact key.
 * For addition: 7+5 → [5+7, 12-5, 12-7]
 * For subtraction: 12-5 → [12-7, 7+5, 5+7]
 * @param {string} factKey - The fact key
 * @returns {string[]} Array of inverse fact keys
 */
export function getInverseFacts(factKey) {
  const { a, op, b } = parseFactKey(factKey);
  const inverseFacts = [];

  if (op === '+') {
    const sum = a + b;
    // Commutative swap
    if (a !== b) {
      inverseFacts.push(generateFactKey(b, '+', a));
    }
    // Subtraction inverses
    inverseFacts.push(generateFactKey(sum, '-', b));
    inverseFacts.push(generateFactKey(sum, '-', a));
  } else if (op === '-') {
    const result = a - b;
    // Addition inverses
    inverseFacts.push(generateFactKey(b, '+', result));
    inverseFacts.push(generateFactKey(result, '+', b));
    // Related subtraction
    if (result !== b) {
      inverseFacts.push(generateFactKey(a, '-', result));
    }
  }

  return inverseFacts;
}

/**
 * Checks if a number is near a round number.
 * @param {number} n - Number to check
 * @param {number} threshold - Maximum distance from round number (default: 3)
 * @returns {boolean} True if near a round number
 */
export function isNearRoundNumber(n, threshold = 3) {
  const remainder = n % 10;
  return remainder <= threshold || remainder >= (10 - threshold);
}

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffles an array and returns a new shuffled copy.
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled copy of the array
 */
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Formats a number with commas for thousands.
 * @param {number} n - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
