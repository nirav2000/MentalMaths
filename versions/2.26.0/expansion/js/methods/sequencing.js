/**
 * Sequencing Method (Left to Right / Jump Strategy)
 * Starts at one number and adds/subtracts place values one at a time.
 */

/**
 * Checks if sequencing method can be applied to this problem.
 * Works for addition and subtraction with 2-4 digit numbers.
 * @param {number} a - First operand
 * @param {string} op - Operation ('+' or '-')
 * @param {number} b - Second operand
 * @returns {boolean}
 */
export function canApply(a, op, b) {
  if (op !== '+' && op !== '-') return false;
  // Works for 2-4 digit numbers
  return a >= 10 && a <= 9999 && b >= 10 && b <= 9999;
}

/**
 * Extracts place values from a number.
 * @param {number} n - Number to extract from
 * @returns {Array<{place: string, value: number}>}
 */
function extractPlaceValues(n) {
  const result = [];
  let remaining = n;
  let multiplier = 1;
  const places = ['ones', 'tens', 'hundreds', 'thousands'];

  while (remaining > 0) {
    const digit = remaining % 10;
    if (digit > 0) {
      result.unshift({
        place: places[Math.log10(multiplier)],
        value: digit * multiplier
      });
    }
    remaining = Math.floor(remaining / 10);
    multiplier *= 10;
  }

  return result;
}

/**
 * Generates step-by-step solution using sequencing method.
 * @param {number} a - First operand
 * @param {string} op - Operation ('+' or '-')
 * @param {number} b - Second operand
 * @returns {Object} Solution with steps
 */
export function solve(a, op, b) {
  const problem = `${a} ${op} ${b}`;
  const steps = [];

  // Step 1: Start at first number
  steps.push({
    description: 'Start at',
    detail: a.toString(),
    runningTotal: a
  });

  // Step 2+: Add/subtract each place value of second number
  const bParts = extractPlaceValues(b);
  const placeNames = {
    thousands: 'thousands',
    hundreds: 'hundreds',
    tens: 'tens',
    ones: 'ones'
  };

  let runningTotal = a;

  bParts.forEach(part => {
    const placeName = placeNames[part.place] || part.place;
    const opSign = op === '+' ? '+' : '-';

    if (op === '+') {
      runningTotal += part.value;
    } else {
      runningTotal -= part.value;
    }

    const capitalizedPlace = placeName.charAt(0).toUpperCase() + placeName.slice(1);

    steps.push({
      description: `${op === '+' ? 'Add' : 'Subtract'} ${placeName}`,
      detail: `${opSign} ${part.value} → ${runningTotal}`,
      runningTotal: runningTotal,
      input: runningTotal
    });
  });

  return {
    method: 'sequencing',
    problem,
    steps,
    answer: runningTotal
  };
}

/**
 * Returns visual data for number line rendering.
 * @param {number} a - First operand
 * @param {string} op - Operation
 * @param {number} b - Second operand
 * @returns {Object} Visual data with jump information
 */
export function getVisualData(a, op, b) {
  const bParts = extractPlaceValues(b);
  const jumps = [];
  let current = a;

  bParts.forEach(part => {
    const nextValue = op === '+' ? current + part.value : current - part.value;
    jumps.push({
      from: current,
      to: nextValue,
      label: `${op}${part.value}`,
      value: part.value
    });
    current = nextValue;
  });

  // Calculate appropriate number line range
  const allValues = [a, ...jumps.map(j => j.to)];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min;
  const padding = Math.ceil(range * 0.1);

  return {
    type: 'number-line',
    start: a,
    jumps: jumps,
    min: min - padding,
    max: max + padding,
    operation: op
  };
}
