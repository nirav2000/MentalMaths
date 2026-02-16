/**
 * Partitioning Method (Place Value Split)
 * Splits numbers into place values, operates on each place, then recombines.
 */

/**
 * Checks if partitioning method can be applied to this problem.
 * Works for addition and subtraction with 2+ digit numbers.
 * @param {number} a - First operand
 * @param {string} op - Operation ('+' or '-')
 * @param {number} b - Second operand
 * @returns {boolean}
 */
export function canApply(a, op, b) {
  if (op !== '+' && op !== '-') return false;
  // Works for 2+ digit numbers
  return a >= 10 && b >= 10;
}

function splitIntoPlaceValues(n) {
  const digits = [];
  const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
  let multiplier = 1;
  let remaining = n;
  let placeIndex = 0;
  while (remaining > 0) {
    const digit = remaining % 10;
    const value = digit * multiplier;
    if (value > 0) digits.unshift({ place: places[placeIndex], value });
    remaining = Math.floor(remaining / 10);
    multiplier *= 10;
    placeIndex++;
  }
  return digits;
}

/**
 * Generates step-by-step solution using partitioning method.
 * @param {number} a - First operand
 * @param {string} op - Operation ('+' or '-')
 * @param {number} b - Second operand
 * @returns {Object} Solution with steps
 */
export function solve(a, op, b) {
  const problem = `${a} ${op} ${b}`;
  const steps = [];

  // Step 1: Split first number into place values
  const aParts = splitIntoPlaceValues(a);
  const aDetail = aParts.map(p => p.value).join(' + ');
  steps.push({
    description: 'Split into place values',
    detail: `${a} = ${aDetail}`,
    subSteps: aParts.map(p => p.value.toString())
  });

  // Step 2: Split second number into place values
  const bParts = splitIntoPlaceValues(b);
  const bDetail = bParts.map(p => p.value).join(' + ');
  steps.push({
    description: 'Split into place values',
    detail: `${b} = ${bDetail}`,
    subSteps: bParts.map(p => p.value.toString())
  });

  // Operate on each place value
  const placeResults = [];
  const aMap = {};
  aParts.forEach(p => { aMap[p.place] = p.value; });
  const bMap = {};
  bParts.forEach(p => { bMap[p.place] = p.value; });
  const allPlaces = [...new Set([...aParts.map(p => p.place), ...bParts.map(p => p.place)])];
  const placeOrder = ['ten-thousands', 'thousands', 'hundreds', 'tens', 'ones'];
  const sortedPlaces = allPlaces.sort((p1, p2) => placeOrder.indexOf(p1) - placeOrder.indexOf(p2));

  sortedPlaces.forEach(place => {
    const aVal = aMap[place] || 0;
    const bVal = bMap[place] || 0;
    const result = op === '+' ? aVal + bVal : aVal - bVal;
    placeResults.push({ place, result });
    steps.push({
      description: `${op === '+' ? 'Add' : 'Subtract'} ${place}`,
      detail: `${aVal} ${op} ${bVal} = ${result}`,
      input: result
    });
  });

  // Combine results
  const total = placeResults.reduce((sum, p) => sum + p.result, 0);
  const combineDetail = placeResults.map(p => p.result).join(' + ');
  let combineNote = '';
  if (placeResults.length > 2) {
    const lastTwo = placeResults.slice(-2);
    const firstParts = placeResults.slice(0, -2);
    const lastTwoSum = lastTwo[0].result + lastTwo[1].result;
    if (firstParts.length > 0) {
      const firstPartsSum = firstParts.map(p => p.result).join(' + ');
      combineNote = `${lastTwo[0].result} + ${lastTwo[1].result} = ${lastTwoSum}, then ${firstPartsSum} + ${lastTwoSum} = ${total}`;
    }
  }
  steps.push({
    description: 'Combine',
    detail: `${combineDetail} = ${total}`,
    input: total,
    note: combineNote || undefined
  });

  return {
    method: 'partitioning',
    problem,
    steps,
    answer: total
  };
}

export function getVisualData(a, op, b) {
  const aParts = splitIntoPlaceValues(a);
  const bParts = splitIntoPlaceValues(b);
  return {
    type: 'place-value-chart',
    numbers: [
      { value: a, parts: aParts },
      { value: b, parts: bParts }
    ],
    operation: op
  };
}
