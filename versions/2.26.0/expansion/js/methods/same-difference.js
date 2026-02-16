/**
 * Same Difference Method (for Subtraction)
 * Adds the same amount to both numbers to make subtraction easier.
 * The difference between two numbers stays the same when you shift both by the same amount.
 */

/**
 * Finds the nearest round number for the subtrahend and calculates adjustment.
 * @param {number} n - Number to round
 * @returns {Object} { rounded, adjustment }
 */
function findNearestRound(n) {
  const bases = [10, 100, 1000, 10000];
  let bestRound = null;
  let minAdjustment = Infinity;

  for (const base of bases) {
    const lower = Math.floor(n / base) * base;
    const upper = Math.ceil(n / base) * base;

    // Prefer rounding up to make subtraction easier
    if (lower > 0 && n - lower < minAdjustment) {
      minAdjustment = n - lower;
      bestRound = { rounded: lower, adjustment: lower - n };
    }

    if (upper - n < minAdjustment) {
      minAdjustment = upper - n;
      bestRound = { rounded: upper, adjustment: upper - n };
    }
  }

  return bestRound;
}

/**
 * Checks if same difference method is applicable.
 * Only works for subtraction where subtrahend is near a round number.
 * @param {number} a - First operand (minuend)
 * @param {string} op - Operation (must be '-')
 * @param {number} b - Second operand (subtrahend)
 * @returns {boolean}
 */
export function canApply(a, op, b) {
  if (op !== '-') return false;

  const bRound = findNearestRound(b);
  // Subtrahend should be within 20 of a round number
  return bRound && Math.abs(bRound.adjustment) <= 20;
}

/**
 * Generates step-by-step solution using same difference method.
 * @param {number} a - First operand (minuend)
 * @param {string} op - Operation (must be '-')
 * @param {number} b - Second operand (subtrahend)
 * @returns {Object} Solution with steps
 */
export function solve(a, op, b) {
  const problem = `${a} ${op} ${b}`;
  const steps = [];

  // Find nearest round number for subtrahend
  const bRound = findNearestRound(b);
  const adjustment = bRound.adjustment;

  // Step 1: State the goal
  steps.push({
    description: 'Goal',
    detail: `Make ${b} into a round number to subtract easily`
  });

  // Step 2: Calculate the adjustment
  const adjustmentAbs = Math.abs(adjustment);
  steps.push({
    description: 'Adjustment',
    detail: `Add ${adjustmentAbs} to both numbers (${b} + ${adjustmentAbs} = ${bRound.rounded})`,
    input: adjustmentAbs,
    note: 'Adding the same to both numbers keeps the difference the same'
  });

  // Step 3: Show the new problem
  const newMinuend = a + adjustment;
  steps.push({
    description: 'New problem',
    detail: `${newMinuend} - ${bRound.rounded}`,
    input: newMinuend
  });

  // Step 4: Do the easy subtraction
  const answer = newMinuend - bRound.rounded;
  steps.push({
    description: 'Easy subtraction',
    detail: `${newMinuend} - ${bRound.rounded} = ${answer}`,
    input: answer
  });

  // Step 5: Add explanation
  steps.push({
    description: 'Why this works',
    detail: `The gap between two numbers stays the same if you shift both by the same amount`,
    note: `Think of a number line: if you move both numbers ${adjustmentAbs} units right, the distance between them doesn't change`
  });

  return {
    method: 'same_difference',
    problem,
    steps,
    answer
  };
}

/**
 * Returns visual data for bar model representation.
 * @param {number} a - First operand (minuend)
 * @param {string} op - Operation
 * @param {number} b - Second operand (subtrahend)
 * @returns {Object} Visual data
 */
export function getVisualData(a, op, b) {
  const bRound = findNearestRound(b);
  const adjustment = Math.abs(bRound.adjustment);
  const newMinuend = a + bRound.adjustment;

  return {
    type: 'bar-model',
    original: {
      minuend: a,
      subtrahend: b,
      difference: a - b
    },
    adjusted: {
      minuend: newMinuend,
      subtrahend: bRound.rounded,
      difference: newMinuend - bRound.rounded
    },
    shift: adjustment,
    explanation: 'Both numbers shifted by same amount → difference stays equal'
  };
}
