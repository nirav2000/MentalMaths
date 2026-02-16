function findRoundingTarget(n) {
  const bases = [10, 100, 1000, 10000];
  let bestRound = null;
  let minAdjustment = Infinity;
  for (const base of bases) {
    const lower = Math.floor(n / base) * base;
    const upper = Math.ceil(n / base) * base;
    if (lower > 0 && n - lower < minAdjustment) {
      minAdjustment = n - lower;
      bestRound = { rounded: lower, adjustment: n - lower, direction: 'down' };
    }
    if (upper - n < minAdjustment) {
      minAdjustment = upper - n;
      bestRound = { rounded: upper, adjustment: upper - n, direction: 'up' };
    }
  }
  return bestRound;
}

export function canApply(a, op, b) {
  if (op !== '+' && op !== '-') return false;
  const aRound = findRoundingTarget(a);
  const bRound = findRoundingTarget(b);
  return (aRound && aRound.adjustment <= 20) || (bRound && bRound.adjustment <= 20);
}

export function solve(a, op, b) {
  const problem = `${a} ${op} ${b}`;
  const steps = [];
  const aRound = findRoundingTarget(a);
  const bRound = findRoundingTarget(b);

  const isFirstOperand = aRound.adjustment < bRound.adjustment;
  const targetNum = isFirstOperand ? a : b;
  const otherNum = isFirstOperand ? b : a;
  const targetRound = isFirstOperand ? aRound : bRound;

  steps.push({
    description: 'Identify near-round number',
    detail: `${targetNum} is close to ${targetRound.rounded} (${targetRound.adjustment} ${targetRound.direction === 'up' ? 'more' : 'less'})`
  });

  const roundedResult = op === '+'
    ? otherNum + targetRound.rounded
    : isFirstOperand
      ? targetRound.rounded - otherNum
      : otherNum - targetRound.rounded;

  const roundedProblem = op === '+'
    ? `${otherNum} + ${targetRound.rounded}`
    : isFirstOperand
      ? `${targetRound.rounded} - ${otherNum}`
      : `${otherNum} - ${targetRound.rounded}`;

  steps.push({
    description: 'Use the round number',
    detail: `${roundedProblem} = ${roundedResult}`,
    input: roundedResult
  });

  let adjustmentOp, finalAnswer, note;
  if (op === '+') {
    if (targetRound.direction === 'up') {
      adjustmentOp = '-';
      finalAnswer = roundedResult - targetRound.adjustment;
      note = `We added ${targetRound.adjustment} too many → subtract it back`;
    } else {
      adjustmentOp = '+';
      finalAnswer = roundedResult + targetRound.adjustment;
      note = `We added ${targetRound.adjustment} too few → add it back`;
    }
  } else {
    if (isFirstOperand) {
      if (targetRound.direction === 'up') {
        adjustmentOp = '-';
        finalAnswer = roundedResult - targetRound.adjustment;
        note = `We started ${targetRound.adjustment} higher → subtract it`;
      } else {
        adjustmentOp = '+';
        finalAnswer = roundedResult + targetRound.adjustment;
        note = `We started ${targetRound.adjustment} lower → add it`;
      }
    } else {
      if (targetRound.direction === 'up') {
        adjustmentOp = '+';
        finalAnswer = roundedResult + targetRound.adjustment;
        note = `We subtracted ${targetRound.adjustment} too many → add it back`;
      } else {
        adjustmentOp = '-';
        finalAnswer = roundedResult - targetRound.adjustment;
        note = `We subtracted ${targetRound.adjustment} too few → subtract more`;
      }
    }
  }

  steps.push({
    description: 'Adjust for the rounding',
    detail: `We ${targetRound.direction === 'up' ? 'added' : 'subtracted'} ${targetRound.adjustment} ${targetRound.direction === 'up' ? 'extra' : 'less'}`,
    note: note
  });

  steps.push({
    description: 'Final answer',
    detail: `${roundedResult} ${adjustmentOp} ${targetRound.adjustment} = ${finalAnswer}`,
    input: finalAnswer
  });

  return {
    method: 'compensation',
    problem,
    steps,
    answer: finalAnswer
  };
}

export function getVisualData(a, op, b) {
  const aRound = findRoundingTarget(a);
  const bRound = findRoundingTarget(b);
  const targetNum = aRound.adjustment < bRound.adjustment ? a : b;
  const targetRound = aRound.adjustment < bRound.adjustment ? aRound : bRound;
  return {
    type: 'number-line',
    original: { a, op, b },
    rounded: targetNum,
    roundedTo: targetRound.rounded,
    adjustment: targetRound.adjustment,
    direction: targetRound.direction
  };
}
