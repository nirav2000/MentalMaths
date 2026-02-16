/**
 * Data Models
 * Factory functions for creating data structures used in the expansion module.
 */

/**
 * Creates a default fact mastery object.
 * @param {string} factKey - The fact key (e.g., "7+5")
 * @param {string} strategy - Strategy used for this fact
 * @returns {Object} Fact mastery object
 */
export function createFactMastery(factKey, strategy) {
  return {
    strategy: strategy,
    attempts: 0,
    correct: 0,
    averageTimeMs: 0,
    lastSeen: null,
    masteryLevel: 'learning',
    linkedFacts: [],
    mistakeHistory: []
  };
}

/**
 * Creates a session log object.
 * @param {string} module - Module name (e.g., 'addition_facts', 'level2')
 * @param {number} questionsAttempted - Number of questions attempted
 * @param {number} correct - Number of correct answers
 * @param {number} duration - Session duration in seconds
 * @returns {Object} Session log object
 */
export function createSessionLog(module, questionsAttempted, correct, duration) {
  return {
    date: new Date().toISOString(),
    module: module,
    duration: duration,
    questionsAttempted: questionsAttempted,
    correct: correct,
    accuracy: questionsAttempted > 0 ? correct / questionsAttempted : 0,
    strategies: {}
  };
}

/**
 * Creates a misunderstanding tracker object.
 * @param {string} id - Misunderstanding ID (e.g., 'always_subtracts_smaller_from_larger')
 * @param {string} detectedAt - ISO date string when detected
 * @returns {Object} Misunderstanding object
 */
export function createMisunderstanding(id, detectedAt) {
  return {
    id: id,
    detectedAt: detectedAt,
    remediationStatus: 'identified',
    remediationAttempts: 0,
    lastAttemptScore: 0,
    resolvedAt: null
  };
}

/**
 * Creates a method mastery object.
 * @param {string} methodId - Method ID (e.g., 'partitioning')
 * @returns {Object} Method mastery object
 */
export function createMethodMastery(methodId) {
  return {
    methodId: methodId,
    timesUsed: 0,
    accuracy: 0,
    avgTimeMs: 0,
    comfortLevel: 'novice',
    lastUsed: null
  };
}

/**
 * Creates a strategy group progress object.
 * @param {string} strategyId - Strategy ID
 * @returns {Object} Strategy group object
 */
export function createStrategyGroup(strategyId) {
  return {
    strategyId: strategyId,
    status: 'locked',
    percentComplete: 0,
    unlockedAt: null,
    masteredAt: null
  };
}
