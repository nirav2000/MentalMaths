/**
 * Expansion Storage
 * localStorage wrapper for managing expansion module user progress data.
 */

import { createFactMastery } from './data-models.js';
import { getMasteryLevel } from '../expansion-utils.js';

const STORAGE_KEY = 'mentalMathExpansion';

/**
 * Creates default expansion data structure.
 * @returns {Object} Default user progress object
 */
function createDefaultData() {
  return {
    version: '2.25.0',
    additionFacts: {
      strategyGroups: {
        counting_on: { status: 'unlocked', percentComplete: 0 },
        doubles: { status: 'unlocked', percentComplete: 0 },
        doubles_near: { status: 'unlocked', percentComplete: 0 },
        doubles_near_2: { status: 'unlocked', percentComplete: 0 },
        making_10: { status: 'unlocked', percentComplete: 0 },
        bridge_through_10: { status: 'locked', percentComplete: 0 },
        commutative: { status: 'locked', percentComplete: 0 },
        adding_10: { status: 'locked', percentComplete: 0 },
        adding_9: { status: 'locked', percentComplete: 0 },
        adding_0: { status: 'locked', percentComplete: 0 }
      },
      individualFacts: {},
      overallAccuracy: 0,
      overallFluency: 0
    },
    subtractionFacts: {
      strategyGroups: {
        counting_back: { status: 'unlocked', percentComplete: 0 },
        subtracting_0: { status: 'unlocked', percentComplete: 0 },
        think_addition: { status: 'unlocked', percentComplete: 0 },
        doubles_subtraction: { status: 'unlocked', percentComplete: 0 },
        subtract_from_10: { status: 'unlocked', percentComplete: 0 },
        bridge_back_10: { status: 'locked', percentComplete: 0 },
        subtracting_10: { status: 'locked', percentComplete: 0 },
        subtracting_9: { status: 'locked', percentComplete: 0 },
        compensation: { status: 'locked', percentComplete: 0 },
        same_difference: { status: 'locked', percentComplete: 0 }
      },
      individualFacts: {},
      overallAccuracy: 0,
      overallFluency: 0
    },
    progressiveLevels: {
      level1: { status: 'unlocked', percentComplete: 0 },
      level2: { status: 'locked', percentComplete: 0 },
      level3: { status: 'locked', percentComplete: 0 },
      level4: { status: 'locked', percentComplete: 0 },
      level5: { status: 'locked', percentComplete: 0 },
      level6: { status: 'locked', percentComplete: 0 },
      level7: { status: 'locked', percentComplete: 0 }
    },
    methods: {},
    diagnostics: {
      identified: [],
      resolved: []
    },
    sessions: [],
    lastAccessed: new Date().toISOString()
  };
}

/**
 * Loads expansion data from localStorage or creates default.
 * @returns {Object} User progress data
 */
export function loadExpansionData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      data.lastAccessed = new Date().toISOString();
      return data;
    }
  } catch (error) {
    console.error('Error loading expansion data:', error);
  }
  return createDefaultData();
}

/**
 * Saves expansion data to localStorage.
 * @param {Object} data - User progress data to save
 */
export function saveExpansionData(data) {
  try {
    data.lastAccessed = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving expansion data:', error);
  }
}

/**
 * Gets mastery data for a specific fact.
 * @param {string} factKey - The fact key (e.g., "7+5")
 * @returns {Object|null} Mastery object or null if not found
 */
export function getFactMastery(factKey) {
  const data = loadExpansionData();
  const operation = factKey.includes('+') ? 'additionFacts' : 'subtractionFacts';
  return data[operation].individualFacts[factKey] || null;
}

/**
 * Updates mastery data for a fact after a practice attempt.
 * @param {string} factKey - The fact key
 * @param {boolean} wasCorrect - Whether the answer was correct
 * @param {number} timeMs - Response time in milliseconds
 */
export function updateFactMastery(factKey, wasCorrect, timeMs) {
  const data = loadExpansionData();
  const operation = factKey.includes('+') ? 'additionFacts' : 'subtractionFacts';

  // Get or create fact mastery record
  let factMastery = data[operation].individualFacts[factKey];
  if (!factMastery) {
    factMastery = createFactMastery(factKey, 'unknown');
    data[operation].individualFacts[factKey] = factMastery;
  }

  // Update statistics
  factMastery.attempts++;
  if (wasCorrect) {
    factMastery.correct++;
  } else {
    // Track mistake (we don't have the incorrect answer here, so use placeholder)
    factMastery.mistakeHistory.push(`error_${Date.now()}`);
    // Keep only last 10 mistakes
    if (factMastery.mistakeHistory.length > 10) {
      factMastery.mistakeHistory.shift();
    }
  }

  // Update average time (rolling average)
  const newWeight = 0.3; // Weight for new time
  if (factMastery.averageTimeMs === 0) {
    factMastery.averageTimeMs = timeMs;
  } else {
    factMastery.averageTimeMs =
      (factMastery.averageTimeMs * (1 - newWeight)) + (timeMs * newWeight);
  }

  // Update mastery level
  const accuracy = factMastery.correct / factMastery.attempts;
  factMastery.masteryLevel = getMasteryLevel(accuracy, factMastery.averageTimeMs);
  factMastery.lastSeen = new Date().toISOString();

  // Update overall statistics
  const allFacts = Object.values(data[operation].individualFacts);
  if (allFacts.length > 0) {
    const totalCorrect = allFacts.reduce((sum, f) => sum + f.correct, 0);
    const totalAttempts = allFacts.reduce((sum, f) => sum + f.attempts, 0);
    data[operation].overallAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    const fluentCount = allFacts.filter(f => f.masteryLevel === 'fluent').length;
    data[operation].overallFluency = fluentCount / allFacts.length;
  }

  saveExpansionData(data);
}
