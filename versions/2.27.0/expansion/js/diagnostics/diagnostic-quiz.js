/**
 * Diagnostic Quiz
 * Identifies what the user knows vs needs to learn through exploratory assessment.
 */

import { ADDITION_STRATEGIES, SUBTRACTION_STRATEGIES } from '../expansion-config.js';
import { generateAdditionProblem } from '../facts/addition-facts.js';
import { generateSubtractionProblem } from '../facts/subtraction-facts.js';
import { loadExpansionData, saveExpansionData } from '../data/expansion-storage.js';
import { shuffle } from '../expansion-utils.js';
import { analyseErrors } from './error-patterns.js';
import { trackMisunderstanding } from './misunderstanding-tracker.js';

// Current quiz state
let currentQuiz = null;

/**
 * Creates a diagnostic quiz.
 * @param {string} type - 'addition', 'subtraction', or 'both'
 * @returns {Object} Quiz object
 */
export function createDiagnosticQuiz(type = 'both') {
  const questions = [];

  // Generate 5 questions per strategy
  if (type === 'addition' || type === 'both') {
    ADDITION_STRATEGIES.forEach(strategy => {
      for (let i = 0; i < 5; i++) {
        const problem = generateAdditionProblem(strategy.id);
        questions.push({
          ...problem,
          operation: 'addition',
          strategyId: strategy.id,
          strategyName: strategy.name
        });
      }
    });
  }

  if (type === 'subtraction' || type === 'both') {
    SUBTRACTION_STRATEGIES.forEach(strategy => {
      for (let i = 0; i < 5; i++) {
        const problem = generateSubtractionProblem(strategy.id);
        questions.push({
          ...problem,
          operation: 'subtraction',
          strategyId: strategy.id,
          strategyName: strategy.name
        });
      }
    });
  }

  currentQuiz = {
    type,
    questions: shuffle(questions),
    currentIndex: 0,
    results: [],
    startTime: Date.now()
  };

  return currentQuiz;
}

/**
 * Gets the next question in the quiz.
 * @returns {Object|null} Question object or null if quiz ended
 */
export function getNextQuestion() {
  if (!currentQuiz) {
    throw new Error('No active quiz');
  }

  if (currentQuiz.currentIndex >= currentQuiz.questions.length) {
    return null;
  }

  const question = currentQuiz.questions[currentQuiz.currentIndex];
  question.startTime = Date.now();

  return question;
}

/**
 * Submits an answer for the current question.
 * @param {number} answer - User's answer
 * @returns {{correct: boolean, correctAnswer: number, timeTaken: number}}
 */
export function submitAnswer(answer) {
  if (!currentQuiz) {
    throw new Error('No active quiz');
  }

  const question = currentQuiz.questions[currentQuiz.currentIndex];
  const timeTaken = Date.now() - question.startTime;
  const correct = parseInt(answer) === question.answer;

  currentQuiz.results.push({
    strategyId: question.strategyId,
    operation: question.operation,
    factKey: question.factKey,
    correct,
    timeTaken,
    // Store full data for error pattern detection
    problem: {
      a: question.a,
      b: question.b,
      operation: question.operation,
      strategyId: question.strategyId,
      answer: question.answer
    },
    userAnswer: parseInt(answer),
    correctAnswer: question.answer
  });

  currentQuiz.currentIndex++;

  return {
    correct,
    correctAnswer: question.answer,
    timeTaken
  };
}

/**
 * Ends the quiz and analyzes results.
 * @returns {Object} Diagnostic results
 */
export function endQuiz() {
  if (!currentQuiz) {
    throw new Error('No active quiz');
  }

  // Analyze results by strategy
  const strategyResults = {};
  currentQuiz.results.forEach(result => {
    if (!strategyResults[result.strategyId]) {
      strategyResults[result.strategyId] = {
        asked: 0,
        correct: 0,
        totalTime: 0,
        operation: result.operation
      };
    }

    const stats = strategyResults[result.strategyId];
    stats.asked++;
    if (result.correct) stats.correct++;
    stats.totalTime += result.timeTaken;
  });

  // Calculate accuracy and status for each strategy
  Object.keys(strategyResults).forEach(strategyId => {
    const stats = strategyResults[strategyId];
    stats.accuracy = stats.asked > 0 ? stats.correct / stats.asked : 0;
    stats.avgTimeMs = stats.asked > 0 ? stats.totalTime / stats.asked : 0;

    // Determine status
    if (stats.accuracy >= 0.8 && stats.avgTimeMs < 5000) {
      stats.status = 'strong';
    } else if (stats.accuracy >= 0.6) {
      stats.status = 'developing';
    } else {
      stats.status = 'needs-work';
    }
  });

  // Identify weaknesses
  const identifiedWeaknesses = Object.entries(strategyResults)
    .filter(([_, stats]) => stats.status === 'needs-work')
    .map(([strategyId, stats]) => ({
      strategyId,
      operation: stats.operation,
      accuracy: stats.accuracy,
      suggestedAction: stats.accuracy < 0.4
        ? 'Start with teaching visuals and practice'
        : 'Review strategy and practice'
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // Suggested path: strategies needing work in order
  const suggestedPath = Object.entries(strategyResults)
    .filter(([_, stats]) => stats.status !== 'strong')
    .sort((a, b) => {
      // Sort by status priority (needs-work first), then teaching order
      const statusOrder = { 'needs-work': 0, 'developing': 1 };
      if (statusOrder[a[1].status] !== statusOrder[b[1].status]) {
        return statusOrder[a[1].status] - statusOrder[b[1].status];
      }
      return 0;
    })
    .map(([strategyId]) => strategyId);

  // Determine overall level
  const totalCorrect = currentQuiz.results.filter(r => r.correct).length;
  const totalQuestions = currentQuiz.results.length;
  const overallAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

  let overallLevel;
  if (overallAccuracy >= 0.9) {
    overallLevel = 'fluent';
  } else if (overallAccuracy >= 0.75) {
    overallLevel = 'secure';
  } else if (overallAccuracy >= 0.5) {
    overallLevel = 'developing';
  } else {
    overallLevel = 'beginner';
  }

  // Run error pattern detection on incorrect answers
  const detectedMisunderstandings = analyseErrors(currentQuiz.results);

  // Track each detected misunderstanding
  detectedMisunderstandings.forEach(misunderstanding => {
    trackMisunderstanding(misunderstanding);
  });

  const results = {
    strategyResults,
    identifiedWeaknesses,
    suggestedPath,
    overallLevel,
    totalQuestions,
    totalCorrect,
    overallAccuracy,
    detectedMisunderstandings
  };

  // Save results to storage
  saveDiagnosticResults(results);

  currentQuiz = null;

  return results;
}

/**
 * Saves diagnostic results to storage.
 * @param {Object} results - Diagnostic results
 */
function saveDiagnosticResults(results) {
  const data = loadExpansionData();

  if (!data.diagnostics.identified) {
    data.diagnostics.identified = [];
  }

  data.diagnostics.identified.push({
    date: new Date().toISOString(),
    overallLevel: results.overallLevel,
    weakStrategies: results.identifiedWeaknesses.map(w => w.strategyId),
    suggestedPath: results.suggestedPath
  });

  saveExpansionData(data);
}

/**
 * Gets current quiz state.
 * @returns {Object|null} Current quiz or null
 */
export function getCurrentQuiz() {
  return currentQuiz;
}
