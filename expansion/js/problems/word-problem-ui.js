// Word Problem UI Rendering
// Displays word problems with layered scaffolding support

import { PartWholeVisual } from '../visuals/part-whole-model.js';

function renderWordProblemKeypad() {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '⌫', '0', 'C'];
  return `
    <div class="touch-keypad word-keypad" id="word-keypad">
      ${keys.map((key) => `<button type="button" class="keypad-key" data-key="${key}">${key}</button>`).join('')}
    </div>
  `;
}

function bindWordProblemKeypad(input, keypad) {
  if (!input || !keypad) return;
  keypad.addEventListener('click', (e) => {
    const key = e.target?.dataset?.key;
    if (!key || input.disabled) return;
    if (key === '⌫') input.value = input.value.slice(0, -1);
    else if (key === 'C') input.value = '';
    else input.value += key;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

export function renderWordProblem(problem, options = {}) {
  const {
    onAnswer,
    onScaffoldingUsed,
    showScaffoldingButtons = true,
    currentScaffoldingLevel = 0
  } = options;

  const container = document.createElement('div');
  container.className = 'word-problem-container';

  // Problem text display
  const textSection = document.createElement('div');
  textSection.className = 'word-problem-text';
  textSection.innerHTML = `<p class="problem-text">${problem.text}</p>`;
  container.appendChild(textSection);

  // Answer input section
  const answerSection = document.createElement('div');
  answerSection.className = 'word-problem-answer-section';
  answerSection.innerHTML = `
    <div class="answer-input-group">
      <label class="answer-label">Your Answer:</label>
      <input type="number" class="answer-input" placeholder="Type your answer" />
      <button class="btn btn-primary">Check Answer</button>
    </div>
    ${renderWordProblemKeypad()}
    <div class="answer-feedback"></div>
  `;
  container.appendChild(answerSection);

  // Scaffolding section (initially hidden)
  const scaffoldingSection = document.createElement('div');
  scaffoldingSection.className = 'scaffolding-section';
  scaffoldingSection.style.display = 'none';
  container.appendChild(scaffoldingSection);

  // Scaffolding buttons (moved below answer to reduce scroll-to-answer)
  if (showScaffoldingButtons) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'scaffolding-buttons';
    buttonsContainer.innerHTML = `
      <p class="scaffolding-help-text">Need help understanding this problem?</p>
      <div class="button-group">
        <button class="btn btn-secondary btn-small" data-level="1">
          <span class="scaffold-icon">🔍</span> Highlight Key Info
        </button>
        <button class="btn btn-secondary btn-small" data-level="2">
          <span class="scaffold-icon">📊</span> Show Bar Model
        </button>
        <button class="btn btn-secondary btn-small" data-level="3">
          <span class="scaffold-icon">✏️</span> Write Number Sentence
        </button>
      </div>
    `;
    container.appendChild(buttonsContainer);

    buttonsContainer.querySelectorAll('button[data-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.level);
        showScaffolding(scaffoldingSection, problem, level);
        scaffoldingSection.style.display = 'block';
        if (onScaffoldingUsed) onScaffoldingUsed(level);
        buttonsContainer.querySelectorAll('button[data-level]').forEach(b => {
          if (parseInt(b.dataset.level) <= level) {
            b.disabled = true;
            b.classList.add('used');
          }
        });
      });
    });
  }

  // Handle answer submission
  const input = answerSection.querySelector('.answer-input');
  const button = answerSection.querySelector('.btn');
  const feedback = answerSection.querySelector('.answer-feedback');
  bindWordProblemKeypad(input, answerSection.querySelector('#word-keypad'));

  const handleSubmit = () => {
    const userAnswer = parseInt(input.value);
    if (isNaN(userAnswer)) {
      feedback.innerHTML = '<div class="feedback-warning">Please enter a number</div>';
      return;
    }

    const correct = userAnswer === problem.answer;

    if (correct) {
      feedback.innerHTML = `
        <div class="feedback-correct">
          <span class="feedback-icon">✓</span>
          <span class="feedback-text">Correct! The answer is ${problem.answer.toLocaleString()}</span>
        </div>
      `;
      input.disabled = true;
      button.disabled = true;
    } else {
      feedback.innerHTML = `
        <div class="feedback-incorrect">
          <span class="feedback-icon">✗</span>
          <span class="feedback-text">Not quite. The answer is ${problem.answer.toLocaleString()}</span>
          <p class="feedback-hint">Number sentence: ${problem.numberSentence}</p>
        </div>
      `;
    }

    if (onAnswer) {
      onAnswer(correct, userAnswer);
    }
  };

  button.addEventListener('click', handleSubmit);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });

  // Auto-focus input after a brief delay
  setTimeout(() => input.focus(), 100);

  return container;
}

