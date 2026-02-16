/**
 * Remediation UI
 * Renders the step-by-step remediation flow for misunderstandings.
 */

import { createRemediationUnit, getCurrentStep, advanceStep, resetUnit, validateAnswer, requiresPartitionCheck, validatePartition } from './remediation-engine.js';
import { recordRemediationAttempt, resolveMisunderstanding } from './misunderstanding-tracker.js';

let currentUnit = null;
let currentProblemIndex = 0;
let currentSubStepIndex = 0;
let problemStartTime = null;
let stepResults = [];

/**
 * Starts a remediation unit for a misunderstanding.
 * @param {HTMLElement} container - Container element
 * @param {string} misunderstandingId - ID of misunderstanding to remediate
 */
export function startRemediationUnit(container, misunderstandingId) {
  currentUnit = createRemediationUnit(misunderstandingId);

  if (!currentUnit) {
    container.innerHTML = '<p>Unable to load remediation content.</p>';
    return;
  }

  currentProblemIndex = 0;
  currentSubStepIndex = 0;
  stepResults = [];

  renderCurrentStep(container);
}

/**
 * Renders the current step of the remediation unit.
 * @param {HTMLElement} container - Container element
 */
function renderCurrentStep(container) {
  if (!currentUnit) return;

  const step = getCurrentStep(currentUnit);
  if (!step) {
    renderCompletionScreen(container);
    return;
  }

  // Clear container
  container.innerHTML = '';

  // Render progress indicator
  const progress = renderProgressIndicator();
  container.appendChild(progress);

  // Render step based on type
  switch (step.type) {
    case 'illustrate':
      renderIllustrateStep(container, step);
      break;
    case 'explain':
      renderExplainStep(container, step);
      break;
    case 'guided_practice':
      renderGuidedPracticeStep(container, step);
      break;
    case 'independent_practice':
      renderIndependentPracticeStep(container, step);
      break;
    case 'check':
      renderCheckStep(container, step);
      break;
  }
}

/**
 * Renders progress indicator.
 * @returns {HTMLElement} Progress indicator element
 */
function renderProgressIndicator() {
  const totalSteps = currentUnit.steps.length;
  const currentStep = currentUnit.currentStepIndex + 1;
  const percent = (currentStep / totalSteps) * 100;

  const container = document.createElement('div');
  container.className = 'remediation-progress';
  container.innerHTML = `
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${percent}%"></div>
    </div>
    <p class="progress-label">Step ${currentStep} of ${totalSteps}</p>
  `;

  return container;
}

/**
 * Renders illustrate step (visual description).
 * @param {HTMLElement} container - Container element
 * @param {Object} step - Step object
 */
function renderIllustrateStep(container, step) {
  const card = document.createElement('div');
  card.className = 'remediation-card illustrate-step';
  card.innerHTML = `
    <h2>Let's Visualize This 🎨</h2>
    <div class="visual-placeholder">
      <p class="visual-type"><strong>Visual:</strong> ${step.visualType}</p>
      <p class="visual-description">${step.description}</p>
      <div class="visual-note">💡 <em>Interactive visual coming soon!</em></div>
    </div>
    <button class="btn btn-primary" id="next-step-btn">I'm Ready to Learn!</button>
  `;

  container.appendChild(card);

  document.getElementById('next-step-btn').addEventListener('click', () => {
    advanceStep(currentUnit);
    renderCurrentStep(container);
  });
}

/**
 * Renders explain step with highlighted key words.
 * @param {HTMLElement} container - Container element
 * @param {Object} step - Step object
 */
function renderExplainStep(container, step) {
  const card = document.createElement('div');
  card.className = 'remediation-card explain-step';

  // Highlight key phrases
  let highlightedText = step.text
    .replace(/(You might have thought)/g, '<span class="highlight-thought">$1</span>')
    .replace(/(But actually)/g, '<span class="highlight-actually">$1</span>')
    .replace(/(because)/g, '<span class="highlight-because">$1</span>');

  card.innerHTML = `
    <h2>Understanding the Concept 💡</h2>
    <div class="explanation-box">
      <p>${highlightedText}</p>
    </div>
    <button class="btn btn-primary" id="practice-btn">Let's Practice!</button>
  `;

  container.appendChild(card);

  document.getElementById('practice-btn').addEventListener('click', () => {
    advanceStep(currentUnit);
    renderCurrentStep(container);
  });
}

/**
 * Renders guided practice step with sub-steps.
 * @param {HTMLElement} container - Container element
 * @param {Object} step - Step object
 */
