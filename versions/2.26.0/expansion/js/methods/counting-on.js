/**
 * Counting On Method (for Subtraction)
 * Counts up from the subtrahend to the minuend, tracking jumps.
 * Best for subtraction where the difference is small.
 */

function findNextRoundNumber(n, max) {
  const bases = [10, 100, 1000, 10000];

  for (const base of bases) {
    const next = Math.ceil(n / base) * base;
    if (next > n && next <= max) {
      return next;
    }
  }

  return max;
}

export function canApply(a, op, b) {
  if (op !== '-') return false;
  if (b >= a) return false;

  const diff = a - b;
  return diff < 20 || (a - b) / Math.max(a, 1) < 0.1;
}

export function solve(a, op, b) {
  const problem = `${a} ${op} ${b}`;
  const steps = [];

  if (b >= a) {
    return {
      method: 'counting_on',
      problem,
      steps: [{
        description: 'Error',
        detail: 'Cannot subtract - result would be zero or negative'
      }],
      answer: a - b
    };
  }

  let current = b;
  const jumps = [];

  steps.push({
    description: 'Start counting from',
    detail: `Begin at ${b} and count up to ${a}`,
    note: 'Track each jump to find the total difference'
  });

  while (current < a) {
    const nextRound = findNextRoundNumber(current, a);

    if (nextRound < a) {
      const jump = nextRound - current;
      jumps.push(jump);
      steps.push({
        description: `Jump to ${nextRound}`,
        detail: `${current} → ${nextRound} = +${jump}`,
        jump: jump
      });
      current = nextRound;
    } else {
      const jump = a - current;
      jumps.push(jump);
      steps.push({
        description: `Jump to ${a}`,
        detail: `${current} → ${a} = +${jump}`,
        jump: jump
      });
      current = a;
    }
  }

  const answer = jumps.reduce((sum, j) => sum + j, 0);

  if (jumps.length > 1) {
    const jumpSum = jumps.join(' + ');
    steps.push({
      description: 'Add all jumps',
      detail: `${jumpSum} = ${answer}`,
      input: answer,
      note: 'The total of all jumps is the difference'
    });
  } else {
    steps.push({
      description: 'Total difference',
      detail: `The jump is ${answer}`,
      input: answer
    });
  }

  return {
    method: 'counting_on',
    problem,
    steps,
    answer
  };
}

export function getVisualData(a, op, b) {
  if (b >= a) {
    return {
      type: 'number-line',
      start: b,
      end: a,
      jumps: [],
      error: 'Invalid range'
    };
  }

  let current = b;
  const jumps = [];

  while (current < a) {
    const nextRound = findNextRoundNumber(current, a);

    if (nextRound < a) {
      const jump = nextRound - current;
      jumps.push({
        from: current,
        to: nextRound,
        distance: jump,
        label: `+${jump}`
      });
      current = nextRound;
    } else {
      const jump = a - current;
      jumps.push({
        from: current,
        to: a,
        distance: jump,
        label: `+${jump}`
      });
      current = a;
    }
  }

  return {
    type: 'number-line',
    start: b,
    end: a,
    jumps: jumps,
    total: a - b
  };
}