function showScaffolding(container, problem, level) {
  container.innerHTML = '';

  if (level === 1) {
    // Level 1: Highlight key information
    const highlightSection = document.createElement('div');
    highlightSection.className = 'scaffolding-level-1';
    highlightSection.innerHTML = `
      <h3>Key Information Highlighted</h3>
      <div class="highlight-legend">
        <span class="legend-item"><span class="highlight-number">Blue</span> = Numbers</span>
        <span class="legend-item"><span class="highlight-keyword">Green</span> = Action words</span>
        <span class="legend-item"><span class="highlight-question">Yellow</span> = Question</span>
      </div>
      <div class="highlighted-problem">
        ${problem.scaffolding.highlightedText}
      </div>
    `;
    container.appendChild(highlightSection);
  } else if (level === 2) {
    // Level 2: Show bar model
    const barModelSection = document.createElement('div');
    barModelSection.className = 'scaffolding-level-2';
    barModelSection.innerHTML = '<h3>Bar Model Diagram</h3>';

    const barModelContainer = document.createElement('div');
    barModelContainer.className = 'bar-model-visual';
    barModelSection.appendChild(barModelContainer);

    // Render bar model based on type
    const barModel = problem.scaffolding.barModel;
    if (barModel.type === 'part-whole') {
      renderPartWholeBarModel(barModelContainer, barModel);
    } else if (barModel.type === 'comparison') {
      renderComparisonBarModel(barModelContainer, barModel);
    } else if (barModel.type === 'multi-step') {
      renderMultiStepBarModel(barModelContainer, barModel);
    }

    container.appendChild(barModelSection);
  } else if (level === 3) {
    // Level 3: Write number sentence
    const numberSentenceSection = document.createElement('div');
    numberSentenceSection.className = 'scaffolding-level-3';
    numberSentenceSection.innerHTML = `
      <h3>Write the Number Sentence</h3>
      <p class="number-sentence-prompt">${problem.scaffolding.numberSentencePrompt}</p>
      <div class="number-sentence-reveal">
        <p class="number-sentence-label">The number sentence is:</p>
        <p class="number-sentence-display">${problem.numberSentence}</p>
      </div>
    `;
    container.appendChild(numberSentenceSection);
  }
}

function renderPartWholeBarModel(container, barModel) {
  const { parts, whole, unknown } = barModel;

  const visual = document.createElement('div');
  visual.className = 'bar-model-part-whole';

  const maxValue = Math.max(whole, ...parts);
  const scale = 400 / maxValue; // Scale to fit in 400px width

  visual.innerHTML = `
    <div class="bar-model-whole">
      <div class="bar-section bar-whole" style="width: ${whole * scale}px;">
        <span class="bar-label">${unknown === 'whole' ? '?' : whole.toLocaleString()}</span>
      </div>
      <span class="bar-annotation">Whole</span>
    </div>
    <div class="bar-model-parts">
      <div class="bar-section bar-part1" style="width: ${parts[0] * scale}px;">
        <span class="bar-label">${unknown === 'part1' ? '?' : parts[0].toLocaleString()}</span>
      </div>
      <div class="bar-section bar-part2" style="width: ${parts[1] * scale}px;">
        <span class="bar-label">${unknown === 'part2' ? '?' : parts[1].toLocaleString()}</span>
      </div>
    </div>
  `;

  container.appendChild(visual);
}

