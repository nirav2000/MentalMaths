function getDigits(n) {
  return String(n).split('').reverse().map(d => parseInt(d));
}

function getPlaceName(i) {
  return ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten-thousands'][i] || `10^${i}`;
}

export function canApply(a, op, b) {
  return (op === '+' || op === '-') && (a >= 10 || b >= 10);
}

export function solve(a, op, b) {
  return op === '+' ? solveAddition(a, b, `${a} ${op} ${b}`) : solveSubtraction(a, b, `${a} ${op} ${b}`);
}

function solveAddition(a, b, problem) {
  const steps = [];
  const digitsA = getDigits(a);
  const digitsB = getDigits(b);
  const maxLen = Math.max(digitsA.length, digitsB.length);
  let carry = 0;
  const result = [];

  for (let i = 0; i < maxLen || carry > 0; i++) {
    const dA = digitsA[i] || 0;
    const dB = digitsB[i] || 0;
    const sum = dA + dB + carry;
    const written = sum % 10;
    const newCarry = Math.floor(sum / 10);
    const carryText = carry > 0 ? ` + ${carry}(carry)` : '';

    steps.push({
      description: `${getPlaceName(i)} column`,
      detail: `${dA} + ${dB}${carryText} = ${sum}`,
      carry: newCarry,
      written: written,
      note: newCarry > 0 ? `Write ${written}, carry ${newCarry}` : `Write ${written}`
    });

    result.push(written);
    carry = newCarry;
  }

  return {
    method: 'column',
    problem,
    steps,
    answer: parseInt(result.reverse().join(''))
  };
}

function solveSubtraction(a, b, problem) {
  const steps = [];
  const digitsA = getDigits(a);
  const digitsB = getDigits(b);
  const maxLen = Math.max(digitsA.length, digitsB.length);
  const working = [...digitsA];
  while (working.length < maxLen) working.push(0);
  const result = [];

  for (let i = 0; i < maxLen; i++) {
    const dB = digitsB[i] || 0;
    let dA = working[i];

    if (dA < dB) {
      steps.push({
        description: `${getPlaceName(i)}: ${dA} - ${dB}`,
        detail: `Cannot do ${dA} - ${dB}, need to borrow`,
        borrow: true
      });

      let borrowIdx = i + 1;
      while (borrowIdx < working.length && working[borrowIdx] === 0) borrowIdx++;

      if (borrowIdx >= working.length) {
        return {
          method: 'column',
          problem,
          steps: [...steps, { description: 'Error', detail: 'Cannot borrow - result would be negative' }],
          answer: null,
          error: 'Cannot subtract - first number is smaller'
        };
      }

      working[borrowIdx]--;

      if (borrowIdx > i + 1) {
        const chain = [];
        for (let j = borrowIdx; j > i; j--) {
          chain.push(`${getPlaceName(j)}: ${working[j] + (j === borrowIdx ? 1 : 0)}→${working[j]}`);
          if (j > i + 1) working[j - 1] = 10;
        }
        working[i] += 10;
        steps.push({
          description: 'Chain borrow',
          detail: chain.join(', then ') + `, ${getPlaceName(i)}: ${dA}→${working[i]}`,
          note: 'Borrow through the zeros'
        });
      } else {
        working[i] += 10;
        steps.push({
          description: `Borrow from ${getPlaceName(i + 1)}`,
          detail: `${getPlaceName(i + 1)}: ${working[i + 1] + 1}→${working[i + 1]}, ${getPlaceName(i)}: ${dA}→${working[i]}`,
          note: `Borrow 1 from ${getPlaceName(i + 1)}`
        });
      }
      dA = working[i];
    }

    const diff = dA - dB;
    steps.push({
      description: `${getPlaceName(i)}: ${dA} - ${dB} = ${diff}`,
      written: diff
    });
    result.push(diff);
  }

  while (result.length > 1 && result[result.length - 1] === 0) result.pop();

  return {
    method: 'column',
    problem,
    steps,
    answer: parseInt(result.reverse().join(''))
  };
}

export function getVisualData(a, op, b) {
  const digitsA = getDigits(a);
  const digitsB = getDigits(b);
  const maxLen = Math.max(digitsA.length, digitsB.length);
  const columns = [];
  for (let i = 0; i < maxLen; i++) {
    columns.push({
      place: getPlaceName(i),
      digitA: digitsA[i] || 0,
      digitB: digitsB[i] || 0,
      placeValue: Math.pow(10, i)
    });
  }
  return {
    type: 'place-value-chart',
    operation: op,
    columns: columns.reverse(),
    showCarryBorrow: true
  };
}
