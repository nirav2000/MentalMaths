/**
 * Expansion Module Configuration
 * Contains all constants, thresholds, colours, strategy definitions,
 * progression levels, and method definitions for the mental math expansion.
 */

// Mastery level thresholds
export const MASTERY_LEVELS = {
  learning: {
    minAcc: 0,
    maxTime: 999
  },
  developing: {
    minAcc: 0.6,
    maxTime: 10000
  },
  secure: {
    minAcc: 0.8,
    maxTime: 5000
  },
  fluent: {
    minAcc: 0.95,
    maxTime: 3000
  }
};

// Colour scheme
export const COLOURS = {
  correct: '#4CAF50',
  incorrect: '#E57373',
  hint: '#42A5F5',
  fluent: '#2E7D32',
  secure: '#66BB6A',
  developing: '#FFB74D',
  learning: '#EF5350',
  locked: '#BDBDBD',
  active_issue: '#FF9800'
};

// Addition strategies (10 strategies in teaching order)
export const ADDITION_STRATEGIES = [
  {
    id: 'counting_on',
    name: 'Counting On +1, +2, +3',
    description: 'Start at the larger number and count up by 1, 2, or 3',
    teachingOrder: 1,
    factFilter: (a, b) => (b >= 1 && b <= 3) || (a >= 1 && a <= 3)
  },
  {
    id: 'doubles',
    name: 'Doubles',
    description: 'Adding a number to itself (e.g., 6+6=12)',
    teachingOrder: 2,
    factFilter: (a, b) => a === b && a <= 12
  },
  {
    id: 'doubles_near',
    name: 'Doubles +1 / -1',
    description: 'Use doubles facts to solve near-doubles (e.g., 6+7 → 6+6+1)',
    teachingOrder: 3,
    factFilter: (a, b) => Math.abs(a - b) === 1 && a >= 2 && b >= 2
  },
  {
    id: 'doubles_near_2',
    name: 'Doubles +2 / -2',
    description: 'Use doubles to solve facts 2 apart (e.g., 6+8 → 7+7)',
    teachingOrder: 4,
    factFilter: (a, b) => Math.abs(a - b) === 2 && a >= 2 && b >= 2
  },
  {
    id: 'making_10',
    name: 'Making 10',
    description: 'Number pairs that sum to 10 (e.g., 7+3, 8+2)',
    teachingOrder: 5,
    factFilter: (a, b) => a + b === 10 && a > 0 && b > 0
  },
  {
    id: 'bridge_through_10',
    name: 'Bridge Through 10',
    description: 'Break apart to make 10, then add remainder (e.g., 8+5 → 8+2+3)',
    teachingOrder: 6,
    factFilter: (a, b) => a + b > 10 && a < 10 && b < 10 && a > 5 && b > 5
  },
  {
    id: 'commutative',
    name: 'Commutative Swap',
    description: 'Turn around facts for easier solving (e.g., 3+9 → 9+3)',
    teachingOrder: 7,
    factFilter: (a, b) => a < b && b - a >= 4
  },
  {
    id: 'adding_10',
    name: 'Adding 10',
    description: 'Add 10 to any number (ones digit stays same)',
    teachingOrder: 8,
    factFilter: (a, b) => a === 10 || b === 10
  },
  {
    id: 'adding_9',
    name: 'Adding 9',
    description: 'Add 10 then subtract 1 (e.g., 7+9 → 7+10-1)',
    teachingOrder: 9,
    factFilter: (a, b) => a === 9 || b === 9
  },
  {
    id: 'adding_0',
    name: 'Adding 0',
    description: 'Identity property: adding zero keeps the number the same',
    teachingOrder: 10,
    factFilter: (a, b) => a === 0 || b === 0
  }
];