function renderComparisonBarModel(container, barModel) {
  const { larger, smaller, difference, unknown } = barModel;

  const visual = document.createElement('div');
  visual.className = 'bar-model-comparison';

  const scale = 400 / larger;

  visual.innerHTML = `
    <div class="comparison-bar">
      <div class="bar-section bar-larger" style="width: ${larger * scale}px;">
        <span class="bar-label">${larger.toLocaleString()}</span>
      </div>
      <span class="bar-annotation">Larger amount</span>
    </div>
    <div class="comparison-bar">
      <div class="bar-section bar-smaller" style="width: ${smaller * scale}px;">
        <span class="bar-label">${unknown === 'smaller' ? '?' : smaller.toLocaleString()}</span>
      </div>
      <div class="bar-section bar-difference" style="width: ${difference * scale}px; background: #ffeb3b; opacity: 0.5;">
        <span class="bar-label">${unknown === 'difference' ? '?' : difference.toLocaleString()}</span>
      </div>
      <span class="bar-annotation">Smaller amount + difference</span>
    </div>
  `;

  container.appendChild(visual);
}

function renderMultiStepBarModel(container, barModel) {
  const visual = document.createElement('div');
  visual.className = 'bar-model-multi-step';

  barModel.steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'multi-step-bar';

    const [n1, n2] = step.parts;
    const maxValue = Math.max(n1, n2, step.result);
    const scale = 350 / maxValue;

    stepDiv.innerHTML = `
      <p class="step-label">Step ${index + 1}: ${step.operation === 'addition' ? 'Add' : 'Subtract'}</p>
      <div class="bar-visual">
        <div class="bar-section" style="width: ${n1 * scale}px; background: #42a5f5;">
          <span class="bar-label">${n1.toLocaleString()}</span>
        </div>
        <span class="operation-symbol">${step.operation === 'addition' ? '+' : '−'}</span>
        <div class="bar-section" style="width: ${n2 * scale}px; background: ${step.operation === 'addition' ? '#66bb6a' : '#ef5350'};">
          <span class="bar-label">${n2.toLocaleString()}</span>
        </div>
        <span class="equals-symbol">=</span>
        <div class="bar-section" style="width: ${step.result * scale}px; background: #ffa726;">
          <span class="bar-label">${step.result.toLocaleString()}</span>
        </div>
      </div>
    `;

    visual.appendChild(stepDiv);
  });

  container.appendChild(visual);
}

export function renderWordProblemResults(results, totalProblems) {
  const container = document.createElement('div');
  container.className = 'word-problem-results';

  const correctCount = results.filter(r => r.correct).length;
  const accuracy = (correctCount / totalProblems) * 100;

  // Calculate scaffolding usage
  const scaffoldingUsage = {
    none: results.filter(r => r.scaffoldingLevel === 0).length,
    highlight: results.filter(r => r.scaffoldingLevel === 1).length,
    barModel: results.filter(r => r.scaffoldingLevel === 2).length,
    numberSentence: results.filter(r => r.scaffoldingLevel === 3).length
  };

  container.innerHTML = `
    <div class="results-card">
      <h2>Word Problem Practice Complete! 📖</h2>
      <div class="results-summary">
        <div class="result-stat-large">
          <div class="stat-value-large">${Math.round(accuracy)}%</div>
          <div class="stat-label-large">Accuracy</div>
        </div>
        <div class="results-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-icon">✓</span>
            <span class="breakdown-text">${correctCount} Correct</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-icon">✗</span>
            <span class="breakdown-text">${totalProblems - correctCount} Incorrect</span>
          </div>
        </div>
      </div>

      <div class="scaffolding-stats">
        <h3>Help Used</h3>
        <div class="scaffold-breakdown">
          <div class="scaffold-stat">
            <div class="scaffold-count">${scaffoldingUsage.none}</div>
            <div class="scaffold-label">No help needed</div>
          </div>
          <div class="scaffold-stat">
            <div class="scaffold-count">${scaffoldingUsage.highlight}</div>
            <div class="scaffold-label">Highlighted</div>
          </div>
          <div class="scaffold-stat">
            <div class="scaffold-count">${scaffoldingUsage.barModel}</div>
            <div class="scaffold-label">Bar model</div>
          </div>
          <div class="scaffold-stat">
            <div class="scaffold-count">${scaffoldingUsage.numberSentence}</div>
            <div class="scaffold-label">Number sentence</div>
          </div>
        </div>
        ${scaffoldingUsage.none === totalProblems ? `
          <div class="achievement-banner">
            <span class="achievement-icon">🌟</span>
            <span class="achievement-text">Independent Solver! You solved all problems without help.</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  return container;
}
