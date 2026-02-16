// Feedback Animations
// Subtle, fast animations for user feedback (200-400ms, non-blocking)

import { COLOURS } from '../expansion-config.js';

export function correctAnimation(element) {
  if (!element) return;

  // Add tick icon
  const tick = document.createElement('span');
  tick.className = 'feedback-icon feedback-tick';
  tick.textContent = '✓';
  tick.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 3rem;
    color: ${COLOURS.correct};
    pointer-events: none;
    z-index: 1000;
  `;
  element.style.position = element.style.position || 'relative';
  element.appendChild(tick);

  // Animate
  element.style.animation = 'correctPulse 300ms ease';
  tick.style.animation = 'tickAppear 400ms ease forwards';

  setTimeout(() => {
    element.style.animation = '';
    tick.remove();
  }, 400);
}

export function incorrectAnimation(element) {
  if (!element) return;

  // Add X icon
  const cross = document.createElement('span');
  cross.className = 'feedback-icon feedback-cross';
  cross.textContent = '✗';
  cross.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 3rem;
    color: ${COLOURS.incorrect};
    pointer-events: none;
    z-index: 1000;
  `;
  element.style.position = element.style.position || 'relative';
  element.appendChild(cross);

  // Animate
  element.style.animation = 'incorrectShake 300ms ease';
  cross.style.animation = 'crossAppear 400ms ease forwards';

  setTimeout(() => {
    element.style.animation = '';
    cross.remove();
  }, 400);
}

export function unlockAnimation(element) {
  if (!element) return;

  // Add burst effect
  const burst = document.createElement('div');
  burst.className = 'unlock-burst';
  burst.innerHTML = '🎉✨🌟✨🎉';
  burst.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    pointer-events: none;
    z-index: 1000;
  `;
  element.style.position = element.style.position || 'relative';
  element.appendChild(burst);

  // Animate
  element.style.animation = 'unlockPulse 400ms ease';
  burst.style.animation = 'burstSpread 400ms ease forwards';

  setTimeout(() => {
    element.style.animation = '';
    burst.remove();
  }, 400);
}

export function levelUpAnimation() {
  // Full-screen celebration
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML = `
    <div class="level-up-content">
      <div class="level-up-icon">🎉</div>
      <div class="level-up-text">Level Up!</div>
    </div>
  `;
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(102, 187, 106, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: levelUpFade 400ms ease forwards;
  `;
  document.body.appendChild(overlay);

  const content = overlay.querySelector('.level-up-content');
  content.style.animation = 'levelUpZoom 400ms ease';

  setTimeout(() => {
    overlay.style.animation = 'levelUpFadeOut 300ms ease forwards';
    setTimeout(() => overlay.remove(), 300);
  }, 1500);
}

export function hintRevealAnimation(element) {
  if (!element) return;

  element.style.maxHeight = '0';
  element.style.opacity = '0';
  element.style.overflow = 'hidden';
  element.style.transition = 'max-height 300ms ease, opacity 300ms ease';

  // Trigger reflow
  element.offsetHeight;

  element.style.maxHeight = element.scrollHeight + 'px';
  element.style.opacity = '1';

  // Remove max-height after animation
  setTimeout(() => {
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
  }, 300);
}

// Add CSS animations to document
const style = document.createElement('style');
style.textContent = `
  @keyframes correctPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); background-color: ${COLOURS.correct}22; }
  }

  @keyframes incorrectShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }

  @keyframes tickAppear {
    0% { transform: translate(-50%, -50%) scale(0) rotate(-45deg); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0; }
  }

  @keyframes crossAppear {
    0% { transform: translate(-50%, -50%) scale(0) rotate(-45deg); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0; }
  }

  @keyframes unlockPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes burstSpread {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
  }

  @keyframes levelUpFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes levelUpFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes levelUpZoom {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }

  .level-up-content {
    text-align: center;
    color: white;
  }

  .level-up-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
  }

  .level-up-text {
    font-size: 3rem;
    font-weight: 700;
  }
`;
document.head.appendChild(style);
