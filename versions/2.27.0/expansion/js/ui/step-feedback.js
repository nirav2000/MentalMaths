export function showCorrect(element) {
  element.innerHTML = '';
  element.className = 'step-feedback-area feedback-correct';

  const icon = document.createElement('div');
  icon.className = 'feedback-icon';
  icon.innerHTML = '✓';
  element.appendChild(icon);

  const message = document.createElement('div');
  message.className = 'feedback-message';
  message.textContent = 'Correct!';
  element.appendChild(message);

  element.classList.add('feedback-animate');
  setTimeout(() => {
    element.classList.remove('feedback-animate');
  }, 500);
}

export function showIncorrect(element, correctAnswer) {
  element.innerHTML = '';
  element.className = 'step-feedback-area feedback-incorrect';

  const icon = document.createElement('div');
  icon.className = 'feedback-icon';
  icon.innerHTML = '✗';
  element.appendChild(icon);

  const message = document.createElement('div');
  message.className = 'feedback-message';
  message.innerHTML = `Not quite. The answer is <strong>${correctAnswer}</strong>`;
  element.appendChild(message);

  element.classList.add('feedback-animate');
  setTimeout(() => {
    element.classList.remove('feedback-animate');
  }, 500);
}

export function showHint(element, hintText) {
  const hint = document.createElement('div');
  hint.className = 'feedback-hint';
  hint.innerHTML = `💡 ${hintText}`;
  element.appendChild(hint);

  hint.classList.add('hint-animate');
  setTimeout(() => {
    hint.classList.remove('hint-animate');
  }, 500);
}

export function clearFeedback(element) {
  element.innerHTML = '';
  element.className = 'step-feedback-area';
}
