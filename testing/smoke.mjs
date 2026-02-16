#!/usr/bin/env node
// Browser-driven smoke runner: checks execute against the app's client-side UI/DOM in Chromium.
// Node is used only to orchestrate browser startup/reporting for CI.
import { chromium } from 'playwright';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';

const sections = {
  Core: [],
  Expansion: [],
  Regression: []
};

function record(section, id, name, passed, details = '') {
  sections[section].push({ id, name, passed, details });
}

async function runCase(section, id, name, fn) {
  try {
    await fn();
    record(section, id, name, true);
  } catch (error) {
    record(section, id, name, false, error?.message || String(error));
  }
}

async function ensureHome(page) {
  if (await page.locator('#intervention-overlay').isVisible().catch(() => false)) {
    await page.evaluate(() => document.getElementById('btn-intervention-continue')?.click() || document.getElementById('btn-close-intervention')?.click() || document.getElementById('intervention-overlay')?.remove());
    await page.waitForTimeout(350);
  }

  if (await page.locator('#screen-home.active').isVisible().catch(() => false)) return;

  if (await page.locator('#screen-summary.active').isVisible().catch(() => false)) {
    await page.click('#btn-summary-home');
  } else if (await page.locator('#screen-quiz.active').isVisible().catch(() => false)) {
    await page.click('#btn-quit-quiz');
    if (await page.locator('#screen-summary.active').isVisible().catch(() => false)) {
      await page.click('#btn-summary-home');
    }
  } else if (await page.locator('#screen-settings.active').isVisible().catch(() => false)) {
    await page.click('#btn-back-from-settings');
  } else if (await page.locator('#screen-method-select.active').isVisible().catch(() => false)) {
    await page.click('#btn-back-from-method-select');
  } else if (await page.locator('#screen-expansion.active').isVisible().catch(() => false)) {
    await clickExpansionBack(page);
  } else if (await page.locator('#screen-welcome.active').isVisible().catch(() => false)) {
    const firstPlayer = page.locator('.player-btn').first();
    if (await firstPlayer.isVisible().catch(() => false)) {
      await firstPlayer.click();
    }
  }

  await page.waitForSelector('#screen-home.active', { timeout: 12000 });
}

async function enterNumpadNumber(page, number) {
  const digits = String(number).split('');
  for (const digit of digits) {
    await page.click(`#numpad .numpad-btn[data-val="${digit}"]`);
  }
  await page.click('#numpad .numpad-btn[data-val="go"]');
}


async function clickExpansionBack(page) {
  await page.evaluate(() => {
    const link = document.querySelector('#expansion-shell .back-link');
    if (link) link.click();
  });
}


async function openMethodsHomeCard(page) {
  const clicked = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('#expansion-root .card h2')];
    const target = headings.find((h) => h.textContent?.trim() === 'Mental Math Methods' && h.offsetParent !== null);
    if (!target) return false;
    const card = target.closest('.card');
    card?.click();
    return true;
  });
  if (!clicked) {
    throw new Error('Could not find visible Mental Math Methods card');
  }
}

function printReport() {
  const order = ['Core', 'Expansion', 'Regression'];
  let failures = 0;

  console.log('Smoke Test Report');
  console.log('=================');

  for (const sectionName of order) {
    const items = sections[sectionName];
    console.log(`\n${sectionName}`);
    console.log('-'.repeat(sectionName.length));
    for (const item of items) {
      const icon = item.passed ? 'PASS' : 'FAIL';
      console.log(`${icon} [${item.id}] ${item.name}${item.details ? ` :: ${item.details}` : ''}`);
      if (!item.passed) failures += 1;
    }
  }

  console.log(`\nSummary: ${failures === 0 ? 'PASS' : 'FAIL'} (${failures} failure${failures === 1 ? '' : 's'})`);
  return failures;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

await page.addInitScript(() => {
  const noop = () => Promise.resolve();
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { register: noop, addEventListener: () => {}, controller: null }
  });
});

