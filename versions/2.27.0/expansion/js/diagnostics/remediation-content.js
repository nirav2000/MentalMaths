/**
 * Remediation Content Definitions
 * Full remediation sequences for the top 15 most common misunderstandings.
 */

/**
 * Addition Remediation Content (Top 5)
 */
export const ADDITION_REMEDIATION = {
  counting_includes_start: {
    illustrate: {
      type: 'number_line',
      description: 'Number line showing 7+3. Starting at 7, show three jumps AFTER 7 (to 8, 9, 10), not including 7 in the count.'
    },
    explain: "You might have thought that counting on from 7 means saying '7, 8, 9' for +3. But actually, when we count ON from a number, we start AFTER that number. We already have 7, so we count the NEXT three numbers: 8, 9, 10.",
    guidedPractice: [
      {
        problem: '5 + 2',
        subSteps: [
          { prompt: 'What number are we starting at?', answer: '5', hint: 'Look at the first number' },
          { prompt: 'How many do we need to count on?', answer: '2', hint: 'Look at the second number' },
          { prompt: 'Start AFTER 5. What is the first number you count?', answer: '6', hint: 'The number right after 5' },
          { prompt: 'What is the second number you count?', answer: '7', hint: 'The number after 6' },
          { prompt: 'So 5 + 2 = ?', answer: '7', hint: 'The last number you counted' }
        ]
      },
      {
        problem: '8 + 3',
        subSteps: [
          { prompt: 'Start AFTER 8. Count three numbers. First number?', answer: '9' },
          { prompt: 'Second number?', answer: '10' },
          { prompt: 'Third number?', answer: '11' },
          { prompt: '8 + 3 = ?', answer: '11' }
        ]
      },
      {
        problem: '6 + 1',
        subSteps: [
          { prompt: 'Start AFTER 6. Count one number. What is it?', answer: '7' },
          { prompt: '6 + 1 = ?', answer: '7' }
        ]
      },
      {
        problem: '9 + 2',
        subSteps: [
          { prompt: 'Start AFTER 9. What are the next 2 numbers?', answer: '10, 11', alternates: ['10,11', '10 11', '10 and 11'] },
          { prompt: '9 + 2 = ?', answer: '11' }
        ]
      }
    ],
    independentPractice: [
      { problem: '7 + 2', answer: 9 },
      { problem: '4 + 3', answer: 7 },
      { problem: '10 + 1', answer: 11 },
      { problem: '5 + 3', answer: 8 },
      { problem: '11 + 2', answer: 13 }
    ],
    check: [
      { problem: '6 + 3', answer: 9 },
      { problem: '8 + 2', answer: 10 },
      { problem: '9 + 1', answer: 10 },
      { problem: '7 + 3', answer: 10 },
      { problem: '4 + 2', answer: 6 }
    ]
  },

  place_value_carrying_confusion: {
    illustrate: {
      type: 'base10_blocks',
      description: 'Show 47 as 4 ten-rods and 7 units. Show 35 as 3 ten-rods and 5 units. When adding 7+5=12, show that the 1 in 12 is actually a ten-rod, not just a single unit.'
    },
    explain: "You might have thought that when 7+5=12, you write both digits separately (7, 1, 2). But actually, the 1 in 12 represents one TEN, not one unit. So it needs to join the tens column, making it 4+3+1=8 tens.",
    guidedPractice: [
      {
        problem: '15 + 7',
        subSteps: [
          { prompt: 'Add the ones: 5 + 7 = ?', answer: '12' },
          { prompt: 'In the number 12, what does the 1 mean?', answer: '10', alternates: ['one ten', '1 ten', 'ten'] },
          { prompt: 'So we have 1 ten and 2 ones. The 1 ten joins the tens column. How many tens now?', answer: '2', hint: '1 (from 15) + 1 (from the 12)' },
          { prompt: 'Tens: 2, Ones: 2. What is the answer?', answer: '22' }
        ]
      },
      {
        problem: '47 + 35',
        subSteps: [
          { prompt: 'Ones: 7 + 5 = ?', answer: '12' },
          { prompt: 'Write 2 in ones place. How many tens to carry?', answer: '1' },
          { prompt: 'Tens: 4 + 3 = ?', answer: '7' },
          { prompt: 'Add the carried ten: 7 + 1 = ?', answer: '8' },
          { prompt: 'Final answer?', answer: '82' }
        ]
      },
      {
        problem: '28 + 56',
        subSteps: [
          { prompt: 'Ones: 8 + 6 = ?', answer: '14' },
          { prompt: 'Write ones digit: ?', answer: '4' },
          { prompt: 'Carry: ?', answer: '1' },
          { prompt: 'Tens: 2 + 5 + 1 (carry) = ?', answer: '8' },
          { prompt: 'Answer?', answer: '84' }
        ]
      }
    ],
    independentPractice: [
      { problem: '36 + 27', answer: 63 },
      { problem: '19 + 45', answer: 64 },
      { problem: '58 + 24', answer: 82 },
      { problem: '67 + 18', answer: 85 },
      { problem: '39 + 43', answer: 82 }
    ],
    check: [
      { problem: '48 + 35', answer: 83 },
      { problem: '27 + 56', answer: 83 },
      { problem: '49 + 38', answer: 87 },
      { problem: '75 + 17', answer: 92 },
      { problem: '66 + 28', answer: 94 }
    ]
  },

  left_to_right_no_regroup: {
    illustrate: {
      type: 'place_value_chart',
      description: 'Show 48+37 in columns. Highlight that 8+7=15 means we write 5 in ones place and carry 1 to tens, not drop it.'
    },
    explain: "You might have thought you just add across and drop extra digits. But actually, when the ones column adds to more than 9, we must CARRY the extra ten to the tens column. Every digit matters!",
    guidedPractice: [
      {
        problem: '14 + 8',
        subSteps: [
          { prompt: 'Ones: 4 + 8 = ?', answer: '12' },
          { prompt: 'Is 12 more than 9?', answer: 'yes', alternates: ['y', 'Yeah', 'yep'] },
          { prompt: 'So we need to carry. Write ones digit: ?', answer: '2' },
          { prompt: 'Carry to tens: ?', answer: '1' },
          { prompt: 'Tens: 1 + 0 + 1 (carry) = ?', answer: '2' },
          { prompt: 'Answer?', answer: '22' }
        ]
      },
      {
        problem: '48 + 37',
        subSteps: [
          { prompt: 'Ones: 8 + 7 = ?', answer: '15' },
          { prompt: 'Write ones digit and identify carry', answer: '5, carry 1', alternates: ['5 carry 1', '5,1'] },
          { prompt: 'Tens: 4 + 3 + 1 = ?', answer: '8' },
          { prompt: 'Answer?', answer: '85' }
        ]
      },
      {
        problem: '56 + 29',
        subSteps: [
          { prompt: 'Ones: 6 + 9 = ?', answer: '15' },
          { prompt: 'Ones digit? Carry?', answer: '5, carry 1', alternates: ['5 carry 1', '5,1', '5 and 1'] },
          { prompt: 'Tens: 5 + 2 + 1 = ?', answer: '8' },
          { prompt: 'Answer?', answer: '85' }
        ]
      }
    ],
    independentPractice: [
      { problem: '37 + 48', answer: 85 },
      { problem: '59 + 26', answer: 85 },
      { problem: '44 + 38', answer: 82 },
      { problem: '65 + 27', answer: 92 },
      { problem: '73 + 19', answer: 92 }
    ],
    check: [
      { problem: '38 + 46', answer: 84 },
      { problem: '57 + 25', answer: 82 },
      { problem: '49 + 37', answer: 86 },
      { problem: '66 + 18', answer: 84 },
      { problem: '74 + 19', answer: 93 }
    ]
  },

  confuses_add_multiply: {
    illustrate: {
      type: 'counters',
      description: 'Show 6+6 as two groups of 6 being combined (12 total). Then show 6×6 as six groups of 6 (36 total). Visually distinct.'
    },
    explain: "You might have thought 6+6 and 6×6 are the same because they both use 6 twice. But actually, + means COMBINE two groups, while × means REPEATED GROUPS. 6+6 is just two sixes (12), but 6×6 is six groups of six (36).",
    guidedPractice: [
      {
        problem: '5 + 5',
        subSteps: [
          { prompt: 'What operation is this?', answer: 'addition', alternates: ['add', 'plus', '+'] },
          { prompt: 'Addition means combining. 5 + 5 = ?', answer: '10' },
          { prompt: 'If this was 5 × 5, what would it be?', answer: '25' },
          { prompt: 'Are they the same?', answer: 'no' }
        ]
      },
      {
        problem: '7 + 7',
        subSteps: [
          { prompt: 'This is addition. Combine two 7s: ?', answer: '14' },
          { prompt: '7 × 7 would be: ?', answer: '49' },
          { prompt: 'Addition gives smaller or bigger answer?', answer: 'smaller', alternates: ['less', 'lower'] }
        ]
      },
      {
        problem: '4 + 4',
        subSteps: [
          { prompt: 'Addition: 4 + 4 = ?', answer: '8' },
          { prompt: 'Multiplication: 4 × 4 = ?', answer: '16' }
        ]
      },
      {
        problem: '8 + 8',
        subSteps: [
          { prompt: '8 + 8 = ?', answer: '16' },
          { prompt: 'Double check: is this 8 × 8?', answer: 'no' }
        ]
      }
    ],
    independentPractice: [
      { problem: '6 + 6', answer: 12 },
      { problem: '9 + 9', answer: 18 },
      { problem: '3 + 3', answer: 6 },
      { problem: '7 + 7', answer: 14 },
      { problem: '5 + 5', answer: 10 }
    ],
    check: [
      { problem: '6 + 6', answer: 12 },
      { problem: '8 + 8', answer: 16 },
      { problem: '4 + 4', answer: 8 },
      { problem: '9 + 9', answer: 18 },
      { problem: '7 + 7', answer: 14 }
    ]
  },

  bridge_through_10_loses_remainder: {
    illustrate: {
      type: 'number_line',
      description: 'Show 8+5. First jump from 8 to 10 (+2). Then show the remaining +3 to get to 13. Highlight that 2+3=5.'
    },
    explain: "You might have thought that making 10 is the answer. But actually, making 10 is just the FIRST STEP. After reaching 10, we still need to add the LEFTOVER amount to get the final answer.",
    guidedPractice: [
      {
        problem: '8 + 5',
        subSteps: [
          { prompt: 'How much do we need to add to 8 to make 10?', answer: '2' },
          { prompt: 'We used 2 from the 5. How much is left?', answer: '3', hint: '5 - 2 = ?' },
          { prompt: 'So: 8 + 2 = 10, then 10 + 3 = ?', answer: '13' },
          { prompt: 'Final answer: 8 + 5 = ?', answer: '13' }
        ]
      },
      {
        problem: '7 + 6',
        subSteps: [
          { prompt: 'To make 10: 7 + ? = 10', answer: '3' },
          { prompt: 'From 6, we used 3. Remainder: 6 - 3 = ?', answer: '3' },
          { prompt: '10 + 3 = ?', answer: '13' },
          { prompt: '7 + 6 = ?', answer: '13' }
        ]
      },
      {
        problem: '9 + 4',
        subSteps: [
          { prompt: 'To make 10: 9 + ? = 10', answer: '1' },
          { prompt: 'Remainder from 4: ?', answer: '3' },
          { prompt: '10 + 3 = ?', answer: '13' }
        ]
      },
      {
        problem: '6 + 7',
        subSteps: [
          { prompt: 'To make 10: 6 + ? = 10', answer: '4' },
          { prompt: 'Remainder from 7: 7 - 4 = ?', answer: '3' },
          { prompt: 'Answer: 10 + 3 = ?', answer: '13' }
        ]
      }
    ],
    independentPractice: [
      { problem: '8 + 6', answer: 14 },
      { problem: '7 + 5', answer: 12 },
      { problem: '9 + 5', answer: 14 },
      { problem: '6 + 8', answer: 14 },
      { problem: '7 + 7', answer: 14 }
    ],
    check: [
      { problem: '8 + 4', answer: 12 },
      { problem: '7 + 6', answer: 13 },
      { problem: '9 + 6', answer: 15 },
      { problem: '8 + 7', answer: 15 },
      { problem: '6 + 9', answer: 15 }
    ]
  }
};