function renderGuidedPracticeStep(container, step) {
  if (currentProblemIndex >= step.problems.length) {
    // All guided problems completed
    currentProblemIndex = 0;
    currentUnit.progress.guidedCompleted++;
    advanceStep(currentUnit);
    renderCurrentStep(container);
    return;
  }

  const problem = step.problems[currentProblemIndex];
  const subStep = problem.subSteps[currentSubStepIndex];

  const card = document.createElement('div');
  card.className = 'remediation-card guided-step';
  card.innerHTML = `
    <h2>Guided Practice 🧭</h2>
    <div class="problem-display">
      <p class="problem-label">Problem ${currentProblemIndex + 1} of ${step.problems.length}:</p>
      <p class="problem-text">${problem.problem}</p>
    </div>
    <div class="substep-container">
      <p class="substep-prompt"><strong>Step ${currentSubStepIndex + 1}:</strong> ${subStep.prompt}</p>
      ${subStep.hint ? `<p class="substep-hint">💡 Hint: <em>${subStep.hint}</em></p>` : ''}
      <input type="text" id="substep-answer" class="answer-input" placeholder="Your answer..." autofocus />
      <button class="btn btn-primary" id="check-substep-btn">Check</button>
      <div id="substep-feedback"></div>
    </div>
    <p class="substep-counter">Sub-step ${currentSubStepIndex + 1} of ${problem.subSteps.length}</p>
  `;

  container.appendChild(card);

  const input = document.getElementById('substep-answer');
  const checkBtn = document.getElementById('check-substep-btn');
  const feedback = document.getElementById('substep-feedback');

  const checkAnswer = () => {
    const userAnswer = input.value.trim();
    if (!userAnswer) return;

    const isCorrect = validateAnswer(
      userAnswer,
      subStep.answer,
      subStep.alternates,
      subStep.acceptAny
    );

    if (isCorrect) {
      feedback.innerHTML = '<p class="feedback-correct">✓ Great job!</p>';
      input.disabled = true;
      checkBtn.disabled = true;

      setTimeout(() => {
        currentSubStepIndex++;
        if (currentSubStepIndex >= problem.subSteps.length) {
          // Move to next problem
          currentSubStepIndex = 0;
          currentProblemIndex++;
        }
        renderCurrentStep(container);
      }, 1000);
    } else {
      feedback.innerHTML = `<p class="feedback-incorrect">✗ Not quite. The answer is: <strong>${subStep.answer}</strong></p>`;
      setTimeout(() => {
        feedback.innerHTML = '';
        input.value = '';
        input.focus();
      }, 2000);
    }
  };

  checkBtn.addEventListener('click', checkAnswer);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });
}

/**
 * Renders independent practice step.
 * @param {HTMLElement} container - Container element
 * @param {Object} step - Step object
 */
function renderIndependentPracticeStep(container, step) {
  if (currentProblemIndex >= step.problems.length) {
    // All independent problems completed
    currentProblemIndex = 0;
    stepResults = [];
    currentUnit.progress.independentCompleted++;
    advanceStep(currentUnit);
    renderCurrentStep(container);
    return;
  }

  const problem = step.problems[currentProblemIndex];
  problemStartTime = Date.now();

  const card = document.createElement('div');
  card.className = 'remediation-card independent-step';
  card.innerHTML = `
    <h2>Independent Practice ✏️</h2>
    <p class="practice-instructions">Solve this on your own. You've got this!</p>
    <div class="problem-display">
      <p class="problem-label">Problem ${currentProblemIndex + 1} of ${step.problems.length}:</p>
      <p class="problem-text">${problem.problem}</p>
    </div>
    <div class="answer-container">
      <input type="text" id="answer-input" class="answer-input" placeholder="Your answer..." autofocus />
      <button class="btn btn-primary" id="check-answer-btn">Check Answer</button>
      <div id="answer-feedback"></div>
    </div>
  `;

  container.appendChild(card);

  const input = document.getElementById('answer-input');
  const checkBtn = document.getElementById('check-answer-btn');
  const feedback = document.getElementById('answer-feedback');

  const checkAnswer = () => {
    const userAnswer = input.value.trim();
    if (!userAnswer) return;

    const timeTaken = Date.now() - problemStartTime;

    let isCorrect;
    if (requiresPartitionCheck(problem)) {
      isCorrect = validatePartition(userAnswer, problem.answer.toString());
    } else {
      isCorrect = validateAnswer(userAnswer, problem.answer, problem.alternates, false, problem.acceptRange);
    }

    stepResults.push({ correct: isCorrect, timeTaken });

    if (isCorrect) {
      feedback.innerHTML = '<p class="feedback-correct">✓ Correct!</p>';
    } else {
      feedback.innerHTML = `<p class="feedback-incorrect">✗ The answer is: <strong>${problem.answer}</strong></p>`;
    }

    input.disabled = true;
    checkBtn.disabled = true;

    setTimeout(() => {
      currentProblemIndex++;
      renderCurrentStep(container);
    }, 1500);
  };

  checkBtn.addEventListener('click', checkAnswer);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });
}

/**
 * Renders check step (assessment).
 * @param {HTMLElement} container - Container element
 * @param {Object} step - Step object
 */