try {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#screen-welcome.active', { timeout: 10000 });

  await runCase('Core', 'CORE-001', 'Player add/select flow', async () => {
    const name = `Smoke${Date.now().toString().slice(-5)}`;
    await page.fill('#new-player-name', name);
    await page.click('#btn-add-player');
    const playerButton = page.locator('.player-btn', { hasText: name });
    await playerButton.waitFor({ timeout: 5000 });
    await playerButton.click();
    await page.waitForSelector('#screen-home.active', { timeout: 5000 });
    await page.waitForSelector('#player-greeting', { timeout: 5000 });
  });

  await runCase('Core', 'CORE-002', 'Section tab toggle (number sense/times tables)', async () => {
    await ensureHome(page);
    await page.click('.section-tab[data-section="times-tables"]');
    await page.waitForSelector('.section-tab[data-section="times-tables"].active');
    await page.waitForSelector('#home-hint:has-text("Choose a table or auto-practice")');

    await page.click('.section-tab[data-section="number-sense"]');
    await page.waitForSelector('.section-tab[data-section="number-sense"].active');
    await page.waitForSelector('#home-hint:has-text("Auto-selects what you need to work on")');
  });

  await runCase('Core', 'CORE-003', 'Practice session progression (quiz advances through multiple questions)', async () => {
    await ensureHome(page);
    await page.click('#btn-practice');
    await page.waitForSelector('#screen-quiz.active', { timeout: 5000 });

    const solveFromText = (text) => {
      const normalized = text.replace(/\s+/g, ' ').trim();
      const match = normalized.match(/(-?\d+)\s*([+\-×x÷])\s*(-?\d+)/);
      if (!match) return '0';
      const a = Number(match[1]);
      const op = match[2];
      const b = Number(match[3]);
      if (op === '+') return String(a + b);
      if (op === '-') return String(a - b);
      if (op === '×' || op === 'x') return String(a * b);
      if (op === '÷') return b === 0 ? '0' : String(Math.trunc(a / b));
      return '0';
    };

    const firstProgress = await page.locator('#quiz-progress').innerText();
    for (let i = 0; i < 3; i += 1) {
      await page.waitForSelector('#quiz-question', { timeout: 10000 });
      const questionText = await page.locator('#quiz-question').innerText();
      const answer = solveFromText(questionText);
      await enterNumpadNumber(page, answer);
      await page.waitForTimeout(1400);
    }

    const laterProgress = await page.locator('#quiz-progress').innerText();
    if (firstProgress === laterProgress) {
      throw new Error(`Expected quiz progress to advance, still at ${laterProgress}`);
    }

    await page.click('#btn-quit-quiz');
    await page.waitForSelector('#screen-summary.active', { timeout: 10000 });
    await page.click('#btn-summary-home');
    await ensureHome(page);
  });

  await runCase('Core', 'CORE-004', 'Firebase settings UI state handling (local/auth error states)', async () => {
    if (await page.locator('#screen-summary.active').isVisible().catch(() => false)) {
      await page.click('#btn-summary-home');
    }
    await ensureHome(page);
    await page.click('#btn-settings');
    await page.waitForSelector('#screen-settings.active', { timeout: 5000 });

    await page.waitForSelector('#firebase-auth-pill:has-text("Local Only")', { timeout: 8000 });
    const formHidden = await page.locator('#cloud-auth-form').evaluate((el) => el.hidden);
    if (formHidden) throw new Error('Expected sign-in form to be visible while signed out');

    await page.fill('#firebase-email', 'smoke@example.com');
    await page.fill('#firebase-password', '123');
    await page.click('#btn-firebase-sign-in');
    await page.waitForSelector('#firebase-auth-status:has-text("Password must be at least 6 characters")', { timeout: 5000 });

    await page.click('#btn-back-from-settings');
    await ensureHome(page);
  });

  await runCase('Expansion', 'EXP-001', 'Expansion launch and back flow', async () => {
    await ensureHome(page);
    await page.evaluate(() => document.getElementById('btn-open-expansion')?.click());
    await page.waitForSelector('#screen-method-select.active', { timeout: 5000 });
    await page.click('[data-method="partitioning"]');
    await page.waitForSelector('#screen-expansion.active', { timeout: 10000 });
    await page.waitForSelector('#expansion-root', { timeout: 10000 });

    await clickExpansionBack(page);
    await page.waitForSelector('#screen-home.active', { timeout: 8000 });
  });

  await runCase('Expansion', 'EXP-002', 'Run through each expansion method screen', async () => {
    const methodRuns = [
      { name: 'Partitioning', op: '+', a: '503', b: '187' },
      { name: 'Sequencing', op: '+', a: '503', b: '187' },
      { name: 'Compensation', op: '+', a: '503', b: '187' },
      { name: 'Column Method', op: '+', a: '503', b: '187' },
      { name: 'Same Difference', op: '-', a: '503', b: '496' },
      { name: 'Counting On', op: '-', a: '503', b: '496' }
    ];
    for (const method of methodRuns) {
      await page.goto(`${BASE_URL}/expansion/expansion.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#expansion-root', { timeout: 10000 });
      await openMethodsHomeCard(page);
      await page.waitForSelector('#input-a', { timeout: 8000 });

      await page.fill('#input-a', method.a);
      await page.selectOption('#input-op', method.op);
      await page.fill('#input-b', method.b);
      await page.click('#solve-btn');
      await page.waitForSelector('.method-card', { timeout: 5000 });
      await page.locator('.method-card', { hasText: method.name }).first().click();
      await page.waitForSelector(`.method-badge:has-text("${method.name}")`, { timeout: 5000 });
    }

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#screen-welcome.active', { timeout: 10000 });
    const firstPlayer = page.locator('.player-btn').first();
    if (await firstPlayer.isVisible().catch(() => false)) {
      await firstPlayer.click();
      await ensureHome(page);
    }
  });

  await runCase('Regression', 'REG-001', 'Checklist coverage: player add/select', async () => {
    if (!sections.Core.some((t) => t.id === 'CORE-001' && t.passed)) {
      throw new Error('CORE-001 failed, regression not covered');
    }
  });

  await runCase('Regression', 'REG-002', 'Checklist coverage: section tab toggle', async () => {
    if (!sections.Core.some((t) => t.id === 'CORE-002' && t.passed)) {
      throw new Error('CORE-002 failed, regression not covered');
    }
  });

  await runCase('Regression', 'REG-003', 'Checklist coverage: practice progression', async () => {
    if (!sections.Core.some((t) => t.id === 'CORE-003' && t.passed)) {
      throw new Error('CORE-003 failed, regression not covered');
    }
  });

  await runCase('Regression', 'REG-004', 'Checklist coverage: Firebase settings states', async () => {
    if (!sections.Core.some((t) => t.id === 'CORE-004' && t.passed)) {
      throw new Error('CORE-004 failed, regression not covered');
    }
  });

  await runCase('Regression', 'REG-005', 'Checklist coverage: expansion launch/back', async () => {
    if (!sections.Expansion.some((t) => t.id === 'EXP-001' && t.passed)) {
      throw new Error('EXP-001 failed, regression not covered');
    }
  });

  await runCase('Regression', 'REG-006', 'Checklist coverage: all expansion methods', async () => {
    if (!sections.Expansion.some((t) => t.id === 'EXP-002' && t.passed)) {
      throw new Error('EXP-002 failed, regression not covered');
    }
  });
} finally {
  await context.close();
  await browser.close();
}

const failures = printReport();
process.exitCode = failures > 0 ? 1 : 0;
