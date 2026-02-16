// Problem Generator for Multi-Digit Arithmetic (Levels 2-5)
// Generates problems with adaptive difficulty based on user performance

export function generateProblem(level, operation, difficulty = 'medium') {
  const config = getLevelConfig(level, operation, difficulty);
  let a, b;

  do {
    a = generateNumber(config.minA, config.maxA, config.constraints);
    b = generateNumber(config.minB, config.maxB, config.constraints);
  } while (!meetsRequirements(a, b, operation, config.requirements));

  const answer = operation === '+' ? a + b : a - b;
  const metadata = analyzeProblem(a, operation, b, answer);

  return {
    a,
    operation,
    b,
    answer,
    level,
    difficulty,
    metadata
  };
}

export function generateProblemSet(level, operation, difficulty = 'medium', count = 10) {
  const problems = [];
  const seen = new Set();

  for (let i = 0; i < count * 3 && problems.length < count; i++) {
    const problem = generateProblem(level, operation, difficulty);
    const key = `${problem.a}${problem.operation}${problem.b}`;
    if (!seen.has(key)) {
      seen.add(key);
      problems.push(problem);
    }
  }

  return problems;
}

function getLevelConfig(level, operation, difficulty) {
  const configs = {
    2: { // Two-digit ± single-digit
      easy: {
        minA: 10, maxA: 50, minB: 1, maxB: 5,
        constraints: { avoidZeros: true },
        requirements: { maxCarries: 0, maxBorrows: 0 }
      },
      medium: {
        minA: 20, maxA: 89, minB: 3, maxB: 9,
        constraints: {},
        requirements: { maxCarries: 1, maxBorrows: 1 }
      },
      hard: {
        minA: 50, maxA: 99, minB: 6, maxB: 9,
        constraints: {},
        requirements: { minCarries: 1, minBorrows: 1 }
      }
    },
    3: { // Two-digit ± two-digit
      easy: {
        minA: 20, maxA: 50, minB: 10, maxB: 30,
        constraints: { avoidZeros: true },
        requirements: { maxCarries: 0, maxBorrows: 0 }
      },
      medium: {
        minA: 30, maxA: 89, minB: 20, maxB: 60,
        constraints: {},
        requirements: { maxCarries: 1, maxBorrows: 1, minDifference: 10 }
      },
      hard: {
        minA: 50, maxA: 99, minB: 40, maxB: 89,
        constraints: {},
        requirements: { minCarries: 1, minBorrows: 1, minDifference: 5 }
      }
    },
    4: { // Three-digit ± two/three-digit
      easy: {
        minA: 100, maxA: 500, minB: 20, maxB: 200,
        constraints: { avoidZeros: true },
        requirements: { maxCarries: 0, maxBorrows: 0 }
      },
      medium: {
        minA: 200, maxA: 899, minB: 100, maxB: 500,
        constraints: {},
        requirements: { maxCarries: 2, maxBorrows: 2, minDifference: 20 }
      },
      hard: {
        minA: 400, maxA: 999, minB: 200, maxB: 899,
        constraints: { includeZeros: true },
        requirements: { minCarries: 1, minBorrows: 1, allowChainBorrow: true }
      }
    },
    5: { // Four-digit and beyond
      easy: {
        minA: 1000, maxA: 5000, minB: 100, maxB: 2000,
        constraints: { avoidZeros: true },
        requirements: { maxCarries: 1, maxBorrows: 1 }
      },
      medium: {
        minA: 2000, maxA: 8999, minB: 1000, maxB: 5000,
        constraints: {},
        requirements: { maxCarries: 3, maxBorrows: 3, minDifference: 100 }
      },
      hard: {
        minA: 5000, maxA: 9999, minB: 2000, maxB: 8999,
        constraints: { includeZeros: true },
        requirements: { minCarries: 2, minBorrows: 2, allowChainBorrow: true }
      }
    }
  };

  return configs[level][difficulty];
}

function generateNumber(min, max, constraints = {}) {
  let num;
  const maxAttempts = 100;
  let attempts = 0;

  do {
    num = Math.floor(Math.random() * (max - min + 1)) + min;
    attempts++;
  } while (!meetsConstraints(num, constraints) && attempts < maxAttempts);

  return num;
}

function meetsConstraints(num, constraints) {
  const str = String(num);

  if (constraints.avoidZeros && str.includes('0')) return false;
  if (constraints.includeZeros && !str.includes('0')) return false;

  return true;
}

function meetsRequirements(a, b, operation, requirements) {
  if (operation === '-' && b >= a) return false; // Ensure positive result

  const answer = operation === '+' ? a + b : a - b;
  const metadata = analyzeProblem(a, operation, b, answer);

  if (requirements.maxCarries !== undefined && metadata.carries > requirements.maxCarries) return false;
  if (requirements.minCarries !== undefined && metadata.carries < requirements.minCarries) return false;
  if (requirements.maxBorrows !== undefined && metadata.borrows > requirements.maxBorrows) return false;
  if (requirements.minBorrows !== undefined && metadata.borrows < requirements.minBorrows) return false;
  if (requirements.minDifference !== undefined && operation === '-' && (a - b) < requirements.minDifference) return false;
  if (requirements.allowChainBorrow === false && metadata.chainBorrow) return false;

  return true;
}

function analyzeProblem(a, operation, b, answer) {
  const metadata = {
    carries: 0,
    borrows: 0,
    chainBorrow: false,
    crossesTens: false,
    crossesHundreds: false,
    hasZeros: String(a).includes('0') || String(b).includes('0'),
    nearRound: isNearRound(a) || isNearRound(b),
    smallDifference: operation === '-' && (a - b) < 20
  };

  if (operation === '+') {
    const digitsA = String(a).split('').reverse();
    const digitsB = String(b).split('').reverse();
    let carry = 0;

    for (let i = 0; i < Math.max(digitsA.length, digitsB.length); i++) {
      const dA = parseInt(digitsA[i] || 0);
      const dB = parseInt(digitsB[i] || 0);
      const sum = dA + dB + carry;

      if (sum >= 10) {
        metadata.carries++;
        carry = 1;
        if (i === 0) metadata.crossesTens = true;
        if (i === 1) metadata.crossesHundreds = true;
      } else {
        carry = 0;
      }
    }
  } else {
    const digitsA = String(a).split('').reverse();
    const digitsB = String(b).split('').reverse();

    for (let i = 0; i < digitsB.length; i++) {
      const dA = parseInt(digitsA[i] || 0);
      const dB = parseInt(digitsB[i] || 0);

      if (dA < dB) {
        metadata.borrows++;
        // Check for chain borrow (borrowing through zeros)
        if (i < digitsA.length - 1 && digitsA[i + 1] === '0') {
          metadata.chainBorrow = true;
        }
      }
    }
  }

  return metadata;
}

function isNearRound(n) {
  const distances = [
    n % 10,
    10 - (n % 10),
    n % 100,
    100 - (n % 100),
    n % 1000,
    1000 - (n % 1000)
  ];
  return Math.min(...distances) <= 5;
}
