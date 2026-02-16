/**
 * Error Pattern Detection Engine
 * Matches user errors to 30 known misunderstandings from the research-backed Top 10 lists.
 */

/**
 * Addition Error Patterns (Top 10)
 */
export const ADDITION_PATTERNS = [
  {
    id: 'counting_includes_start',
    category: 'addition',
    name: 'Counting Includes Start Number',
    description: 'User counts on but includes the starting number',
    rootCause: "Doesn't understand that 'counting on' means starting AFTER the first number",
    severity: 2,
    prerequisites: ['counting_on'],
    detect: (problem, userAnswer, correctAnswer) => {
      // For counting-on problems (a+1, a+2, a+3), user is off by exactly 1
      if (problem.strategyId === 'counting_on' && problem.b <= 3) {
        return userAnswer === correctAnswer - 1;
      }
      return false;
    }
  },
  {
    id: 'place_value_carrying_confusion',
    category: 'addition',
    name: 'Place Value Confusion in Carrying',
    description: 'Concatenates digit sums instead of carrying',
    rootCause: "Doesn't understand that the 1 in 12 represents 10, not 1",
    severity: 3,
    prerequisites: ['place_value'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 47+35 → writes 712 (7+5=12, 4+3=7)
      if (problem.a >= 10 && problem.b >= 10) {
        const a_ones = problem.a % 10;
        const a_tens = Math.floor(problem.a / 10) % 10;
        const b_ones = problem.b % 10;
        const b_tens = Math.floor(problem.b / 10) % 10;

        const ones_sum = a_ones + b_ones;
        const tens_sum = a_tens + b_tens;

        // Concatenate: tens_sum + ones_sum as digits
        const concatenated = parseInt(`${tens_sum}${ones_sum}`);
        return userAnswer === concatenated;
      }
      return false;
    }
  },
  {
    id: 'left_to_right_no_regroup',
    category: 'addition',
    name: 'Adds Left to Right Without Regrouping',
    description: 'Adds left to right but drops the carry digit',
    rootCause: 'Procedural error — forgets to carry or doesn\'t know when to',
    severity: 2,
    prerequisites: ['carrying'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 48+37 gets 75 (4+3=7, 8+7=15, drop the 1)
      if (problem.a >= 10 && problem.b >= 10) {
        const a_ones = problem.a % 10;
        const a_tens = Math.floor(problem.a / 10) % 10;
        const b_ones = problem.b % 10;
        const b_tens = Math.floor(problem.b / 10) % 10;

        const ones_sum = a_ones + b_ones;
        const tens_only = a_tens + b_tens;

        // Drop carry: use only the ones digit from ones_sum
        const result = tens_only * 10 + (ones_sum % 10);
        return userAnswer === result;
      }
      return false;
    }
  },
  {
    id: 'commutativity_unknown',
    category: 'addition',
    name: "Doesn't Understand Commutativity",
    description: 'Knows a+b but not b+a',
    rootCause: 'Treats b+a as a different, unlearned fact',
    severity: 1,
    prerequisites: ['commutativity'],
    detect: (problem, userAnswer, correctAnswer) => {
      // This is hard to detect from a single answer - requires pattern over time
      // We'll mark it when user is slow/wrong on commutative version
      return false; // Requires historical tracking
    }
  },
  {
    id: 'digit_by_digit_addition',
    category: 'addition',
    name: 'Adds Digits Independently',
    description: 'Adds each digit pair without understanding place value',
    rootCause: "Doesn't understand place value carrying",
    severity: 3,
    prerequisites: ['place_value'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 27+45 → 2+4=6, 7+5=12 → 612
      if (problem.a >= 10 && problem.b >= 10) {
        const a_str = problem.a.toString();
        const b_str = problem.b.toString();
        const max_len = Math.max(a_str.length, b_str.length);

        let result_str = '';
        for (let i = 0; i < max_len; i++) {
          const a_digit = parseInt(a_str[i] || 0);
          const b_digit = parseInt(b_str[i] || 0);
          result_str += (a_digit + b_digit).toString();
        }

        return userAnswer === parseInt(result_str);
      }
      return false;
    }
  },
  {
    id: 'confuses_add_multiply',
    category: 'addition',
    name: 'Confuses Addition with Multiplication',
    description: 'Sees 6+6 and answers 36',
    rootCause: 'Strategy interference, especially after learning times tables',
    severity: 2,
    prerequisites: ['doubles'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Check if answer equals a*b when asking for a+b
      return userAnswer === problem.a * problem.b;
    }
  },
  {
    id: 'bridge_through_10_loses_remainder',
    category: 'addition',
    name: 'Bridge Through 10 Loses Remainder',
    description: 'Can split to 10 but loses the leftover part',
    rootCause: 'Can split to 10 but loses track of the leftover',
    severity: 2,
    prerequisites: ['bridge_through_10'],
    detect: (problem, userAnswer, correctAnswer) => {
      // For problems that bridge through 10 (e.g., 8+5)
      if (problem.strategyId === 'bridge_through_10') {
        // User might answer 10 (stopping at the bridge)
        return userAnswer === 10;
      }
      return false;
    }
  },
  {
    id: 'zero_addition_misconception',
    category: 'addition',
    name: 'Zero Misconception',
    description: 'Thinks n+0=0 or is unsure',
    rootCause: 'Conflates "adding nothing" with "the answer is nothing"',
    severity: 1,
    prerequisites: ['adding_0'],
    detect: (problem, userAnswer, correctAnswer) => {
      // For problems with +0, check if answer is 0
      if (problem.b === 0 || problem.a === 0) {
        return userAnswer === 0;
      }
      return false;
    }
  },
  {
    id: 'column_misalignment',
    category: 'addition',
    name: 'Misaligns Columns',
    description: 'Aligns digits from the left instead of right',
    rootCause: "Doesn't understand place value alignment",
    severity: 3,
    prerequisites: ['place_value'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 347+52 treated as 347+520
      // This is hard to detect from final answer alone
      // We'd need to see if user's answer matches left-aligned calculation
      if (problem.a >= 100 && problem.b < 100) {
        const b_shifted = problem.b * 10;
        return userAnswer === problem.a + b_shifted;
      }
      return false;
    }
  },
  {
    id: 'compensation_wrong_direction',
    category: 'addition',
    name: 'Overgeneralises Compensation',
    description: 'Adjusts in wrong direction after rounding',
    rootCause: "Doesn't understand whether to add or subtract the adjustment",
    severity: 2,
    prerequisites: ['compensation'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 45+28 rounds 28→30, does 45+30=75, then adds 2 instead of subtracting → 77
      // Check if answer is off by 2x the rounding adjustment
      const rounded_b = Math.round(problem.b / 10) * 10;
      const adjustment = rounded_b - problem.b;

      if (Math.abs(adjustment) > 0 && Math.abs(adjustment) <= 5) {
        // User applied adjustment in wrong direction
        return userAnswer === correctAnswer + (2 * adjustment);
      }
      return false;
    }
  }
];

