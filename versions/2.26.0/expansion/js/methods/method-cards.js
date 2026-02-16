function getComfortIndicator(comfortLevel) {
  const levels = {
    novice: { label: 'New', color: '#e0e0e0', stars: 1 },
    practising: { label: 'Learning', color: '#ffd54f', stars: 2 },
    confident: { label: 'Confident', color: '#66bb6a', stars: 3 },
    expert: { label: 'Expert', color: '#42a5f5', stars: 4 }
  };
  return levels[comfortLevel] || levels.novice;
}

export function renderMethodCards(applicableMethods, onSelect, userMethodMastery = {}) {
  const container = document.createElement('div');
  container.className = 'method-cards-container';

  const title = document.createElement('h3');
  title.className = 'cards-title';
  title.textContent = 'Choose a Method';
  container.appendChild(title);

  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'method-cards-scroll';

  for (const method of applicableMethods) {
    const mastery = userMethodMastery[method.id] || { comfortLevel: 'novice' };
    const comfort = getComfortIndicator(mastery.comfortLevel);

    const card = document.createElement('div');
    card.className = 'method-card';
    card.dataset.methodId = method.id;

    if (method.suitability >= 85) {
      card.classList.add('highly-recommended');
    } else if (method.suitability >= 70) {
      card.classList.add('recommended');
    }

    card.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${method.icon}</div>
        ${method.suitability >= 85 ? '<div class="recommended-badge">⭐ Best</div>' : ''}
        ${method.suitability >= 70 && method.suitability < 85 ? '<div class="recommended-badge">Good</div>' : ''}
      </div>
      <div class="card-body">
        <h4 class="card-title">${method.name}</h4>
        <p class="card-description">${method.description}</p>
        <div class="card-footer">
          <span class="card-type">${method.type === 'mental' ? '🧠 Mental' : '✏️ Written'}</span>
          <span class="comfort-indicator" style="background-color: ${comfort.color}">
            ${comfort.label}
          </span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      scrollContainer.querySelectorAll('.method-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (onSelect) {
        onSelect(method.id, method);
      }
    });

    scrollContainer.appendChild(card);
  }

  container.appendChild(scrollContainer);
  return container;
}
