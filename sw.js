/* sw.js - Service worker for offline PWA support */

const CACHE_NAME = 'mental-maths-v1.20.0-firebase-auth-sync';

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './css/charts.css',
    './css/dashboard.css',
    './css/intervention.css',
    './css/features.css',
    './js/config.js',
    './js/firebase-sync.js',
    './js/storage.js',
    './js/generators.js',
    './js/times-tables.js',
    './js/visuals.js',
    './js/versions.js',
    './js/charts.js',
    './js/settings.js',
    './js/spaced-repetition.js',
    './js/encouragement.js',
    './js/export-utils.js',
    './js/goals.js',
    './js/daily-challenge.js',
    './js/intervention.js',
    './js/teacher-dashboard.js',
    './js/stats-dashboard.js',
    './js/engine.js',
    './js/app-core.js',
    './js/app-quiz.js',
    './js/app-screens.js',
    './manifest.json',
    './icons/icon-192.svg',
    './icons/icon-512.svg',

    // Expansion shell + assets
    './expansion/expansion.html',
    './expansion/css/expansion-main.css',
    './expansion/css/facts.css',
    './expansion/css/methods.css',
    './expansion/css/step-display.css',
    './expansion/css/visuals.css',
    './expansion/css/progress.css',
    './expansion/css/remediation.css',
    './expansion/css/levels.css',
    './expansion/css/word-problems.css',
    './expansion/js/expansion-app.js',
    './expansion/js/expansion-config.js',
    './expansion/js/expansion-utils.js',
    './expansion/js/data/expansion-storage.js',
    './expansion/js/data/data-models.js',
    './expansion/js/facts/addition-practice.js',
    './expansion/js/facts/subtraction-practice.js',
    './expansion/js/facts/fact-grid.js',
    './expansion/js/facts/addition-facts.js',
    './expansion/js/facts/subtraction-facts.js',
    './expansion/js/facts/fact-mastery.js',
    './expansion/js/problems/problem-generator.js',
    './expansion/js/problems/difficulty-engine.js',
    './expansion/js/problems/word-problem-engine.js',
    './expansion/js/problems/word-problem-ui.js',
    './expansion/js/problems/word-problem-templates.js',
    './expansion/js/progress/progression-rules.js',
    './expansion/js/progress/level-select-ui.js',
    './expansion/js/progress/stats-view.js',
    './expansion/js/progress/session-logger.js',
    './expansion/js/ui/navigation.js',
    './expansion/js/ui/step-display.js',
    './expansion/js/ui/step-feedback.js',
    './expansion/js/methods/method-selector.js',
    './expansion/js/methods/method-cards.js',
    './expansion/js/methods/method-comparison.js',
    './expansion/js/methods/partitioning.js',
    './expansion/js/methods/compensation.js',
    './expansion/js/methods/sequencing.js',
    './expansion/js/methods/column-method.js',
    './expansion/js/methods/same-difference.js',
    './expansion/js/methods/counting-on.js',
    './expansion/js/visuals/number-line.js',
    './expansion/js/visuals/ten-frames.js',
    './expansion/js/visuals/base10-blocks.js',
    './expansion/js/visuals/part-whole-model.js',
    './expansion/js/diagnostics/diagnostic-ui.js',
    './expansion/js/diagnostics/diagnostic-quiz.js',
    './expansion/js/diagnostics/misunderstanding-tracker.js',
    './expansion/js/diagnostics/remediation-ui.js',
    './expansion/js/diagnostics/remediation-engine.js',
    './expansion/js/diagnostics/error-patterns.js',
    './expansion/js/diagnostics/remediation-content.js',
];

// Install: cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    // Only cache same-origin GET requests
                    if (event.request.method === 'GET' && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
            .catch(() => {
                // Offline fallback for HTML pages
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    if (event.request.url.includes('/expansion/')) {
                        return caches.match('./expansion/expansion.html');
                    }
                    return caches.match('./index.html');
                }
            })
    );
});