/**
 * Subtraction Error Patterns (Top 10)
 */
export const SUBTRACTION_PATTERNS = [
  {
    id: 'smaller_from_larger',
    category: 'subtraction',
    name: 'Always Subtracts Smaller from Larger',
    description: 'Subtracts smaller digit from larger regardless of position',
    rootCause: "Doesn't understand regrouping/borrowing",
    severity: 3,
    prerequisites: ['borrowing'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 42-17 does 4-1=3, 7-2=5 → 35
      if (problem.a >= 10 && problem.b >= 10) {
        const a_ones = problem.a % 10;
        const a_tens = Math.floor(problem.a / 10) % 10;
        const b_ones = problem.b % 10;
        const b_tens = Math.floor(problem.b / 10) % 10;

        // Always use |top - bottom| for each digit
        const ones_result = Math.abs(a_ones - b_ones);
        const tens_result = Math.abs(a_tens - b_tens);
        const wrong_answer = tens_result * 10 + ones_result;

        return userAnswer === wrong_answer;
      }
      return false;
    }
  },
  {
    id: 'borrowing_forgets_to_reduce',
    category: 'subtraction',
    name: 'Borrowing Confusion — Forgets to Reduce',
    description: 'Borrows but forgets to reduce the tens digit',
    rootCause: 'Procedural gap in multi-step borrowing',
    severity: 3,
    prerequisites: ['borrowing'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 503-287 borrows to make ones 13, but leaves the 5 as 5
      // This is complex to detect from final answer alone
      // We'd need to check if the error matches not reducing the borrowed digit
      return false; // Requires step-by-step tracking
    }
  },
  {
    id: 'borrowing_across_zero',
    category: 'subtraction',
    name: 'Borrowing Across Zero',
    description: "Can't borrow when next column is 0",
    rootCause: "Doesn't know to chain-borrow from hundreds through tens",
    severity: 3,
    prerequisites: ['borrowing'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Check if problem has 0 in tens place and borrowing is needed
      const a_str = problem.a.toString();
      const has_zero = a_str.includes('0');
      const needs_borrowing = (problem.a % 10) < (problem.b % 10);

      return has_zero && needs_borrowing && userAnswer !== correctAnswer;
    }
  },
  {
    id: 'non_commutative_subtraction',
    category: 'subtraction',
    name: 'Treats Subtraction as Commutative',
    description: 'Thinks a-b = b-a',
    rootCause: "Doesn't understand order matters",
    severity: 2,
    prerequisites: ['subtraction_order'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Check if answer matches b-a when asking for a-b
      return userAnswer === (problem.b - problem.a);
    }
  },
  {
    id: 'negative_reversal',
    category: 'subtraction',
    name: 'Negative Number Confusion',
    description: 'Avoids negatives by reversing the subtraction',
    rootCause: 'Avoids negative results by swapping',
    severity: 2,
    prerequisites: ['negative_numbers'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 3-7 writes 4 (reverses to 7-3)
      if (problem.a < problem.b) {
        return userAnswer === (problem.b - problem.a);
      }
      return false;
    }
  },
  {
    id: 'counting_back_includes_start',
    category: 'subtraction',
    name: 'Counting Back Includes Start',
    description: 'Counts back but includes the starting number',
    rootCause: 'Same counting error as addition',
    severity: 2,
    prerequisites: ['counting_back'],
    detect: (problem, userAnswer, correctAnswer) => {
      // For counting-back problems (a-1, a-2, a-3), user is off by exactly 1
      if (problem.strategyId === 'counting_back' && problem.b <= 3) {
        return userAnswer === correctAnswer + 1;
      }
      return false;
    }
  },
  {
    id: 'subtracting_from_powers_of_10',
    category: 'subtraction',
    name: 'Subtracting from 10/100/1000 Errors',
    description: 'Multiple errors in chain borrowing from powers of 10',
    rootCause: 'Multiple conceptual gaps compounding',
    severity: 3,
    prerequisites: ['borrowing'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Check if subtracting from 10, 100, 1000, 10000, etc.
      const is_power_of_10 = /^10+$/.test(problem.a.toString());
      return is_power_of_10 && userAnswer !== correctAnswer;
    }
  },
  {
    id: 'think_addition_fails',
    category: 'subtraction',
    name: 'Think-Addition Fails',
    description: 'Tries inverse addition but fact not fluent',
    rootCause: 'Addition fact fluency is a prerequisite',
    severity: 2,
    prerequisites: ['think_addition', 'addition_facts'],
    detect: (problem, userAnswer, correctAnswer) => {
      // This requires checking if the inverse addition fact is weak
      // Hard to detect from single answer
      return false; // Requires historical tracking
    }
  },
  {
    id: 'compensation_reversed_subtraction',
    category: 'subtraction',
    name: 'Compensation Direction Reversed',
    description: 'Adjusts in wrong direction after rounding',
    rootCause: 'Confused about adjustment direction',
    severity: 2,
    prerequisites: ['compensation'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 63-29 does 63-30=33, then subtracts 1 → 32 instead of adding 1
      const rounded_b = Math.round(problem.b / 10) * 10;
      const adjustment = rounded_b - problem.b;

      if (Math.abs(adjustment) > 0 && Math.abs(adjustment) <= 5) {
        // User applied adjustment in wrong direction
        return userAnswer === correctAnswer - (2 * adjustment);
      }
      return false;
    }
  },
  {
    id: 'misreads_as_addition',
    category: 'subtraction',
    name: 'Misreads Subtraction as Addition',
    description: 'Performs addition when subtraction is asked',
    rootCause: 'Inattention or sign confusion',
    severity: 1,
    prerequisites: ['operation_signs'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Check if answer equals a+b when asking for a-b
      return userAnswer === (problem.a + problem.b);
    }
  }
];

