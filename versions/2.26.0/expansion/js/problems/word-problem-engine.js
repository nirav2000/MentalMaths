// Word Problem Generation Engine
// Generates contextual word problems with scaffolding support

import { templates, themes, operationKeywords } from './word-problem-templates.js';

export function generateWordProblem(category, level = 3, difficulty = 'medium') {
  // Select a random template for this category
  const templateOptions = templates[category];
  if (!templateOptions) {
    throw new Error(`Unknown word problem category: ${category}`);
  }
  const template = templateOptions[Math.floor(Math.random() * templateOptions.length)];

  // Select a random theme
  const theme = themes[Math.floor(Math.random() * themes.length)];

  // Generate appropriate numbers based on level and difficulty
  const numbers = generateNumbers(category, level, difficulty);

  // Calculate the answer
  const { operation, answer, numbers: orderedNumbers } = calculateAnswer(category, numbers);

  // Select contextual data from theme
  const context = selectContext(theme, category);

  // Fill in the template
  const text = fillTemplate(template, orderedNumbers, context, theme);

  // Generate number sentence
  const numberSentence = generateNumberSentence(category, orderedNumbers);

  // Generate scaffolding
  const scaffolding = generateScaffolding(text, orderedNumbers, operation, answer, category);

  return {
    text,
    numbers: orderedNumbers,
    operation,
    answer,
    category,
    numberSentence,
    scaffolding,
    level,
    difficulty
  };
}

function generateNumbers(category, level, difficulty) {
  // Level-based number ranges (matching problem-generator.js levels)
  const ranges = {
    2: { easy: [10, 50], medium: [20, 89], hard: [50, 99] },
    3: { easy: [20, 100], medium: [30, 200], hard: [50, 300] },
    4: { easy: [100, 500], medium: [200, 899], hard: [400, 999] },
    5: { easy: [1000, 5000], medium: [2000, 8999], hard: [5000, 9999] }
  };

  const [min, max] = ranges[level][difficulty];

  // Generate 2 or 3 numbers depending on category
  if (category === 'multi_step') {
    return [
      randomInRange(min, max),
      randomInRange(min * 0.3, max * 0.6),
      randomInRange(min * 0.2, max * 0.4)
    ];
  } else if (category === 'estimation') {
    // For estimation, generate numbers close to round values
    const n1 = roundToNearest(randomInRange(min, max), 100);
    const n2 = roundToNearest(randomInRange(min, max), 100);
    return [n1 + randomInRange(-50, 50), n2 + randomInRange(-50, 50)];
  } else if (category.includes('compare') || category.includes('separate_start')) {
    // For compare problems, ensure n1 > n2
    const n1 = randomInRange(min + 50, max);
    const n2 = randomInRange(min, n1 - 20);
    return [n1, n2];
  } else if (category.includes('change_unknown')) {
    // Result is bigger than start
    const n1 = randomInRange(min, max * 0.7);
    const n2 = randomInRange(n1 + 10, max);
    return [n1, n2];
  } else {
    // Standard two numbers
    return [
      randomInRange(min, max),
      randomInRange(min * 0.3, max * 0.8)
    ];
  }
}

function calculateAnswer(category, numbers) {
  const [n1, n2, n3] = numbers;

  const calculations = {
    join_result_unknown: { operation: 'addition', answer: n1 + n2, numbers: [n1, n2] },
    separate_result_unknown: { operation: 'subtraction', answer: n1 - n2, numbers: [n1, n2] },
    join_change_unknown: { operation: 'subtraction', answer: n2 - n1, numbers: [n1, n2] },
    separate_change_unknown: { operation: 'subtraction', answer: n1 - n2, numbers: [n1, n2] },
    separate_start_unknown: { operation: 'addition', answer: n1 + n2, numbers: [n1, n2] },
    compare_difference: { operation: 'subtraction', answer: n1 - n2, numbers: [n1, n2] },
    compare_bigger_unknown: { operation: 'subtraction', answer: n1 - n2, numbers: [n1, n2] },
    multi_step: { operation: 'mixed', answer: n1 + n2 - n3, numbers: [n1, n2, n3] },
    estimation: { operation: 'addition', answer: n1 + n2, numbers: [n1, n2] }
  };

  return calculations[category] || { operation: 'addition', answer: n1 + n2, numbers: [n1, n2] };
}

