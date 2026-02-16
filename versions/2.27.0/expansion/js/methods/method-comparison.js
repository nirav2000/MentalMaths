export function renderComparison(a, op, b, methods, onPreferenceSelect) {
  const container = document.createElement('div');
  container.className = 'method-comparison-container';

  const header = document.createElement('div');
  header.className = 'comparison-header';
  header.innerHTML = `
    <h3>Compare Different Methods</h3>
    <p class="problem-display">${a} ${op} ${b} = ?</p>
  `;
  container.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'comparison-grid';
  grid.style.gridTemplateColumns = `repeat(${Math.min(methods.length, 3)}, 1fr)`;

  let minSteps = Infinity;
  const solutions = [];

  for (const method of methods.slice(0, 3)) {
    const solution = method.module.solve(a, op, b);
    solutions.push({ method, solution });
    minSteps = Math.min(minSteps, solution.steps.length);
  }

  for (const { method, solution } of solutions) {
    const column = document.createElement('div');
    column.className = 'comparison-column';

    const methodHeader = document.createElement('div');
    methodHeader.className = 'method-header';
    const isFastest = solution.steps.length === minSteps;
    methodHeader.innerHTML = `
      <div class="method-icon">${method.icon}</div>
      <div class="method-name">${method.name}</div>
      <div class="step-count ${isFastest ? 'fastest' : ''}">
        ${solution.steps.length} step${solution.steps.length !== 1 ? 's' : ''}
        ${isFastest ? '⚡' : ''}
      </div>
    `;
    column.appendChild(methodHeader);

    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';

    for (const [idx, step] of solution.steps.entries()) {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'step-item';
      stepDiv.innerHTML = `
        <div class="step-number">${idx + 1}</div>
        <div class="step-content">
          <div class="step-description">${step.description}</div>
          <div class="step-detail">${step.detail}</div>
          ${step.note ? `<div class="step-note">${step.note}</div>` : ''}
        </div>
      `;
      stepsContainer.appendChild(stepDiv);
    }

    column.appendChild(stepsContainer);

    const answerDiv = document.createElement('div');
    answerDiv.className = 'method-answer';
    answerDiv.innerHTML = `Answer: <strong>${solution.answer}</strong>`;
    column.appendChild(answerDiv);

    grid.appendChild(column);
  }

  container.appendChild(grid);

  const footer = document.createElement('div');
  footer.className = 'comparison-footer';

  const prompt = document.createElement('p');
  prompt.textContent = 'Which method did you prefer?';
  footer.appendChild(prompt);

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'preference-buttons';

  for (const { method } of solutions) {
    const button = document.createElement('button');
    button.className = 'preference-button';
    button.innerHTML = `${method.icon} ${method.name}`;
    button.addEventListener('click', () => {
      buttonContainer.querySelectorAll('.preference-button').forEach(b =>
        b.classList.remove('selected'));
      button.classList.add('selected');
      if (onPreferenceSelect) {
        onPreferenceSelect(method.id);
      }
    });
    buttonContainer.appendChild(button);
  }

  footer.appendChild(buttonContainer);
  container.appendChild(footer);

  return container;
}