/**
 * Larger Numbers Error Patterns (Top 10)
 */
export const LARGER_NUMBERS_PATTERNS = [
  {
    id: 'place_value_misunderstanding',
    category: 'large_numbers',
    name: 'Place Value Misunderstanding',
    description: 'Thinks 4 in 4,372 is worth 4, not 4,000',
    rootCause: 'Weak place value foundation',
    severity: 3,
    prerequisites: ['place_value'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Hard to detect from final answer alone
      return false; // Requires diagnostic question
    }
  },
  {
    id: 'large_column_misalignment',
    category: 'large_numbers',
    name: 'Column Misalignment',
    description: 'Adds 4372+59 as 4372+5900',
    rootCause: "Doesn't right-align numbers",
    severity: 3,
    prerequisites: ['place_value'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 4372+59 treated as 4372+5900
      if (problem.a >= 1000 && problem.b < 100) {
        const b_shifted = problem.b * 100;
        return userAnswer === problem.a + b_shifted;
      }
      return false;
    }
  },
  {
    id: 'carrying_cascade_errors',
    category: 'large_numbers',
    name: 'Carrying Across Multiple Columns',
    description: 'Errors cascade when carrying across 3+ columns',
    rootCause: 'Single carrying is OK but chaining fails',
    severity: 3,
    prerequisites: ['carrying'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Check if problem requires multiple carries
      if (problem.a >= 1000 && problem.b >= 1000) {
        // Complex to detect specific cascade error
        return false; // Requires step-by-step tracking
      }
      return false;
    }
  },
  {
    id: 'partitioning_without_place_value',
    category: 'large_numbers',
    name: 'Partitioning Errors',
    description: 'Partitions 4,372 as "4+3+7+2" instead of place values',
    rootCause: 'Place value not connected to partitioning',
    severity: 3,
    prerequisites: ['place_value', 'partitioning'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 4,372 → 4+3+7+2 = 16
      if (problem.a >= 1000) {
        const digit_sum = problem.a.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
        return userAnswer === digit_sum;
      }
      return false;
    }
  },
  {
    id: 'sequencing_working_memory_overload',
    category: 'large_numbers',
    name: 'Sequencing/Jump Errors',
    description: 'Gets lost in multi-step jumps',
    rootCause: 'Working memory overload',
    severity: 2,
    prerequisites: ['sequencing'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Hard to detect specific type of jump error
      return false; // Requires method tracking
    }
  },
  {
    id: 'compensation_adjustment_size_error',
    category: 'large_numbers',
    name: 'Compensation Adjustment Size Errors',
    description: 'Rounds but adjusts by wrong magnitude (3 vs 30 vs 300)',
    rootCause: 'Confused about how much was added when rounding',
    severity: 2,
    prerequisites: ['compensation'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Example: 2,997+1,456 rounds to 3,000 (adds 3) but adjusts by 30 or 300
      const rounded_a = Math.round(problem.a / 1000) * 1000;
      const adjustment = rounded_a - problem.a;

      if (Math.abs(adjustment) > 0) {
        // Check if user adjusted by wrong magnitude
        const wrong_adj_10x = correctAnswer + (adjustment * 10);
        const wrong_adj_100x = correctAnswer + (adjustment * 100);
        return userAnswer === wrong_adj_10x || userAnswer === wrong_adj_100x;
      }
      return false;
    }
  },
  {
    id: 'reading_writing_large_numbers',
    category: 'large_numbers',
    name: 'Reading/Writing Large Numbers',
    description: 'Disconnect between verbal and written forms',
    rootCause: 'Disconnect between verbal and written forms',
    severity: 2,
    prerequisites: ['place_value'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Hard to detect from calculation error
      return false; // Requires specific reading/writing test
    }
  },
  {
    id: 'missing_zero_placeholders',
    category: 'large_numbers',
    name: 'Missing Zero Placeholders',
    description: 'Drops zeros: 4,000+300+2 = 432 instead of 4,302',
    rootCause: 'Drops the zero placeholder',
    severity: 3,
    prerequisites: ['place_value'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Check if user's answer is the correct answer with zeros removed
      const correct_str = correctAnswer.toString();
      const answer_str = userAnswer.toString();
      const correct_no_zeros = correct_str.replace(/0/g, '');

      return answer_str === correct_no_zeros;
    }
  },
  {
    id: 'poor_estimation',
    category: 'large_numbers',
    name: 'Poor Estimation Skills',
    description: "Can't estimate if 347+256 should be roughly 600",
    rootCause: "Doesn't use rounding as a reasonableness check",
    severity: 1,
    prerequisites: ['estimation'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Check if answer is wildly off (more than 50% error)
      const error_ratio = Math.abs(userAnswer - correctAnswer) / correctAnswer;
      return error_ratio > 0.5;
    }
  },
  {
    id: 'inappropriate_method_choice',
    category: 'large_numbers',
    name: 'Inappropriate Method Choice',
    description: 'Uses inefficient method for the problem',
    rootCause: 'Lack of method selection awareness',
    severity: 1,
    prerequisites: ['method_selection'],
    detect: (problem, userAnswer, correctAnswer) => {
      // Requires tracking which method was used
      return false; // Requires method tracking
    }
  }
];