function selectContext(theme, category) {
  const names = theme.names;
  const name1 = names[Math.floor(Math.random() * names.length)];
  const name2 = names[Math.floor(Math.random() * names.length)];

  // Determine pronoun based on name
  const pronoun = getPronoun(name1);

  return {
    name: name1,
    name1: name1,
    name2: name2 === name1 ? names[(names.indexOf(name1) + 1) % names.length] : name2,
    object: theme.objectPlural || theme.object,
    place: theme.place,
    place1: theme.place1 || theme.place,
    place2: theme.place2 || theme.place,
    pronoun: pronoun.subject,
    pronoun_obj: pronoun.object,
    verb_got: theme.verbs.got,
    verb_added: theme.verbs.added,
    verb_counted: theme.verbs.counted,
    verb_arrived: theme.verbs.arrived
  };
}

function getPronoun(name) {
  // Simple heuristic - could be expanded
  const femaleNames = ['Aisha', 'Maya', 'Emma', 'Sophia', 'Ava', 'Isabella', 'Ruby', 'Ella', 'Mia'];
  const maleNames = ['Sam', 'Leo', 'Jordan', 'Oliver', 'Noah', 'Liam', 'Alex', 'Charlie', 'Oscar', 'Jack', 'Lucas', 'James'];

  if (femaleNames.includes(name)) {
    return { subject: 'she', object: 'her', possessive: 'her' };
  } else if (maleNames.includes(name)) {
    return { subject: 'he', object: 'him', possessive: 'his' };
  } else {
    return { subject: 'they', object: 'them', possessive: 'their' };
  }
}

function fillTemplate(template, numbers, context, theme) {
  let text = template;

  // Replace number placeholders
  text = text.replace(/{n1}/g, numbers[0].toLocaleString());
  text = text.replace(/{n2}/g, numbers[1].toLocaleString());
  if (numbers[2] !== undefined) {
    text = text.replace(/{n3}/g, numbers[2].toLocaleString());
  }

  // Replace context placeholders
  Object.keys(context).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    text = text.replace(regex, context[key]);
  });

  return text;
}

function generateNumberSentence(category, numbers) {
  const [n1, n2, n3] = numbers;

  const sentences = {
    join_result_unknown: `${n1} + ${n2} = ?`,
    separate_result_unknown: `${n1} − ${n2} = ?`,
    join_change_unknown: `${n1} + ? = ${n2}`,
    separate_change_unknown: `${n1} − ? = ${n2}`,
    separate_start_unknown: `? − ${n1} = ${n2}`,
    compare_difference: `${n1} − ${n2} = ?`,
    compare_bigger_unknown: `${n1} − ${n2} = ?`,
    multi_step: `${n1} + ${n2} − ${n3} = ?`,
    estimation: `${n1} + ${n2} ≈ ?`
  };

  return sentences[category] || `${n1} + ${n2} = ?`;
}

function generateScaffolding(text, numbers, operation, answer, category) {
  // Level 1: Highlighted text with numbers, keywords, and question marked
  const highlightedText = highlightKeyInfo(text, numbers, operation);

  // Level 2: Bar model data
  const barModel = generateBarModel(numbers, operation, answer, category);

  // Level 3: Number sentence prompt
  const numberSentencePrompt = generateNumberSentencePrompt(category, numbers);

  return {
    highlightedText,
    barModel,
    numberSentencePrompt
  };
}

function highlightKeyInfo(text, numbers, operation) {
  let highlighted = text;

  // Highlight numbers in blue
  numbers.forEach(num => {
    const formatted = num.toLocaleString();
    const regex = new RegExp(formatted, 'g');
    highlighted = highlighted.replace(regex, `<span class="highlight-number">${formatted}</span>`);
  });

  // Highlight operation keywords in green
  const keywords = operation === 'addition'
    ? operationKeywords.addition
    : operation === 'subtraction'
    ? operationKeywords.subtraction
    : [...operationKeywords.addition, ...operationKeywords.subtraction];

  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlighted = highlighted.replace(regex, `<span class="highlight-keyword">${keyword}</span>`);
  });

  // Highlight question words in yellow
  operationKeywords.question.forEach(question => {
    const regex = new RegExp(`\\b${question}\\b`, 'gi');
    highlighted = highlighted.replace(regex, `<span class="highlight-question">${question}</span>`);
  });

  return highlighted;
}

