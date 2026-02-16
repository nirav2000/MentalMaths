/**
 * Remediation Engine
 * Generates incremental learning sequences for identified misunderstandings.
 */

import { getRemediationContent } from './remediation-content.js';
import { getMisunderstandingById } from './misunderstanding-tracker.js';

/**
 * Creates a remediation unit for a specific misunderstanding.
 * @param {string} misunderstandingId - ID of the misunderstanding to remediate
 * @returns {Object|null} Remediation unit object or null if not found
 */
export function createRemediationUnit(misunderstandingId) {
  const misunderstanding = getMisunderstandingById(misunderstandingId);
  if (!misunderstanding) {
    return null;
  }

  const content = getRemediationContent(misunderstandingId);
  if (!content) {
    return null;
  }

  // Check if this is placeholder content
  if (content.placeholder) {
    return {
      id: misunderstandingId,
      targetMisunderstanding: misunderstanding,
      isPlaceholder: true,
      steps: [
        {
          type: 'explain',
          text: 'Full remediation content for this misunderstanding is coming soon! In the meantime, try practicing similar problems in the main practice sections.'
        }
      ]
    };
  }

  // Build the full remediation sequence
  const steps = [];

  // Step 1: Illustrate
  if (content.illustrate) {
    steps.push({
      type: 'illustrate',
      visualType: content.illustrate.type,
      description: content.illustrate.description
    });
  }

  // Step 2: Explain
  if (content.explain) {
    steps.push({
      type: 'explain',
      text: content.explain
    });
  }

  // Step 3: Guided Practice
  if (content.guidedPractice && content.guidedPractice.length > 0) {
    steps.push({
      type: 'guided_practice',
      problems: content.guidedPractice.map(gp => ({
        problem: gp.problem,
        subSteps: gp.subSteps || []
      }))
    });
  }

  // Step 4: Independent Practice
  if (content.independentPractice && content.independentPractice.length > 0) {
    steps.push({
      type: 'independent_practice',
      problems: content.independentPractice
    });
  }

  // Step 5: Check
  if (content.check && content.check.length > 0) {
    steps.push({
      type: 'check',
      problems: content.check,
      passingScore: 0.8 // Must get 4/5 to pass
    });
  }

  return {
    id: misunderstandingId,
    targetMisunderstanding: misunderstanding,
    isPlaceholder: false,
    steps,
    currentStepIndex: 0,
    progress: {
      guidedCompleted: 0,
      independentCompleted: 0,
      checkAttempts: 0,
      lastCheckScore: null
    }
  };
}

/**
 * Validates an answer against expected answer(s).
 * @param {string} userAnswer - User's answer
 * @param {string|number|Array} expectedAnswer - Expected answer or array of acceptable answers
 * @param {Array} alternates - Optional alternate acceptable answers
 * @param {boolean} acceptAny - If true, any answer is accepted
 * @param {Object} acceptRange - If provided, accepts answers within [min, max]
 * @returns {boolean} True if answer is correct
 */
export function validateAnswer(userAnswer, expectedAnswer, alternates = [], acceptAny = false, acceptRange = null) {
  if (acceptAny) return true;

  const normalized = userAnswer.toString().toLowerCase().trim();
  const expected = expectedAnswer.toString().toLowerCase().trim();

  // Check exact match
  if (normalized === expected) return true;

  // Check alternates
  if (alternates && alternates.length > 0) {
    for (const alt of alternates) {
      if (normalized === alt.toString().toLowerCase().trim()) {
        return true;
      }
    }
  }

  // Check range (for estimation problems)
  if (acceptRange) {
    const numAnswer = parseFloat(userAnswer);
    if (!isNaN(numAnswer) && numAnswer >= acceptRange[0] && numAnswer <= acceptRange[1]) {
      return true;
    }
  }

  // Check numeric equivalence (e.g., "10" vs 10)
  const numUser = parseFloat(userAnswer);
  const numExpected = parseFloat(expectedAnswer);
  if (!isNaN(numUser) && !isNaN(numExpected) && numUser === numExpected) {
    return true;
  }

  return false;
}

/**
 * Checks if a problem requires special partition validation.
 * @param {Object} problem - Problem object
 * @returns {boolean} True if partition check needed
 */
export function requiresPartitionCheck(problem) {
  return problem.checkPartition === true;
}

/**
 * Validates a partition answer (e.g., "500+60+7" for 567).
 * @param {string} userAnswer - User's answer
 * @param {string} expectedAnswer - Expected partition format
 * @returns {boolean} True if partition is correct
 */
export function validatePartition(userAnswer, expectedAnswer) {
  // Remove spaces and normalize
  const normalized = userAnswer.replace(/\s/g, '').toLowerCase();
  const expected = expectedAnswer.replace(/\s/g, '').toLowerCase();

  // Check if they match exactly
  if (normalized === expected) return true;

  // Also accept if they evaluate to the same components
  // This is a simple check - could be enhanced
  const userParts = normalized.split('+').map(p => parseInt(p)).filter(p => !isNaN(p)).sort((a, b) => b - a);
  const expectedParts = expected.split('+').map(p => parseInt(p)).filter(p => !isNaN(p)).sort((a, b) => b - a);

  if (userParts.length !== expectedParts.length) return false;

  for (let i = 0; i < userParts.length; i++) {
    if (userParts[i] !== expectedParts[i]) return false;
  }

  return true;
}

/**
 * Gets the current step in a remediation unit.
 * @param {Object} unit - Remediation unit
 * @returns {Object|null} Current step or null
 */
export function getCurrentStep(unit) {
  if (!unit || !unit.steps || unit.currentStepIndex >= unit.steps.length) {
    return null;
  }
  return unit.steps[unit.currentStepIndex];
}

/**
 * Advances to the next step in the remediation unit.
 * @param {Object} unit - Remediation unit
 * @returns {boolean} True if advanced, false if at end
 */
export function advanceStep(unit) {
  if (unit.currentStepIndex < unit.steps.length - 1) {
    unit.currentStepIndex++;
    return true;
  }
  return false;
}

/**
 * Resets the remediation unit to the beginning.
 * @param {Object} unit - Remediation unit
 */
export function resetUnit(unit) {
  unit.currentStepIndex = 0;
  unit.progress = {
    guidedCompleted: 0,
    independentCompleted: 0,
    checkAttempts: 0,
    lastCheckScore: null
  };
}
