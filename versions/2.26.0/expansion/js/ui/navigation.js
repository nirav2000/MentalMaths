// Navigation System for Expansion Module
// Handles screen routing, history, breadcrumbs, and bottom nav

let navigationHistory = [];
let currentScreen = 'home';

// Screen metadata for breadcrumbs and navigation
const screenMetadata = {
  'home': { title: 'Home', parent: null, icon: '🏠', navTab: null },
  'addition-facts': { title: 'Addition Facts', parent: 'home', icon: '➕', navTab: 'facts' },
  'subtraction-facts': { title: 'Subtraction Facts', parent: 'home', icon: '➖', navTab: 'facts' },
  'fact-grid': { title: 'Fact Mastery Grid', parent: 'home', icon: '📊', navTab: 'facts' },
  'diagnostics': { title: 'Diagnostics', parent: 'home', icon: '🔍', navTab: 'diagnostics' },
  'remediation': { title: 'Remediation', parent: 'diagnostics', icon: '🎯', navTab: 'diagnostics' },
  'levels': { title: 'Practice Levels', parent: 'home', icon: '📈', navTab: 'practice' },
  'methods': { title: 'Mental Math Methods', parent: 'home', icon: '🧠', navTab: 'practice' },
  'word-problems': { title: 'Word Problems', parent: 'home', icon: '📖', navTab: 'practice' },
  'progress': { title: 'Progress Dashboard', parent: 'home', icon: '📊', navTab: 'progress' },
  'visual-demo': { title: 'Visual Demo', parent: 'home', icon: '🎨', navTab: null }
};

// Bottom nav tabs
const bottomNavTabs = [
  { id: 'facts', label: 'Facts', icon: '📚', screen: 'addition-facts' },
  { id: 'practice', label: 'Practice', icon: '📈', screen: 'levels' },
  { id: 'diagnostics', label: 'Support', icon: '🔍', screen: 'diagnostics' },
  { id: 'progress', label: 'Progress', icon: '📊', screen: 'progress' }
];

export function initNavigation(renderScreenCallback) {
  currentScreen = 'home';
  navigationHistory = ['home'];

  // Set up bottom nav
  setupBottomNav(renderScreenCallback);

  // Set up breadcrumbs (will update on each navigation)
  updateBreadcrumbs();

  // Set up back button
  setupBackButton(renderScreenCallback);
}

export function navigateTo(screen, params = {}, renderScreenCallback) {
  // Add current screen to history if different
  if (screen !== currentScreen) {
    navigationHistory.push(screen);
  }

  currentScreen = screen;

  // Update UI elements
  updateBreadcrumbs();
  updateBottomNavActive();

  // Trigger screen transition
  if (renderScreenCallback) {
    const root = document.getElementById('expansion-root');
    if (root) {
      // Add fade-out class
      root.classList.add('screen-transition-out');

      setTimeout(() => {
        // Render new screen
        renderScreenCallback(screen, params);

        // Add fade-in class
        root.classList.remove('screen-transition-out');
        root.classList.add('screen-transition-in');

        setTimeout(() => {
          root.classList.remove('screen-transition-in');
        }, 300);
      }, 150);
    } else {
      renderScreenCallback(screen, params);
    }
  }
}

export function goBack(renderScreenCallback) {
  if (navigationHistory.length > 1) {
    // Remove current screen
    navigationHistory.pop();

    // Get previous screen
    const previousScreen = navigationHistory[navigationHistory.length - 1];
    currentScreen = previousScreen;

    // Update UI
    updateBreadcrumbs();
    updateBottomNavActive();

    // Render previous screen
    if (renderScreenCallback) {
      const root = document.getElementById('expansion-root');
      if (root) {
        root.classList.add('screen-transition-out');

        setTimeout(() => {
          renderScreenCallback(previousScreen);
          root.classList.remove('screen-transition-out');
          root.classList.add('screen-transition-in');

          setTimeout(() => {
            root.classList.remove('screen-transition-in');
          }, 300);
        }, 150);
      } else {
        renderScreenCallback(previousScreen);
      }
    }
  } else {
    // At root, can't go back further
    console.log('Already at root screen');
  }
}

export function getCurrentScreen() {
  return currentScreen;
}

export function getNavigationHistory() {
  return [...navigationHistory];
}

function setupBottomNav(renderScreenCallback) {
  const bottomNav = document.getElementById('bottom-nav');
  if (!bottomNav) return;

  bottomNav.innerHTML = `
    <div class="bottom-nav-container">
      ${bottomNavTabs.map(tab => `
        <button class="bottom-nav-tab" data-tab="${tab.id}" data-screen="${tab.screen}">
          <span class="tab-icon">${tab.icon}</span>
          <span class="tab-label">${tab.label}</span>
        </button>
      `).join('')}
    </div>
  `;

  // Add click handlers
  bottomNav.querySelectorAll('.bottom-nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const screen = tab.dataset.screen;
      navigateTo(screen, {}, renderScreenCallback);
    });
  });
}

function updateBottomNavActive() {
  const bottomNav = document.getElementById('bottom-nav');
  if (!bottomNav) return;

  // Remove active class from all tabs
  bottomNav.querySelectorAll('.bottom-nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Find which tab should be active based on current screen
  const metadata = screenMetadata[currentScreen];
  if (metadata && metadata.navTab) {
    const activeTab = bottomNav.querySelector(`[data-tab="${metadata.navTab}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
  }
}

function updateBreadcrumbs() {
  const breadcrumbContainer = document.getElementById('breadcrumb-trail');
  if (!breadcrumbContainer) return;

  const breadcrumbs = buildBreadcrumbPath(currentScreen);

  breadcrumbContainer.innerHTML = breadcrumbs.map((crumb, index) => {
    const isLast = index === breadcrumbs.length - 1;
    return `
      <span class="breadcrumb-item ${isLast ? 'active' : ''}" data-screen="${crumb.screen}">
        <span class="breadcrumb-icon">${crumb.icon}</span>
        <span class="breadcrumb-text">${crumb.title}</span>
      </span>
      ${!isLast ? '<span class="breadcrumb-separator">›</span>' : ''}
    `;
  }).join('');

  // Add click handlers to non-active breadcrumbs
  breadcrumbContainer.querySelectorAll('.breadcrumb-item:not(.active)').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      // Navigate directly to that screen
      navigateTo(screen, {}, window.expansionApp.renderScreen);
    });
  });
}

function buildBreadcrumbPath(screen) {
  const path = [];
  let current = screen;

  // Build path from current to root
  while (current) {
    const metadata = screenMetadata[current];
    if (metadata) {
      path.unshift({
        screen: current,
        title: metadata.title,
        icon: metadata.icon
      });
      current = metadata.parent;
    } else {
      break;
    }
  }

  return path;
}

function setupBackButton(renderScreenCallback) {
  const backButton = document.querySelector('.back-link');
  if (backButton) {
    // If we're deep in navigation, make it go back
    // Otherwise, it should go to main app (keep existing behavior)
    backButton.addEventListener('click', (e) => {
      if (navigationHistory.length > 1) {
        e.preventDefault();
        goBack(renderScreenCallback);
      }
      // If at root, let default behavior (href) work
    });
  }
}

// Export for use in other modules
export function updateNavigation(screen) {
  currentScreen = screen;
  updateBreadcrumbs();
  updateBottomNavActive();
}
