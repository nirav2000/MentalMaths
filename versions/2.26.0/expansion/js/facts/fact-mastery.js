/**
 * Fact Mastery Tracking
 * Enhanced mastery functions including spaced repetition and analytics.
 */

import { getAllAdditionFacts } from './addition-facts.js';
import { getAllSubtractionFacts } from './subtraction-facts.js';
import { loadExpansionData, saveExpansionData } from '../data/expansion-storage.js';
import { createFactMastery } from '../data/data-models.js';

/**
 * Initializes mastery entries for all facts.
 * Creates entries for facts that don't exist yet.
 */
export function initAllFacts() {
  const data = loadExpansionData();
  let updated = false;

  // Initialize addition facts
  const additionFacts = getAllAdditionFacts();
  additionFacts.forEach(fact => {
    if (!data.additionFacts.individualFacts[fact.factKey]) {
      data.additionFacts.individualFacts[fact.factKey] = createFactMastery(fact.factKey, fact.strategy);
      updated = true;
    }
  });

  // Initialize subtraction facts
  const subtractionFacts = getAllSubtractionFacts();
  subtractionFacts.forEach(fact => {
    if (!data.subtractionFacts.individualFacts[fact.factKey]) {
      data.subtractionFacts.individualFacts[fact.factKey] = createFactMastery(fact.factKey, fact.strategy);
      updated = true;
    }
  });

  if (updated) {
    saveExpansionData(data);
  }

  return data;
}

/**
 * Gets overall fluency percentage for an operation.
 * @param {string} operation - 'addition' or 'subtraction'
 * @returns {number} Percentage of facts at fluent level (0-100)
 */
export function getOverallFluency(operation = 'addition') {
  const data = loadExpansionData();
  const factsKey = operation === 'addition' ? 'additionFacts' : 'subtractionFacts';
  const facts = Object.values(data[factsKey].individualFacts);

  if (facts.length === 0) return 0;

  const fluentCount = facts.filter(f => f.masteryLevel === 'fluent').length;
  return Math.round((fluentCount / facts.length) * 100);
}

/**
 * Gets strategy completion percentage.
 * @param {string} strategyId - Strategy identifier
 * @param {string} operation - 'addition' or 'subtraction'
 * @returns {number} Percentage of facts at secure or above (0-100)
 */
export function getStrategyCompletion(strategyId, operation = 'addition') {
  const data = loadExpansionData();
  const factsKey = operation === 'addition' ? 'additionFacts' : 'subtractionFacts';
  const facts = Object.values(data[factsKey].individualFacts).filter(
    f => f.strategy === strategyId
  );

  if (facts.length === 0) return 0;

  const masteredCount = facts.filter(
    f => f.masteryLevel === 'secure' || f.masteryLevel === 'fluent'
  ).length;

  return Math.round((masteredCount / facts.length) * 100);
}

/**
 * Gets the weakest facts based on accuracy and error count.
 * @param {number} n - Number of facts to return
 * @param {string} operation - 'addition' or 'subtraction'
 * @returns {Array} Array of weak facts with details
 */
export function getWeakestFacts(n = 10, operation = 'addition') {
  const data = loadExpansionData();
  const factsKey = operation === 'addition' ? 'additionFacts' : 'subtractionFacts';
  const facts = Object.entries(data[factsKey].individualFacts)
    .map(([key, mastery]) => ({
      factKey: key,
      ...mastery,
      accuracy: mastery.attempts > 0 ? mastery.correct / mastery.attempts : 0,
      errorCount: mastery.attempts - mastery.correct
    }))
    .filter(f => f.attempts > 0)
    .sort((a, b) => {
      // Sort by accuracy first, then by error count
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.errorCount - a.errorCount;
    });

  return facts.slice(0, n);
}

/**
 * Gets fact history (recent attempts).
 * @param {string} factKey - Fact key
 * @param {string} operation - 'addition' or 'subtraction'
 * @returns {Object} Fact mastery object with history
 */
export function getFactHistory(factKey, operation = 'addition') {
  const data = loadExpansionData();
  const factsKey = operation === 'addition' ? 'additionFacts' : 'subtractionFacts';
  return data[factsKey].individualFacts[factKey] || null;
}

/**
 * Calculates next review interval using spaced repetition.
 * @param {Object} factMastery - Fact mastery object
 * @param {boolean} wasCorrect - Whether last answer was correct
 * @returns {number} Interval in days until next review
 */
export function calculateNextReview(factMastery, wasCorrect) {
  const baseInterval = 1; // 1 day minimum
  const accuracy = factMastery.attempts > 0 ? factMastery.correct / factMastery.attempts : 0;

  if (!wasCorrect) {
    return baseInterval; // Review again tomorrow
  }

  // Increase interval based on mastery level
  switch (factMastery.masteryLevel) {
    case 'fluent':
      return baseInterval * 7; // 1 week
    case 'secure':
      return baseInterval * 3; // 3 days
    case 'developing':
      return baseInterval * 2; // 2 days
    default:
      return baseInterval; // 1 day
  }
}

/**
 * Gets facts due for review based on spaced repetition.
 * @param {string} operation - 'addition' or 'subtraction'
 * @returns {Array} Array of fact keys due for review
 */
export function getFactsDueForReview(operation = 'addition') {
  const data = loadExpansionData();
  const factsKey = operation === 'addition' ? 'additionFacts' : 'subtractionFacts';
  const now = new Date();

  const dueFacts = Object.entries(data[factsKey].individualFacts)
    .filter(([key, mastery]) => {
      if (!mastery.lastSeen) return true; // Never practiced

      const lastSeen = new Date(mastery.lastSeen);
      const daysSince = (now - lastSeen) / (1000 * 60 * 60 * 24);
      const interval = calculateNextReview(mastery, mastery.attempts > 0);

      return daysSince >= interval;
    })
    .map(([key]) => key);

  return dueFacts;
}
