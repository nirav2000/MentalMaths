// Session Logger
// Tracks practice sessions and individual questions for progress analytics

import { loadExpansionData, saveExpansionData } from '../data/expansion-storage.js';

let currentSession = null;

export function startSession(module, metadata = {}) {
  currentSession = {
    id: `session_${Date.now()}`,
    module,
    startTime: Date.now(),
    questions: [],
    metadata: {
      level: metadata.level || null,
      difficulty: metadata.difficulty || null,
      category: metadata.category || null,
      ...metadata
    }
  };
  return currentSession.id;
}

export function logQuestion(factKey, correct, timeMs, method = null, metadata = {}) {
  if (!currentSession) {
    console.warn('No active session. Call startSession() first.');
    return;
  }

  currentSession.questions.push({
    factKey,
    correct,
    timeMs,
    method,
    timestamp: Date.now(),
    ...metadata
  });
}

export function endSession() {
  if (!currentSession) {
    console.warn('No active session to end.');
    return null;
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - currentSession.startTime) / 1000); // seconds
  const questions = currentSession.questions;
  const correct = questions.filter(q => q.correct).length;
  const total = questions.length;
  const accuracy = total > 0 ? correct / total : 0;
  const avgTime = total > 0
    ? questions.reduce((sum, q) => sum + q.timeMs, 0) / total
    : 0;

  // Count methods used
  const methodsUsed = {};
  questions.forEach(q => {
    if (q.method) {
      methodsUsed[q.method] = (methodsUsed[q.method] || 0) + 1;
    }
  });

  const summary = {
    id: currentSession.id,
    date: new Date().toISOString().split('T')[0],
    timestamp: currentSession.startTime,
    module: currentSession.module,
    duration,
    questionsAttempted: total,
    correct,
    incorrect: total - correct,
    accuracy,
    avgTime: Math.round(avgTime),
    methodsUsed,
    metadata: currentSession.metadata
  };

  // Save to storage
  const data = loadExpansionData();
  if (!data.sessions) data.sessions = [];
  data.sessions.push(summary);

  // Keep only last 100 sessions
  if (data.sessions.length > 100) {
    data.sessions = data.sessions.slice(-100);
  }

  saveExpansionData(data);

  currentSession = null;
  return summary;
}

export function getCurrentSession() {
  return currentSession;
}

export function getSessionHistory(n = 10) {
  const data = loadExpansionData();
  const sessions = data.sessions || [];
  return sessions.slice(-n).reverse();
}

export function getSessionsByDate(startDate, endDate) {
  const data = loadExpansionData();
  const sessions = data.sessions || [];

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return sessions.filter(s => {
    const sessionTime = new Date(s.date).getTime();
    return sessionTime >= start && sessionTime <= end;
  });
}

export function getSessionStats() {
  const data = loadExpansionData();
  const sessions = data.sessions || [];

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalQuestions: 0,
      overallAccuracy: 0,
      streakDays: 0,
      lastSessionDate: null
    };
  }

  const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAttempted, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);
  const overallAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

  // Calculate streak days
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  let streakDays = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = new Date(today);

  for (const date of dates) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (date === dateStr) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    totalSessions: sessions.length,
    totalQuestions,
    overallAccuracy,
    streakDays,
    lastSessionDate: dates[0] || null
  };
}