function renderCheckStep(container, step) {
  if (currentProblemIndex >= step.problems.length) {
    // Check completed - evaluate results
    evaluateCheck(container, step);
    return;
  }

  const problem = step.problems[currentProblemIndex];
  problemStartTime = Date.now();

  const card = document.createElement('div');
  card.className = 'remediation-card check-step';
  card.innerHTML = `
    <h2>Check Your Understanding ✅</h2>
    <p class="check-instructions">Answer these questions to show you've mastered this concept!</p>
    <div class="problem-display">
      <p class="problem-label">Question ${currentProblemIndex + 1} of ${step.problems.length}:</p>
      <p class="problem-text">${problem.problem}</p>
    </div>
    <div class="answer-container">
      <input type="text" id="check-answer" class="answer-input" placeholder="Your answer..." autofocus />
      <button class="btn btn-primary" id="submit-check-btn">Submit</button>
      <div id="check-feedback"></div>
    </div>
  `;

  container.appendChild(card);

  const input = document.getElementById('check-answer');
  const submitBtn = document.getElementById('submit-check-btn');
  const feedback = document.getElementById('check-feedback');

  const submitAnswer = () => {
    const userAnswer = input.value.trim();
    if (!userAnswer) return;

    const timeTaken = Date.now() - problemStartTime;
    const isCorrect = validateAnswer(userAnswer, problem.answer, problem.alternates, false, problem.acceptRange);

    stepResults.push({ correct: isCorrect, timeTaken });

    if (isCorrect) {
      feedback.innerHTML = '<p class="feedback-correct">✓ Correct!</p>';
    } else {
      feedback.innerHTML = `<p class="feedback-incorrect">✗ The answer is: <strong>${problem.answer}</strong></p>`;
    }

    input.disabled = true;
    submitBtn.disabled = true;

    setTimeout(() => {
      currentProblemIndex++;
      renderCurrentStep(container);
    }, 1200);
  };

  submitBtn.addEventListener('click', submitAnswer);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAnswer();
  });
}

/**
 * Evaluates check results and determines pass/fail.
 * @param {HTMLElement} container - Container element
 * @param {Object} step - Check step object
 */
function evaluateCheck(container, step) {
  const correctCount = stepResults.filter(r => r.correct).length;
  const totalCount = stepResults.length;
  const score = totalCount > 0 ? correctCount / totalCount : 0;
  const passed = score >= step.passingScore;

  currentUnit.progress.checkAttempts++;
  currentUnit.progress.lastCheckScore = score;

  // Record attempt
  recordRemediationAttempt(currentUnit.id, score);

  const card = document.createElement('div');
  card.className = 'remediation-card results-step';

  if (passed) {
    card.innerHTML = `
      <div class="success-animation">🎉</div>
      <h2>Well Done! You've Got It!</h2>
      <div class="results-summary">
        <p class="score-big">${correctCount} / ${totalCount}</p>
        <p class="score-label">Correct Answers</p>
      </div>
      <p class="success-message">You've successfully mastered this concept! The issue has been marked as resolved.</p>
      <button class="btn btn-primary" id="finish-btn">Return to Diagnostics</button>
    `;

    // Auto-resolve if passed
    if (passed && currentUnit.progress.checkAttempts >= 1) {
      resolveMisunderstanding(currentUnit.id);
    }
  } else {
    card.innerHTML = `
      <h2>Let's Try Again</h2>
      <div class="results-summary">
        <p class="score-big">${correctCount} / ${totalCount}</p>
        <p class="score-label">Correct Answers</p>
      </div>
      <p class="retry-message">You need ${Math.ceil(step.passingScore * totalCount)} correct to pass. Don't worry — let's practice again with different examples!</p>
      <div class="retry-actions">
        <button class="btn btn-primary" id="retry-btn">Practice Again</button>
        <button class="btn btn-secondary" id="back-btn">Back to Diagnostics</button>
      </div>
    `;
  }

  container.appendChild(card);

  const finishBtn = document.getElementById('finish-btn');
  const retryBtn = document.getElementById('retry-btn');
  const backBtn = document.getElementById('back-btn');

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      window.expansionApp.renderScreen('diagnostics');
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      // Reset and start over
      currentProblemIndex = 0;
      currentSubStepIndex = 0;
      stepResults = [];
      resetUnit(currentUnit);
      renderCurrentStep(container);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.expansionApp.renderScreen('diagnostics');
    });
  }
}

/**
 * Renders completion screen (all steps done).
 * @param {HTMLElement} container - Container element
 */
function renderCompletionScreen(container) {
  container.innerHTML = `
    <div class="remediation-card completion-step">
      <h2>All Steps Complete!</h2>
      <p>Great work completing the remediation unit.</p>
      <button class="btn btn-primary" onclick="window.expansionApp.renderScreen('diagnostics')">Back to Diagnostics</button>
    </div>
  `;
}
