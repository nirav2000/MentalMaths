/**
 * Diagnostic Quiz UI
 * Encouraging, exploratory interface for diagnostic assessment.
 */

import { createDiagnosticQuiz, getNextQuestion, submitAnswer, endQuiz, getCurrentQuiz } from './diagnostic-quiz.js';
import { COLOURS } from '../expansion-config.js';

let currentQuestion = null;
let quizStartTime = null;

/**
 * Renders the diagnostic quiz intro screen.
 * @param {HTMLElement} container - Container element
 */
export function renderDiagnosticIntro(container) {
  container.innerHTML = `
    <div class="diagnostic-intro">
      <h1>Let's Explore What You Know! 🌟</h1>
      <div class="intro-content">
        <p>This isn't a test — it's an exploration to help us understand your current skills and create a personalized learning path just for you!</p>

        <div class="intro-features">
          <div class="feature">
            <span class="feature-icon">✨</span>
            <p><strong>No pressure!</strong> We're just curious about what you already know</p>
          </div>
          <div class="feature">
            <span class="feature-icon">🎯</span>
            <p><strong>Personalized path:</strong> We'll suggest the perfect starting point</p>
          </div>
          <div class="feature">
            <span class="feature-icon">⏱️</span>
            <p><strong>Your pace:</strong> Take your time with each question</p>
          </div>
        </div>

        <p class="intro-details">You'll see a variety of problems covering different strategies. Just answer what you can, and we'll figure out the rest together!</p>

        <div class="quiz-options">
          <button class="btn btn-primary btn-large" id="start-both">Explore Both Addition & Subtraction</button>
          <button class="btn btn-secondary" id="start-addition">Just Addition For Now</button>
          <button class="btn btn-secondary" id="start-subtraction">Just Subtraction For Now</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the quiz screen.
 * @param {HTMLElement} container - Container element
 */
export function renderQuizScreen(container) {
  const quiz = getCurrentQuiz();
  if (!quiz) {
    container.innerHTML = '<p>No active quiz. Please start a new quiz.</p>';
    return;
  }

  currentQuestion = getNextQuestion();
  if (!currentQuestion) {
    renderResultsScreen(container);
    return;
  }

  const progress = ((quiz.currentIndex + 1) / quiz.questions.length) * 100;
  const operator = currentQuestion.operation === 'addition' ? '+' : '−';

  container.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <p class="progress-text">Question ${quiz.currentIndex + 1} of ${quiz.questions.length}</p>

      <div class="quiz-problem">
        <div class="problem-equation">
          <span>${currentQuestion.a}</span>
          <span class="operator">${operator}</span>
          <span>${currentQuestion.b}</span>
          <span class="operator">=</span>
          <span>?</span>
        </div>
      </div>

      <div class="quiz-input-area">
        <input type="number" id="quiz-answer" class="quiz-input" placeholder="Your answer" autofocus />
      </div>

      <div class="quiz-timer">
        <span id="timer-display">0.0s</span>
      </div>

      <div id="quiz-feedback"></div>
    </div>
  `;

  // Start timer display
  quizStartTime = Date.now();
  const timerInterval = setInterval(() => {
    if (!currentQuestion) {
      clearInterval(timerInterval);
      return;
    }
    const elapsed = (Date.now() - currentQuestion.startTime) / 1000;
    const display = document.getElementById('timer-display');
    if (display) {
      display.textContent = `${elapsed.toFixed(1)}s`;
    }
  }, 100);

  // Handle answer submission
  const input = document.getElementById('quiz-answer');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value) {
      clearInterval(timerInterval);
      handleQuizAnswer(container, input.value);
    }
  });
}

/**
 * Handles quiz answer submission.
 * @param {HTMLElement} container - Container element
 * @param {string} answer - User's answer
 */
function handleQuizAnswer(container, answer) {
  const result = submitAnswer(answer);
  const input = document.getElementById('quiz-answer');
  input.disabled = true;

  const feedback = document.getElementById('quiz-feedback');
  feedback.innerHTML = `
    <div class="quiz-feedback ${result.correct ? 'correct' : 'incorrect'}">
      <p>${result.correct ? '✓ Great!' : `The answer is ${result.correctAnswer}`}</p>
    </div>
  `;

  // Auto-advance after brief delay
  setTimeout(() => {
    renderQuizScreen(container);
  }, 800);
}

/**
 * Renders the results screen.
 * @param {HTMLElement} container - Container element
 */
export function renderResultsScreen(container) {
  const results = endQuiz();

  const levelEmoji = {
    'fluent': '🌟',
    'secure': '✨',
    'developing': '🌱',
    'beginner': '🌱'
  };

  const levelMessage = {
    'fluent': "You're already fluent! Amazing work!",
    'secure': "You've got a secure foundation! Let's build on it.",
    'developing': "You're developing well! Let's strengthen your skills.",
    'beginner': "Perfect starting point! Let's begin your journey."
  };

  // Group strategies by status
  const strongStrategies = Object.entries(results.strategyResults)
    .filter(([_, stats]) => stats.status === 'strong')
    .map(([id]) => id);

  const developingStrategies = Object.entries(results.strategyResults)
    .filter(([_, stats]) => stats.status === 'developing')
    .map(([id]) => id);

  const needsWorkStrategies = Object.entries(results.strategyResults)
    .filter(([_, stats]) => stats.status === 'needs-work')
    .map(([id]) => id);

  container.innerHTML = `
    <div class="results-container">
      <h1>Wonderful Exploration! ${levelEmoji[results.overallLevel]}</h1>

      <div class="overall-result">
        <p class="result-message">${levelMessage[results.overallLevel]}</p>
        <div class="result-stats">
          <span class="stat-big">${results.totalCorrect}/${results.totalQuestions}</span>
          <span class="stat-label">problems explored</span>
        </div>
      </div>

      <div class="strategy-breakdown">
        <h2>Your Skills Map</h2>

        ${strongStrategies.length > 0 ? `
          <div class="skill-group strong">
            <h3><span style="color: ${COLOURS.fluent}">✓</span> Strengths (${strongStrategies.length})</h3>
            <p class="skill-message">You're doing great with these!</p>
          </div>
        ` : ''}

        ${developingStrategies.length > 0 ? `
          <div class="skill-group developing">
            <h3><span style="color: ${COLOURS.developing}">●</span> Growing Skills (${developingStrategies.length})</h3>
            <p class="skill-message">These are coming along nicely. A bit more practice will help!</p>
          </div>
        ` : ''}

        ${needsWorkStrategies.length > 0 ? `
          <div class="skill-group needs-work">
            <h3><span style="color: ${COLOURS.learning}">◐</span> New Adventures (${needsWorkStrategies.length})</h3>
            <p class="skill-message">Perfect opportunities to learn something new!</p>
          </div>
        ` : ''}
      </div>

      <div class="suggested-path">
        <h2>Your Personalized Learning Path 🎯</h2>
        <p>We recommend starting with these strategies in order:</p>
        <ol id="path-list"></ol>
      </div>

      <div class="results-actions">
        <button class="btn btn-primary btn-large" id="start-learning">Start Your Learning Journey!</button>
        <button class="btn btn-secondary" id="back-home">Maybe Later</button>
      </div>
    </div>
  `;
}

/**
 * Gets current question.
 * @returns {Object|null} Current question
 */
export function getCurrentQuestion() {
  return currentQuestion;
}