function generateBarModel(numbers, operation, answer, category) {
  const [n1, n2, n3] = numbers;

  // Determine bar model type based on category
  if (category.includes('join') || category === 'separate_start_unknown') {
    return {
      type: 'part-whole',
      parts: [n1, n2],
      whole: answer,
      unknown: category.includes('change_unknown') ? 'part2' : category.includes('start') ? 'part1' : 'whole'
    };
  } else if (category.includes('separate') && category !== 'separate_start_unknown') {
    return {
      type: 'part-whole',
      parts: [answer, n2],
      whole: n1,
      unknown: category.includes('change_unknown') ? 'part2' : 'part1'
    };
  } else if (category.includes('compare')) {
    return {
      type: 'comparison',
      larger: n1,
      smaller: category === 'compare_bigger_unknown' ? answer : n2,
      difference: category === 'compare_bigger_unknown' ? n2 : answer,
      unknown: category === 'compare_bigger_unknown' ? 'smaller' : 'difference'
    };
  } else if (category === 'multi_step') {
    return {
      type: 'multi-step',
      steps: [
        { operation: 'addition', parts: [n1, n2], result: n1 + n2 },
        { operation: 'subtraction', parts: [n1 + n2, n3], result: answer }
      ]
    };
  } else {
    return {
      type: 'part-whole',
      parts: [n1, n2],
      whole: answer,
      unknown: 'whole'
    };
  }
}

function generateNumberSentencePrompt(category, numbers) {
  const prompts = {
    join_result_unknown: 'Write this as an addition: ___ + ___ = ?',
    separate_result_unknown: 'Write this as a subtraction: ___ − ___ = ?',
    join_change_unknown: 'What was added? Write: ___ + ? = ___',
    separate_change_unknown: 'What was taken away? Write: ___ − ? = ___',
    separate_start_unknown: 'What was the starting amount? Write: ? − ___ = ___',
    compare_difference: 'Find the difference: ___ − ___ = ?',
    compare_bigger_unknown: 'If one has more, who has less? Write: ___ − ___ = ?',
    multi_step: 'What operations do you need? Write: ___ ○ ___ ○ ___ = ?',
    estimation: 'Round each number first, then add: ___ + ___ ≈ ?'
  };

  return prompts[category] || 'Write this as a number sentence: ___ ○ ___ = ?';
}

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToNearest(num, nearest) {
  return Math.round(num / nearest) * nearest;
}

export function getCategoryInfo(category) {
  const info = {
    join_result_unknown: {
      name: 'Join (Result Unknown)',
      description: 'Two amounts combined, find the total',
      difficulty: 'easy',
      operation: 'addition'
    },
    separate_result_unknown: {
      name: 'Separate (Result Unknown)',
      description: 'Take away from a starting amount',
      difficulty: 'easy',
      operation: 'subtraction'
    },
    join_change_unknown: {
      name: 'Join (Change Unknown)',
      description: 'Find how much was added',
      difficulty: 'medium',
      operation: 'subtraction'
    },
    separate_change_unknown: {
      name: 'Separate (Change Unknown)',
      description: 'Find how much was taken away',
      difficulty: 'medium',
      operation: 'subtraction'
    },
    separate_start_unknown: {
      name: 'Separate (Start Unknown)',
      description: 'Find the starting amount',
      difficulty: 'hard',
      operation: 'addition'
    },
    compare_difference: {
      name: 'Compare (Difference)',
      description: 'Find how many more one has than another',
      difficulty: 'medium',
      operation: 'subtraction'
    },
    compare_bigger_unknown: {
      name: 'Compare (Smaller Unknown)',
      description: 'Find the smaller amount in a comparison',
      difficulty: 'hard',
      operation: 'subtraction'
    },
    multi_step: {
      name: 'Multi-Step',
      description: 'Multiple operations needed',
      difficulty: 'hard',
      operation: 'mixed'
    },
    estimation: {
      name: 'Estimation',
      description: 'Round and estimate the answer',
      difficulty: 'medium',
      operation: 'addition'
    }
  };

  return info[category] || { name: category, description: 'Word problem', difficulty: 'medium' };
}

export function getAllCategories() {
  return Object.keys(templates).map(category => ({
    id: category,
    ...getCategoryInfo(category)
  }));
}