/**
 * Subtraction Remediation Content (Top 5)
 */
export const SUBTRACTION_REMEDIATION = {
  smaller_from_larger: {
    illustrate: {
      type: 'base10_blocks',
      description: 'Show 42 as 4 tens and 2 ones. Show trying to take 7 ones from 2 ones — can\'t do it! Break one ten into 10 ones. Now we have 3 tens and 12 ones. Can take 7.'
    },
    explain: "You might have thought you can just subtract the smaller digit from the larger in any column. But actually, when the top digit is smaller, you MUST borrow from the next column first. You can't swap the digits around!",
    guidedPractice: [
      {
        problem: '15 - 3',
        subSteps: [
          { prompt: 'Can you take 3 from 5?', answer: 'yes', alternates: ['y', 'yeah', 'yep'] },
          { prompt: 'Do we need to borrow?', answer: 'no', alternates: ['n', 'nope'] },
          { prompt: '5 - 3 = ?', answer: '2' },
          { prompt: 'Answer: 15 - 3 = ?', answer: '12' }
        ]
      },
      {
        problem: '15 - 8',
        subSteps: [
          { prompt: 'Can you take 8 from 5?', answer: 'no', alternates: ['n', 'nope'] },
          { prompt: 'So we need to borrow. Borrow 1 ten. Tens: 1 → ?', answer: '0' },
          { prompt: 'Ones: 5 + 10 = ?', answer: '15' },
          { prompt: 'Now: 15 - 8 = ?', answer: '7' },
          { prompt: 'Answer: ?', answer: '7' }
        ]
      },
      {
        problem: '32 - 7',
        subSteps: [
          { prompt: 'Can you take 7 from 2?', answer: 'no' },
          { prompt: 'Borrow from tens. Tens: 3 → ?', answer: '2' },
          { prompt: 'Ones: 2 + 10 = ?', answer: '12' },
          { prompt: '12 - 7 = ?', answer: '5' },
          { prompt: 'Tens: 2 - 0 = ?', answer: '2' },
          { prompt: 'Answer?', answer: '25' }
        ]
      },
      {
        problem: '42 - 17',
        subSteps: [
          { prompt: 'Ones: Can take 7 from 2?', answer: 'no' },
          { prompt: 'Borrow. Tens: 4 → ?', answer: '3' },
          { prompt: 'Ones: 2 + 10 = ?', answer: '12' },
          { prompt: '12 - 7 = ?', answer: '5' },
          { prompt: 'Tens: 3 - 1 = ?', answer: '2' },
          { prompt: 'Answer?', answer: '25' }
        ]
      },
      {
        problem: '53 - 28',
        subSteps: [
          { prompt: 'Need to borrow? (Can\'t take 8 from 3)', answer: 'yes' },
          { prompt: 'After borrowing: tens = 4, ones = 13', answer: 'ok', acceptAny: true },
          { prompt: '13 - 8 = ?', answer: '5' },
          { prompt: '4 - 2 = ?', answer: '2' },
          { prompt: 'Answer?', answer: '25' }
        ]
      }
    ],
    independentPractice: [
      { problem: '41 - 16', answer: 25 },
      { problem: '52 - 27', answer: 25 },
      { problem: '63 - 38', answer: 25 },
      { problem: '74 - 49', answer: 25 },
      { problem: '81 - 56', answer: 25 }
    ],
    check: [
      { problem: '42 - 17', answer: 25 },
      { problem: '51 - 26', answer: 25 },
      { problem: '73 - 48', answer: 25 },
      { problem: '62 - 37', answer: 25 },
      { problem: '84 - 59', answer: 25 }
    ]
  },

  borrowing_across_zero: {
    illustrate: {
      type: 'base10_blocks',
      description: 'Show 400 as 4 hundreds. Need to subtract 156. Can\'t borrow from 0 tens, so break 1 hundred into 10 tens first, then break 1 ten into 10 ones. Chain borrowing.'
    },
    explain: "You might have thought you can't borrow from zero. But actually, you CAN — you just need to keep going to the next column. Break the hundreds into tens first, THEN break the tens into ones. It's like making change!",
    guidedPractice: [
      {
        problem: '30 - 7',
        subSteps: [
          { prompt: 'Can you take 7 from 0 ones?', answer: 'no' },
          { prompt: 'Borrow from tens. Tens: 3 → ?', answer: '2' },
          { prompt: 'Ones: 0 + 10 = ?', answer: '10' },
          { prompt: '10 - 7 = ?', answer: '3' },
          { prompt: 'Answer: 2 tens and 3 ones = ?', answer: '23' }
        ]
      },
      {
        problem: '100 - 47',
        subSteps: [
          { prompt: 'Can you take 7 from 0 ones?', answer: 'no' },
          { prompt: 'Tens column is also 0. Go to hundreds. Break 1 hundred into 10 tens.', answer: 'ok', acceptAny: true },
          { prompt: 'Now we have: 0 hundreds, 10 tens, 0 ones. Now borrow 1 ten for ones.', answer: 'ok', acceptAny: true },
          { prompt: 'After borrowing: hundreds=0, tens=9, ones=10', answer: 'ok', acceptAny: true },
          { prompt: '10 - 7 = ?', answer: '3' },
          { prompt: '9 - 4 = ?', answer: '5' },
          { prompt: 'Answer?', answer: '53' }
        ]
      },
      {
        problem: '200 - 56',
        subSteps: [
          { prompt: 'Break 1 hundred into 10 tens. Hundreds: 2 → ?', answer: '1' },
          { prompt: 'Tens: 0 → ?', answer: '10' },
          { prompt: 'Now borrow 1 ten for ones. Tens: 10 → ?', answer: '9' },
          { prompt: 'Ones: 0 → ?', answer: '10' },
          { prompt: '10 - 6 = ?', answer: '4' },
          { prompt: '9 - 5 = ?', answer: '4' },
          { prompt: 'Answer?', answer: '144' }
        ]
      },
      {
        problem: '400 - 156',
        subSteps: [
          { prompt: 'Chain borrow through the zeros. Final: H=3, T=9, O=10', answer: 'ok', acceptAny: true },
          { prompt: '10 - 6 = ?', answer: '4' },
          { prompt: '9 - 5 = ?', answer: '4' },
          { prompt: '3 - 1 = ?', answer: '2' },
          { prompt: 'Answer?', answer: '244' }
        ]
      }
    ],
    independentPractice: [
      { problem: '50 - 8', answer: 42 },
      { problem: '100 - 37', answer: 63 },
      { problem: '300 - 145', answer: 155 },
      { problem: '200 - 78', answer: 122 },
      { problem: '500 - 234', answer: 266 }
    ],
    check: [
      { problem: '40 - 6', answer: 34 },
      { problem: '100 - 42', answer: 58 },
      { problem: '200 - 67', answer: 133 },
      { problem: '300 - 156', answer: 144 },
      { problem: '400 - 187', answer: 213 }
    ]
  },

  non_commutative_subtraction: {
    illustrate: {
      type: 'counters',
      description: 'Show 8-3: start with 8 counters, take away 3, left with 5. Then show 3-8: start with 3 counters, can\'t take away 8! Different!'
    },
    explain: "You might have thought that subtraction works like addition where order doesn't matter. But actually, subtraction IS affected by order. 8-3 means 'start with 8, remove 3' (=5). But 3-8 means 'start with 3, remove 8' — impossible! Or negative.",
    guidedPractice: [
      {
        problem: '10 - 4',
        subSteps: [
          { prompt: 'Start with 10, take away 4. Answer?', answer: '6' },
          { prompt: 'If we did 4 - 10 instead, could we do it?', answer: 'no', alternates: ['negative', 'no, negative'] },
          { prompt: 'Is 10 - 4 the same as 4 - 10?', answer: 'no' }
        ]
      },
      {
        problem: '7 - 2',
        subSteps: [
          { prompt: '7 - 2 = ?', answer: '5' },
          { prompt: '2 - 7 = ?', answer: 'negative 5', alternates: ['-5', 'impossible', 'can\'t do it'] },
          { prompt: 'Same answer?', answer: 'no' }
        ]
      },
      {
        problem: '12 - 5',
        subSteps: [
          { prompt: '12 - 5 = ?', answer: '7' },
          { prompt: '5 - 12 would be negative. Order matters!', answer: 'ok', acceptAny: true }
        ]
      }
    ],
    independentPractice: [
      { problem: '9 - 4', answer: 5 },
      { problem: '11 - 3', answer: 8 },
      { problem: '15 - 7', answer: 8 },
      { problem: '13 - 6', answer: 7 },
      { problem: '8 - 5', answer: 3 }
    ],
    check: [
      { problem: '10 - 3', answer: 7 },
      { problem: '14 - 6', answer: 8 },
      { problem: '9 - 2', answer: 7 },
      { problem: '16 - 9', answer: 7 },
      { problem: '12 - 7', answer: 5 }
    ]
  },

  negative_reversal: {
    illustrate: {
      type: 'number_line',
      description: 'Show 3-7 on a number line. Starting at 3, moving 7 steps left goes below zero to -4. Show that reversing gives wrong answer.'
    },
    explain: "You might have thought that when you can't subtract, you should just flip it around. But actually, 3-7 has a real answer: it's -4 (negative four). Flipping to 7-3=4 gives you the OPPOSITE sign. The answer should be NEGATIVE.",
    guidedPractice: [
      {
        problem: '5 - 8',
        subSteps: [
          { prompt: 'Can you subtract 8 from 5 without going negative?', answer: 'no' },
          { prompt: 'If we flip to 8-5, what do we get?', answer: '3' },
          { prompt: 'But that\'s backwards! 5-8 should be negative. It\'s -3.', answer: 'ok', acceptAny: true },
          { prompt: '5 - 8 = ?', answer: '-3', alternates: ['negative 3', '-3'] }
        ]
      },
      {
        problem: '2 - 6',
        subSteps: [
          { prompt: 'This will be negative. 2 - 6 = ?', answer: '-4', alternates: ['negative 4'] }
        ]
      },
      {
        problem: '4 - 9',
        subSteps: [
          { prompt: '4 - 9 = ?', answer: '-5', alternates: ['negative 5'] }
        ]
      }
    ],
    independentPractice: [
      { problem: '3 - 7', answer: -4 },
      { problem: '1 - 5', answer: -4 },
      { problem: '6 - 10', answer: -4 },
      { problem: '2 - 8', answer: -6 },
      { problem: '4 - 7', answer: -3 }
    ],
    check: [
      { problem: '3 - 8', answer: -5 },
      { problem: '5 - 9', answer: -4 },
      { problem: '1 - 6', answer: -5 },
      { problem: '4 - 10', answer: -6 },
      { problem: '2 - 7', answer: -5 }
    ]
  },

  counting_back_includes_start: {
    illustrate: {
      type: 'number_line',
      description: 'Show 10-3. Starting at 10, count back 3 steps (9, 8, 7), NOT including 10 in the count.'
    },
    explain: "You might have thought that counting back from 10 means saying '10, 9, 8' for -3. But actually, when we count BACK from a number, we start BEFORE that number. We already have 10, so we count the PREVIOUS three numbers: 9, 8, 7.",
    guidedPractice: [
      {
        problem: '10 - 3',
        subSteps: [
          { prompt: 'What number are we starting at?', answer: '10' },
          { prompt: 'How many do we count back?', answer: '3' },
          { prompt: 'Start BEFORE 10. First number?', answer: '9' },
          { prompt: 'Second number?', answer: '8' },
          { prompt: 'Third number?', answer: '7' },
          { prompt: '10 - 3 = ?', answer: '7' }
        ]
      },
      {
        problem: '8 - 2',
        subSteps: [
          { prompt: 'Start BEFORE 8. Count back 2. First number?', answer: '7' },
          { prompt: 'Second number?', answer: '6' },
          { prompt: '8 - 2 = ?', answer: '6' }
        ]
      },
      {
        problem: '12 - 3',
        subSteps: [
          { prompt: 'Count back 3 from 12 (before 12): ?, ?, ?', answer: '11, 10, 9', alternates: ['11,10,9', '11 10 9'] },
          { prompt: 'Answer?', answer: '9' }
        ]
      }
    ],
    independentPractice: [
      { problem: '9 - 2', answer: 7 },
      { problem: '11 - 3', answer: 8 },
      { problem: '7 - 1', answer: 6 },
      { problem: '10 - 2', answer: 8 },
      { problem: '13 - 3', answer: 10 }
    ],
    check: [
      { problem: '8 - 3', answer: 5 },
      { problem: '10 - 2', answer: 8 },
      { problem: '9 - 1', answer: 8 },
      { problem: '11 - 2', answer: 9 },
      { problem: '12 - 3', answer: 9 }
    ]
  }
};

