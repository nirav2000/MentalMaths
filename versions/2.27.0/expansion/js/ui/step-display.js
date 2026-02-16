import { showCorrect, showIncorrect, showHint } from './step-feedback.js';

export function renderSteps(stepsArray, mode = 'view', options = {}) {
  const { onStepComplete, onAllComplete, autoAdvance = false, methodColor = '#42a5f5' } = options;
  if (mode === 'view') return renderViewMode(stepsArray, methodColor);
  if (mode === 'interactive') return renderInteractiveMode(stepsArray, methodColor, onStepComplete, onAllComplete);
  if (mode === 'animated') return renderAnimatedMode(stepsArray, methodColor, autoAdvance, onAllComplete);
  return document.createElement('div');
}

function renderViewMode(stepsArray, methodColor) {
  const container = document.createElement('div');
  container.className = 'step-display-container view-mode';
  stepsArray.forEach((step, i) => container.appendChild(createStepElement(step, i, methodColor)));
  return container;
}

function renderInteractiveMode(stepsArray, methodColor, onStepComplete, onAllComplete) {
  const container = document.createElement('div');
  container.className = 'step-display-container interactive-mode';
  let currentIdx = 0;
  let accuracy = [];

  function renderCurrent() {
    if (currentIdx >= stepsArray.length) {
      if (onAllComplete) onAllComplete({ accuracy: accuracy.filter(Boolean).length / accuracy.length, stepAccuracy: accuracy });
      return;
    }

    container.innerHTML = '';
    const step = stepsArray[currentIdx];
    const stepEl = createStepElement(step, currentIdx, methodColor);
    stepEl.classList.add('current-step');

    if (step.input !== undefined) {
      const wrapper = document.createElement('div');
      wrapper.className = 'step-input-container';
      wrapper.innerHTML = '<input type="number" class="step-input" placeholder="?" autofocus /><button class="btn btn-primary">Check</button><div class="step-feedback-area"></div>';
      stepEl.appendChild(wrapper);

      const input = wrapper.querySelector('.step-input');
      const btn = wrapper.querySelector('button');
      const feedback = wrapper.querySelector('.step-feedback-area');

      const handleSubmit = () => {
        const correct = parseInt(input.value) === step.input;
        accuracy.push(correct);
        if (correct) {
          showCorrect(feedback);
          input.disabled = btn.disabled = true;
          if (onStepComplete) onStepComplete(currentIdx, true);
          setTimeout(() => { currentIdx++; renderCurrent(); }, 1500);
        } else {
          showIncorrect(feedback, step.input);
          if (step.note) setTimeout(() => showHint(feedback, step.note), 1000);
          if (onStepComplete) onStepComplete(currentIdx, false);
          setTimeout(() => { currentIdx++; renderCurrent(); }, 3000);
        }
      };

      btn.addEventListener('click', handleSubmit);
      input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSubmit(); });
      setTimeout(() => input.focus(), 100);
    } else {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.textContent = 'Next →';
      btn.addEventListener('click', () => { currentIdx++; renderCurrent(); });
      stepEl.appendChild(btn);
    }

    container.appendChild(stepEl);
  }

  renderCurrent();
  return container;
}

function renderAnimatedMode(stepsArray, methodColor, autoAdvance, onAllComplete) {
  const container = document.createElement('div');
  container.className = 'step-display-container animated-mode';
  let currentIdx = 0;

  function showNext() {
    if (currentIdx >= stepsArray.length) {
      if (onAllComplete) onAllComplete();
      return;
    }

    const stepEl = createStepElement(stepsArray[currentIdx], currentIdx, methodColor);
    stepEl.classList.add('step-animated');
    container.appendChild(stepEl);
    setTimeout(() => stepEl.classList.add('step-visible'), 50);

    currentIdx++;

    if (autoAdvance && currentIdx < stepsArray.length) {
      setTimeout(showNext, 2000);
    } else if (!autoAdvance && currentIdx < stepsArray.length) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary step-next-btn';
      btn.textContent = 'Next →';
      btn.addEventListener('click', showNext);
      container.appendChild(btn);
    }
  }

  showNext();
  return container;
}

function createStepElement(step, index, color) {
  const el = document.createElement('div');
  el.className = 'step-item';
  el.style.borderLeftColor = color;

  const num = document.createElement('div');
  num.className = 'step-number';
  num.style.backgroundColor = color;
  num.textContent = index + 1;
  el.appendChild(num);

  const content = document.createElement('div');
  content.className = 'step-content';
  content.innerHTML = `<div class="step-description">${step.description}</div><div class="step-detail">${step.detail}</div>`;

  if (step.note) content.innerHTML += `<div class="step-note">💡 ${step.note}</div>`;
  if (step.carry !== undefined) content.innerHTML += `<div class="step-carry-indicator">Carry: ${step.carry}</div>`;
  if (step.borrow) content.innerHTML += '<div class="step-borrow-indicator">↓ Borrow needed</div>';
  if (step.written !== undefined) content.innerHTML += `<div class="step-written-indicator">Write: ${step.written}</div>`;

  el.appendChild(content);
  return el;
}
