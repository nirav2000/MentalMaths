/**
 * Addition Practice Session Manager
 * Manages practice sessions, tracks results, and updates mastery.
 */

import { generateAdditionProblem, getFactsByStrategy, getAllAdditionFacts } from './addition-facts.js';
import { updateFactMastery } from '../data/expansion-storage.js';
import { shuffle } from '../expansion-utils.js';

// Session state
let currentSession = null;

/**
 * Starts a new practice session.
 * @param {string} strategyId - Strategy ID or 'mixed'
 * @param {number} count - Number of problems (default 20)
 * @returns {Object} Session object
 */
export function startPractice(strategyId = 'mixed', count = 20) {
  const problems = generateProblems(strategyId, count);

  currentSession = {
    strategyId,
    totalProblems: count,
    problems: shuffle(problems),
    currentIndex: 0,
    results: [],
    startTime: Date.now()
  };

  return currentSession;
}

/**
 * Generates problems for the session.
 * @param {string} strategyId - Strategy ID or 'mixed'
 * @param {number} count - Number of problems
 * @returns {Array} Array of problems
 */
function generateProblems(strategyId, count) {
  if (strategyId === 'mixed') {
    const allFacts = getAllAdditionFacts();
    const shuffled = shuffle(allFacts);
    return shuffled.slice(0, count).map(fact => ({
      ...generateAdditionProblem(fact.strategy),
      a: fact.a,
      b: fact.b,
      answer: fact.answer
    }));
  } else {
    const problems = [];
    for (let i = 0; i < count; i++) {
      problems.push(generateAdditionProblem(strategyId));
    }
    return problems;
  }
}

/**
 * Gets the next problem in the session.
 * @returns {Object|null} Problem object or null if session ended
 */
export function getNextProblem() {
  if (!currentSession) {
    throw new Error('No active practice session');
  }

  if (currentSession.currentIndex >= currentSession.totalProblems) {
    return null;
  }

  const problem = currentSession.problems[currentSession.currentIndex];
  problem.startTime = Date.now();

  return problem;
}

/**
 * Submits an answer for the current problem.
 * @param {number} answer - User's answer
 * @returns {{correct: boolean, correctAnswer: number, timeTaken: number, feedback: string}}
 */
export function submitAnswer(answer) {
  if (!currentSession) {
    throw new Error('No active practice session');
  }

  const problem = currentSession.problems[currentSession.currentIndex];
  const timeTaken = Date.now() - problem.startTime;
  const correct = parseInt(answer) === problem.answer;

  // Track result
  const result = {
    factKey: problem.factKey,
    correct,
    timeTaken,
    userAnswer: answer,
    correctAnswer: problem.answer
  };

  currentSession.results.push(result);

  // Update mastery in storage
  updateFactMastery(problem.factKey, correct, timeTaken);

  // Generate feedback
  let feedback = correct
    ? 'Correct! Well done!'
    : `Not quite. The answer is ${problem.answer}.`;

  // Move to next problem
  currentSession.currentIndex++;

  return {
    correct,
    correctAnswer: problem.answer,
    timeTaken,
    feedback
  };
}

/**
 * Ends the current practice session.
 * @returns {{total: number, correct: number, accuracy: number, avgTime: number, factResults: Array}}
 */
export function endPractice() {
  if (!currentSession) {
    throw new Error('No active practice session');
  }

  const total = currentSession.results.length;
  const correct = currentSession.results.filter(r => r.correct).length;
  const accuracy = total > 0 ? correct / total : 0;

  const totalTime = currentSession.results.reduce((sum, r) => sum + r.timeTaken, 0);
  const avgTime = total > 0 ? totalTime / total : 0;

  const summary = {
    strategyId: currentSession.strategyId,
    total,
    correct,
    accuracy,
    avgTime,
    factResults: currentSession.results,
    duration: Date.now() - currentSession.startTime
  };

  currentSession = null;

  return summary;
}

/**
 * Gets current session state.
 * @returns {Object|null} Current session or null
 */
export function getCurrentSession() {
  return currentSession;
}

/**
 * Checks if there's an active session.
 * @returns {boolean} True if session is active
 */
export function hasActiveSession() {
  return currentSession !== null;
}