/**
 * Large Numbers Remediation Content (Top 5)
 */
export const LARGE_NUMBERS_REMEDIATION = {
  place_value_misunderstanding: {
    illustrate: {
      type: 'place_value_chart',
      description: 'Show 4,372 in a place value chart: Thousands=4, Hundreds=3, Tens=7, Ones=2. Highlight that the 4 is in the THOUSANDS column.'
    },
    explain: "You might have thought the 4 in 4,372 is just worth 4. But actually, its VALUE depends on its POSITION. Because it's in the thousands place, it's worth 4,000 — that's four thousand!",
    guidedPractice: [
      {
        problem: 'What is the value of 5 in 3,527?',
        subSteps: [
          { prompt: 'What position is the 5 in?', answer: 'hundreds', alternates: ['hundred'] },
          { prompt: 'So it\'s worth: 5 × 100 = ?', answer: '500' }
        ]
      },
      {
        problem: 'What is the value of 7 in 7,142?',
        subSteps: [
          { prompt: 'What position?', answer: 'thousands', alternates: ['thousand'] },
          { prompt: 'Value: 7 × 1000 = ?', answer: '7000', alternates: ['7,000'] }
        ]
      },
      {
        problem: 'Break 4,372 into place values',
        subSteps: [
          { prompt: 'Thousands: ?', answer: '4000', alternates: ['4,000'] },
          { prompt: 'Hundreds: ?', answer: '300' },
          { prompt: 'Tens: ?', answer: '70' },
          { prompt: 'Ones: ?', answer: '2' }
        ]
      }
    ],
    independentPractice: [
      { problem: 'Value of 3 in 2,345?', answer: 300 },
      { problem: 'Value of 6 in 6,789?', answer: 6000 },
      { problem: 'Value of 8 in 1,832?', answer: 800 },
      { problem: 'Value of 5 in 4,567?', answer: 500 },
      { problem: 'Value of 9 in 9,012?', answer: 9000 }
    ],
    check: [
      { problem: 'Value of 4 in 5,432?', answer: 400 },
      { problem: 'Value of 7 in 7,890?', answer: 7000 },
      { problem: 'Value of 2 in 3,256?', answer: 200 },
      { problem: 'Value of 6 in 6,123?', answer: 6000 },
      { problem: 'Value of 8 in 2,847?', answer: 800 }
    ]
  },

  large_column_misalignment: {
    illustrate: {
      type: 'place_value_chart',
      description: 'Show 4372+59 with numbers incorrectly aligned left (wrong) and correctly aligned right (correct). Highlight that ones must line up with ones, tens with tens.'
    },
    explain: "You might have thought you line up numbers from the left, like words in a book. But actually, in math we line up from the RIGHT. Ones under ones, tens under tens. The right edge is the 'anchor'!",
    guidedPractice: [
      {
        problem: 'Line up: 347 + 52',
        subSteps: [
          { prompt: 'Which digit of 52 goes under the 7?', answer: '2', hint: 'Ones under ones' },
          { prompt: 'Which digit goes under the 4?', answer: '5', hint: 'Tens under tens' },
          { prompt: 'Correct alignment: right edge lined up?', answer: 'yes' }
        ]
      },
      {
        problem: 'Add: 347 + 52 (lined up correctly)',
        subSteps: [
          { prompt: 'Ones: 7 + 2 = ?', answer: '9' },
          { prompt: 'Tens: 4 + 5 = ?', answer: '9' },
          { prompt: 'Hundreds: 3 + 0 = ?', answer: '3' },
          { prompt: 'Answer?', answer: '399' }
        ]
      },
      {
        problem: '4372 + 59',
        subSteps: [
          { prompt: '9 goes under which digit of 4372?', answer: '2' },
          { prompt: '5 goes under which digit?', answer: '7' },
          { prompt: 'Now add: Ones = 2+9 = ?', answer: '11' },
          { prompt: 'Write 1, carry 1. Tens: 7+5+1 = ?', answer: '13' },
          { prompt: 'Write 3, carry 1. Hundreds: 3+0+1 = ?', answer: '4' },
          { prompt: 'Thousands: 4+0 = ?', answer: '4' },
          { prompt: 'Answer?', answer: '4431' }
        ]
      }
    ],
    independentPractice: [
      { problem: '256 + 43', answer: 299 },
      { problem: '1234 + 56', answer: 1290 },
      { problem: '789 + 21', answer: 810 },
      { problem: '3456 + 78', answer: 3534 },
      { problem: '567 + 8', answer: 575 }
    ],
    check: [
      { problem: '345 + 67', answer: 412 },
      { problem: '2345 + 78', answer: 2423 },
      { problem: '678 + 9', answer: 687 },
      { problem: '4567 + 89', answer: 4656 },
      { problem: '890 + 12', answer: 902 }
    ]
  },

  partitioning_without_place_value: {
    illustrate: {
      type: 'base10_blocks',
      description: 'Show 4,372 as 4 thousand-blocks, 3 hundred-flats, 7 ten-rods, 2 ones. NOT as individual digits 4+3+7+2.'
    },
    explain: "You might have thought partitioning means breaking into individual digits (4+3+7+2=16). But actually, partitioning means breaking by PLACE VALUE: 4,000+300+70+2. Each part keeps its place value!",
    guidedPractice: [
      {
        problem: 'Partition 345',
        subSteps: [
          { prompt: 'Hundreds part?', answer: '300' },
          { prompt: 'Tens part?', answer: '40' },
          { prompt: 'Ones part?', answer: '5' },
          { prompt: 'Check: 300 + 40 + 5 = ?', answer: '345' }
        ]
      },
      {
        problem: 'Partition 1,234',
        subSteps: [
          { prompt: 'Thousands?', answer: '1000', alternates: ['1,000'] },
          { prompt: 'Hundreds?', answer: '200' },
          { prompt: 'Tens?', answer: '30' },
          { prompt: 'Ones?', answer: '4' }
        ]
      },
      {
        problem: 'Add 234 + 152 using partitioning',
        subSteps: [
          { prompt: '234 = 200 + 30 + 4. Correct?', answer: 'yes' },
          { prompt: '152 = 100 + 50 + 2. Correct?', answer: 'yes' },
          { prompt: 'Hundreds: 200 + 100 = ?', answer: '300' },
          { prompt: 'Tens: 30 + 50 = ?', answer: '80' },
          { prompt: 'Ones: 4 + 2 = ?', answer: '6' },
          { prompt: 'Combine: 300 + 80 + 6 = ?', answer: '386' }
        ]
      }
    ],
    independentPractice: [
      { problem: 'Partition 567', answer: '500+60+7', checkPartition: true },
      { problem: 'Partition 2,345', answer: '2000+300+40+5', checkPartition: true },
      { problem: '123 + 456 (partitioned)', answer: 579 },
      { problem: '234 + 321 (partitioned)', answer: 555 },
      { problem: 'Partition 4,008', answer: '4000+0+0+8', checkPartition: true }
    ],
    check: [
      { problem: 'Partition 678', answer: '600+70+8', checkPartition: true },
      { problem: 'Partition 3,456', answer: '3000+400+50+6', checkPartition: true },
      { problem: '345 + 234 (partitioned)', answer: 579 },
      { problem: '456 + 123 (partitioned)', answer: 579 },
      { problem: 'Partition 5,002', answer: '5000+0+0+2', checkPartition: true }
    ]
  },

  missing_zero_placeholders: {
    illustrate: {
      type: 'place_value_chart',
      description: 'Show 4,000 + 300 + 2 in a chart. Highlight that tens column is EMPTY (0), not skipped. Must write 4,302, not 432.'
    },
    explain: "You might have thought that if a place has nothing, you skip it. But actually, you MUST use 0 as a placeholder to keep all the other digits in the right place. Without the zero, 4302 becomes 432 — completely wrong!",
    guidedPractice: [
      {
        problem: '4,000 + 300 + 2',
        subSteps: [
          { prompt: 'Thousands: ?', answer: '4' },
          { prompt: 'Hundreds: ?', answer: '3' },
          { prompt: 'Tens: ?', answer: '0', hint: 'Empty? Use 0!' },
          { prompt: 'Ones: ?', answer: '2' },
          { prompt: 'Write the number:', answer: '4302', alternates: ['4,302'] }
        ]
      },
      {
        problem: '5,000 + 40 + 1',
        subSteps: [
          { prompt: 'Which place is empty?', answer: 'hundreds', alternates: ['hundred'] },
          { prompt: 'Write the number:', answer: '5041', alternates: ['5,041'] }
        ]
      },
      {
        problem: '3,000 + 7',
        subSteps: [
          { prompt: 'Which places are empty?', answer: 'hundreds and tens', alternates: ['hundreds, tens', 'tens and hundreds'] },
          { prompt: 'Write the number:', answer: '3007', alternates: ['3,007'] }
        ]
      },
      {
        problem: '2,000 + 300 + 50',
        subSteps: [
          { prompt: 'Write with zero placeholder:', answer: '2350', alternates: ['2,350'] }
        ]
      }
    ],
    independentPractice: [
      { problem: '6,000 + 200 + 3', answer: 6203 },
      { problem: '7,000 + 50 + 2', answer: 7052 },
      { problem: '8,000 + 9', answer: 8009 },
      { problem: '1,000 + 400 + 60', answer: 1460 },
      { problem: '9,000 + 10 + 5', answer: 9015 }
    ],
    check: [
      { problem: '5,000 + 300 + 4', answer: 5304 },
      { problem: '6,000 + 70 + 8', answer: 6078 },
      { problem: '7,000 + 6', answer: 7006 },
      { problem: '2,000 + 500 + 20', answer: 2520 },
      { problem: '4,000 + 30 + 1', answer: 4031 }
    ]
  },

  poor_estimation: {
    illustrate: {
      type: 'number_line',
      description: 'Show 347 and 256 on a number line. Round 347 to 350, and 256 to 250 (or 260). Show that ~350+~250=~600.'
    },
    explain: "You might have thought estimation doesn't matter as long as you get the exact answer. But actually, estimation is a REASONABLENESS CHECK. If 347+256 should be around 600, and you get 90 or 5,000, you know something went wrong!",
    guidedPractice: [
      {
        problem: 'Estimate: 347 + 256',
        subSteps: [
          { prompt: 'Round 347 to nearest 10:', answer: '350', alternates: ['~350', 'about 350'] },
          { prompt: 'Round 256 to nearest 10:', answer: '260', alternates: ['~260', 'about 260'] },
          { prompt: 'Estimate: 350 + 260 ≈ ?', answer: '610', alternates: ['~610', 'about 610', '600'] },
          { prompt: 'So the real answer should be close to?', answer: '600', alternates: ['610', 'around 600'] }
        ]
      },
      {
        problem: 'Estimate: 482 - 198',
        subSteps: [
          { prompt: 'Round 482:', answer: '480', alternates: ['500', '~480'] },
          { prompt: 'Round 198:', answer: '200', alternates: ['~200'] },
          { prompt: 'Estimate: 480 - 200 ≈ ?', answer: '280', alternates: ['~280', '300-200=100, so ~280'] }
        ]
      },
      {
        problem: 'Is 347 + 256 = 5,903 reasonable?',
        subSteps: [
          { prompt: 'What should the estimate be?', answer: '~600', alternates: ['about 600', '600'] },
          { prompt: 'Is 5,903 close to 600?', answer: 'no' },
          { prompt: 'So this answer is:', answer: 'wrong', alternates: ['incorrect', 'unreasonable'] }
        ]
      }
    ],
    independentPractice: [
      { problem: 'Estimate: 523 + 378', answer: 900, acceptRange: [850, 950] },
      { problem: 'Estimate: 654 - 298', answer: 350, acceptRange: [300, 400] },
      { problem: 'Estimate: 1,234 + 2,567', answer: 3800, acceptRange: [3700, 3900] },
      { problem: 'Is 478 + 321 = 799 reasonable?', answer: 'yes', alternates: ['y', 'yeah'] },
      { problem: 'Is 567 - 234 = 933 reasonable?', answer: 'no', alternates: ['n', 'nope'] }
    ],
    check: [
      { problem: 'Estimate: 456 + 234', answer: 690, acceptRange: [650, 750] },
      { problem: 'Estimate: 789 - 456', answer: 330, acceptRange: [300, 400] },
      { problem: 'Estimate: 2,345 + 1,234', answer: 3600, acceptRange: [3500, 3700] },
      { problem: 'Is 678 + 543 = 1,221 reasonable?', answer: 'yes' },
      { problem: 'Is 890 - 234 = 1,124 reasonable?', answer: 'no' }
    ]
  }
};

