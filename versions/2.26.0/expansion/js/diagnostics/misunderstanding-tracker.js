/**
 * Misunderstanding Tracker
 * Tracks identified misunderstandings, remediation progress, and resolution status.
 */

import { loadExpansionData, saveExpansionData } from '../data/expansion-storage.js';
import { getPatternById } from './error-patterns.js';

/**
 * Tracks a newly identified misunderstanding.
 * @param {Object} misunderstanding - Detected misunderstanding from analyseErrors
 */
export function trackMisunderstanding(misunderstanding) {
  const data = loadExpansionData();

  // Check if this misunderstanding is already tracked
  const existing = data.diagnostics.identified.find(m => m.id === misunderstanding.id);

  if (existing) {
    // Update existing entry
    existing.lastDetected = new Date().toISOString();
    existing.detectionCount = (existing.detectionCount || 1) + 1;
    existing.confidence = Math.max(existing.confidence, misunderstanding.confidence);
    existing.examples = misunderstanding.examples;
  } else {
    // Add new misunderstanding
    data.diagnostics.identified.push({
      id: misunderstanding.id,
      name: misunderstanding.name,
      description: misunderstanding.description,
      rootCause: misunderstanding.rootCause,
      category: misunderstanding.category,
      severity: misunderstanding.severity,
      prerequisites: misunderstanding.prerequisites,
      confidence: misunderstanding.confidence,
      matchCount: misunderstanding.matchCount,
      examples: misunderstanding.examples,
      detectedAt: new Date().toISOString(),
      lastDetected: new Date().toISOString(),
      detectionCount: 1,
      remediationStatus: 'identified', // identified | in_progress | resolved
      remediationAttempts: 0,
      lastAttemptScore: null,
      lastAttemptDate: null
    });
  }

  saveExpansionData(data);
}

/**
 * Gets all active misunderstandings (not resolved).
 * @param {string} category - Optional: filter by category
 * @returns {Array} Array of active misunderstandings
 */
export function getActiveMisunderstandings(category = null) {
  const data = loadExpansionData();

  let misunderstandings = data.diagnostics.identified.filter(
    m => m.remediationStatus !== 'resolved'
  );

  if (category) {
    misunderstandings = misunderstandings.filter(m => m.category === category);
  }

  return misunderstandings;
}

/**
 * Gets all misunderstandings (including resolved).
 * @returns {Object} Object with 'active' and 'resolved' arrays
 */
export function getAllMisunderstandings() {
  const data = loadExpansionData();

  const active = data.diagnostics.identified.filter(
    m => m.remediationStatus !== 'resolved'
  );

  const resolved = data.diagnostics.identified.filter(
    m => m.remediationStatus === 'resolved'
  );

  return { active, resolved };
}

/**
 * Gets a specific misunderstanding by ID.
 * @param {string} misunderstandingId - Misunderstanding ID
 * @returns {Object|null} Misunderstanding object or null
 */
export function getMisunderstandingById(misunderstandingId) {
  const data = loadExpansionData();
  return data.diagnostics.identified.find(m => m.id === misunderstandingId) || null;
}

/**
 * Updates remediation status for a misunderstanding.
 * @param {string} misunderstandingId - Misunderstanding ID
 * @param {string} status - New status: 'identified', 'in_progress', or 'resolved'
 */
export function updateRemediationStatus(misunderstandingId, status) {
  const data = loadExpansionData();

  const misunderstanding = data.diagnostics.identified.find(m => m.id === misunderstandingId);
  if (misunderstanding) {
    misunderstanding.remediationStatus = status;

    if (status === 'resolved') {
      misunderstanding.resolvedAt = new Date().toISOString();
    }

    saveExpansionData(data);
  }
}

/**
 * Records a remediation attempt.
 * @param {string} misunderstandingId - Misunderstanding ID
 * @param {number} score - Score from 0 to 1
 */
export function recordRemediationAttempt(misunderstandingId, score) {
  const data = loadExpansionData();

  const misunderstanding = data.diagnostics.identified.find(m => m.id === misunderstandingId);
  if (misunderstanding) {
    misunderstanding.remediationAttempts = (misunderstanding.remediationAttempts || 0) + 1;
    misunderstanding.lastAttemptScore = score;
    misunderstanding.lastAttemptDate = new Date().toISOString();

    // Auto-resolve if score is high enough (80%+) on 2+ attempts
    if (score >= 0.8 && misunderstanding.remediationAttempts >= 2) {
      misunderstanding.remediationStatus = 'resolved';
      misunderstanding.resolvedAt = new Date().toISOString();
    } else if (misunderstanding.remediationStatus === 'identified') {
      // Move to in_progress on first attempt
      misunderstanding.remediationStatus = 'in_progress';
    }

    saveExpansionData(data);
  }
}