/**
 * All error patterns combined
 */
export const ALL_ERROR_PATTERNS = [
  ...ADDITION_PATTERNS,
  ...SUBTRACTION_PATTERNS,
  ...LARGER_NUMBERS_PATTERNS
];

/**
 * Analyses errors from quiz results and detects misunderstandings.
 * @param {Array} results - Array of quiz results with {problem, userAnswer, correct}
 * @returns {Array} Detected misunderstandings with confidence scores
 */
export function analyseErrors(results) {
  const detectedMisunderstandings = [];
  const patternMatches = {}; // Count how many times each pattern matches

  // Check each incorrect result against all patterns
  results.forEach(result => {
    if (result.correct) return; // Skip correct answers

    const { problem, userAnswer, correctAnswer } = result;
    const numAnswer = parseInt(userAnswer);

    ALL_ERROR_PATTERNS.forEach(pattern => {
      try {
        const matches = pattern.detect(problem, numAnswer, correctAnswer);
        if (matches) {
          if (!patternMatches[pattern.id]) {
            patternMatches[pattern.id] = {
              pattern,
              count: 0,
              examples: []
            };
          }
          patternMatches[pattern.id].count++;
          patternMatches[pattern.id].examples.push({
            problem: `${problem.a}${problem.operation === 'addition' ? '+' : '−'}${problem.b}`,
            userAnswer,
            correctAnswer
          });
        }
      } catch (e) {
        // Silently catch any detection errors
      }
    });
  });

  // Convert matches to detected misunderstandings with confidence
  Object.values(patternMatches).forEach(({ pattern, count, examples }) => {
    const totalErrors = results.filter(r => !r.correct).length;
    const confidence = totalErrors > 0 ? count / totalErrors : 0;

    // Only report if pattern matched at least 2 times or 30%+ of errors
    if (count >= 2 || confidence >= 0.3) {
      detectedMisunderstandings.push({
        id: pattern.id,
        name: pattern.name,
        description: pattern.description,
        rootCause: pattern.rootCause,
        category: pattern.category,
        severity: pattern.severity,
        prerequisites: pattern.prerequisites,
        matchCount: count,
        confidence: Math.min(confidence, 1.0),
        examples: examples.slice(0, 3) // Keep up to 3 examples
      });
    }
  });

  // Sort by confidence (highest first), then by severity
  detectedMisunderstandings.sort((a, b) => {
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return b.severity - a.severity;
  });

  return detectedMisunderstandings;
}

/**
 * Gets a pattern by ID.
 * @param {string} patternId - Pattern ID
 * @returns {Object|null} Pattern object or null
 */
export function getPatternById(patternId) {
  return ALL_ERROR_PATTERNS.find(p => p.id === patternId) || null;
}

/**
 * Gets all patterns for a specific category.
 * @param {string} category - 'addition', 'subtraction', or 'large_numbers'
 * @returns {Array} Array of patterns
 */
export function getPatternsByCategory(category) {
  return ALL_ERROR_PATTERNS.filter(p => p.category === category);
}