/**
 * Placeholder content for remaining 15 misunderstandings
 */
export const PLACEHOLDER_REMEDIATION = {
  // Addition (5 more)
  commutativity_unknown: { placeholder: true },
  digit_by_digit_addition: { placeholder: true },
  zero_addition_misconception: { placeholder: true },
  column_misalignment: { placeholder: true },
  compensation_wrong_direction: { placeholder: true },

  // Subtraction (5 more)
  borrowing_forgets_to_reduce: { placeholder: true },
  subtracting_from_powers_of_10: { placeholder: true },
  think_addition_fails: { placeholder: true },
  compensation_reversed_subtraction: { placeholder: true },
  misreads_as_addition: { placeholder: true },

  // Large numbers (5 more)
  carrying_cascade_errors: { placeholder: true },
  sequencing_working_memory_overload: { placeholder: true },
  compensation_adjustment_size_error: { placeholder: true },
  reading_writing_large_numbers: { placeholder: true },
  inappropriate_method_choice: { placeholder: true }
};

/**
 * Gets remediation content for a misunderstanding ID.
 * @param {string} misunderstandingId - ID of the misunderstanding
 * @returns {Object|null} Remediation content or null
 */
export function getRemediationContent(misunderstandingId) {
  return ADDITION_REMEDIATION[misunderstandingId] ||
         SUBTRACTION_REMEDIATION[misunderstandingId] ||
         LARGE_NUMBERS_REMEDIATION[misunderstandingId] ||
         PLACEHOLDER_REMEDIATION[misunderstandingId] ||
         null;
}