/**
 * Resolves a misunderstanding manually.
 * @param {string} misunderstandingId - Misunderstanding ID
 */
export function resolveMisunderstanding(misunderstandingId) {
  updateRemediationStatus(misunderstandingId, 'resolved');
}

/**
 * Removes a resolved misunderstanding from the list.
 * @param {string} misunderstandingId - Misunderstanding ID
 */
export function dismissMisunderstanding(misunderstandingId) {
  const data = loadExpansionData();

  data.diagnostics.identified = data.diagnostics.identified.filter(
    m => m.id !== misunderstandingId
  );

  saveExpansionData(data);
}

/**
 * Gets prioritized list of misunderstandings for remediation.
 * Uses severity, confidence, and prerequisite relationships.
 * @returns {Array} Sorted array of misunderstandings (highest priority first)
 */
export function getRemediationPriority() {
  const active = getActiveMisunderstandings();

  // Calculate priority score for each misunderstanding
  const withPriority = active.map(m => {
    let priorityScore = 0;

    // Severity (1-3) - higher is more important
    priorityScore += m.severity * 10;

    // Confidence (0-1) - higher means more certain
    priorityScore += m.confidence * 5;

    // Detection count - more detections = higher priority
    priorityScore += Math.min(m.detectionCount || 1, 5);

    // Recently detected gets boost
    const daysSinceDetection = (Date.now() - new Date(m.lastDetected)) / (1000 * 60 * 60 * 24);
    if (daysSinceDetection < 7) {
      priorityScore += 3;
    }

    // In-progress status gets slight boost (continue what's started)
    if (m.remediationStatus === 'in_progress') {
      priorityScore += 2;
    }

    // Penalty for repeated failed attempts (maybe needs different approach)
    if (m.remediationAttempts > 2 && (m.lastAttemptScore || 0) < 0.5) {
      priorityScore -= 5;
    }

    return {
      ...m,
      priorityScore
    };
  });

  // Sort by priority score (highest first)
  withPriority.sort((a, b) => b.priorityScore - a.priorityScore);

  return withPriority;
}

/**
 * Gets suggested next misunderstanding to work on.
 * @returns {Object|null} Highest priority misunderstanding or null
 */
export function getNextMisunderstanding() {
  const priority = getRemediationPriority();
  return priority.length > 0 ? priority[0] : null;
}

/**
 * Checks if a misunderstanding is a prerequisite for another.
 * @param {string} prerequisiteId - Potential prerequisite ID
 * @param {string} targetId - Target misunderstanding ID
 * @returns {boolean} True if prerequisiteId is needed for targetId
 */
export function isPrerequisiteFor(prerequisiteId, targetId) {
  const target = getMisunderstandingById(targetId);
  if (!target) return false;

  return target.prerequisites && target.prerequisites.includes(prerequisiteId);
}

/**
 * Gets statistics about misunderstandings.
 * @returns {Object} Statistics object
 */
export function getMisunderstandingStats() {
  const { active, resolved } = getAllMisunderstandings();

  const byCategory = {
    addition: active.filter(m => m.category === 'addition').length,
    subtraction: active.filter(m => m.category === 'subtraction').length,
    large_numbers: active.filter(m => m.category === 'large_numbers').length
  };

  const bySeverity = {
    high: active.filter(m => m.severity === 3).length,
    medium: active.filter(m => m.severity === 2).length,
    low: active.filter(m => m.severity === 1).length
  };

  const byStatus = {
    identified: active.filter(m => m.remediationStatus === 'identified').length,
    in_progress: active.filter(m => m.remediationStatus === 'in_progress').length,
    resolved: resolved.length
  };

  return {
    totalActive: active.length,
    totalResolved: resolved.length,
    byCategory,
    bySeverity,
    byStatus,
    mostCommon: active.sort((a, b) => (b.detectionCount || 1) - (a.detectionCount || 1)).slice(0, 3)
  };
}