// Subtraction strategies (10 strategies in teaching order)
export const SUBTRACTION_STRATEGIES = [
  {
    id: 'counting_back',
    name: 'Counting Back -1, -2, -3',
    description: 'Count backwards by 1, 2, or 3 from the starting number',
    teachingOrder: 1,
    factFilter: (a, b) => b >= 1 && b <= 3 && a >= b
  },
  {
    id: 'subtracting_0',
    name: 'Subtracting 0',
    description: 'Identity property: subtracting zero keeps the number the same',
    teachingOrder: 2,
    factFilter: (a, b) => b === 0
  },
  {
    id: 'think_addition',
    name: 'Think Addition (Inverse)',
    description: 'Use addition to solve subtraction (e.g., 13-5 → 5+?=13)',
    teachingOrder: 3,
    factFilter: (a, b) => a <= 20 && b <= 12
  },
  {
    id: 'doubles_subtraction',
    name: 'Doubles Subtraction',
    description: 'Subtract a double to get the original (e.g., 14-7=7)',
    teachingOrder: 4,
    factFilter: (a, b) => a === 2 * b && b <= 12
  },
  {
    id: 'subtract_from_10',
    name: 'Subtract from 10',
    description: 'Subtract single digits from 10 (e.g., 10-6=4)',
    teachingOrder: 5,
    factFilter: (a, b) => a === 10 && b <= 10
  },
  {
    id: 'bridge_back_10',
    name: 'Bridge Back Through 10',
    description: 'Subtract to 10 first, then continue (e.g., 13-5 → 13-3-2)',
    teachingOrder: 6,
    factFilter: (a, b) => a > 10 && a <= 20 && b <= 9 && (a - b) < 10
  },
  {
    id: 'subtracting_10',
    name: 'Subtracting 10',
    description: 'Subtract 10 from any number (ones digit stays same)',
    teachingOrder: 7,
    factFilter: (a, b) => b === 10 && a > 10
  },
  {
    id: 'subtracting_9',
    name: 'Subtracting 9',
    description: 'Subtract 10 then add 1 (e.g., 16-9 → 16-10+1)',
    teachingOrder: 8,
    factFilter: (a, b) => b === 9 && a > 9
  },
  {
    id: 'compensation',
    name: 'Compensation',
    description: 'Adjust to easier number then compensate (e.g., 15-8 → 15-10+2)',
    teachingOrder: 9,
    factFilter: (a, b) => a > 10 && b > 5 && b < 10
  },
  {
    id: 'same_difference',
    name: 'Same Difference',
    description: 'Adjust both numbers equally (e.g., 83-47 → 86-50)',
    teachingOrder: 10,
    factFilter: (a, b) => a > 20 && b > 20 && (b % 10 > 5 || b % 10 < 3)
  }
];

// Progression levels
export const PROGRESSION_LEVELS = [
  {
    id: 'level1',
    name: 'Single Digit',
    description: 'Master addition and subtraction facts (1-12)',
    prerequisites: []
  },
  {
    id: 'level2',
    name: 'Two-Digit ± Single-Digit',
    description: 'Apply strategies to problems like 34+7 or 52-8',
    prerequisites: ['level1']
  },
  {
    id: 'level3',
    name: 'Two-Digit ± Two-Digit',
    description: 'Solve problems like 47+35 or 82-46',
    prerequisites: ['level2']
  },
  {
    id: 'level4',
    name: 'Three-Digit',
    description: 'Work with three-digit numbers like 347+256',
    prerequisites: ['level3']
  },
  {
    id: 'level5',
    name: 'Four-Digit and Beyond',
    description: 'Tackle larger numbers like 4,372+1,859',
    prerequisites: ['level4']
  },
  {
    id: 'level6',
    name: 'Mixed Operations',
    description: 'Multi-step problems combining operations',
    prerequisites: ['level4']
  },
  {
    id: 'level7',
    name: 'Word Problems',
    description: 'Apply skills to real-world scenarios',
    prerequisites: ['level3']
  }
];

// Method definitions
export const METHOD_DEFINITIONS = [
  {
    id: 'partitioning',
    name: 'Partitioning',
    icon: '🧩',
    description: 'Split numbers by place value, add/subtract each part, then recombine',
    operations: ['addition', 'subtraction'],
    minDigits: 2,
    maxDigits: 5
  },
  {
    id: 'sequencing',
    name: 'Sequencing',
    icon: '➡️',
    description: 'Add or subtract in steps from left to right',
    operations: ['addition', 'subtraction'],
    minDigits: 2,
    maxDigits: 4
  },
  {
    id: 'compensation',
    name: 'Compensation',
    icon: '🔄',
    description: 'Round to an easier number, then adjust back',
    operations: ['addition', 'subtraction'],
    minDigits: 2,
    maxDigits: 5
  },
  {
    id: 'same_difference',
    name: 'Same Difference',
    icon: '⚖️',
    description: 'Shift both numbers to make calculation easier',
    operations: ['subtraction'],
    minDigits: 2,
    maxDigits: 5
  },
  {
    id: 'column_method',
    name: 'Column Method',
    icon: '📝',
    description: 'Traditional written method with carrying/borrowing',
    operations: ['addition', 'subtraction'],
    minDigits: 2,
    maxDigits: 99
  },
  {
    id: 'counting_on',
    name: 'Counting On',
    icon: '🔢',
    description: 'Count up from one number to the other',
    operations: ['subtraction'],
    minDigits: 2,
    maxDigits: 4
  }
];
