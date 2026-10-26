const STORAGE_KEY = 'educapedia-reading-progress';

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveProgress(id, data) {
  try {
    const all = getAll();
    all[id] = { ...data, lastRead: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function getProgress(id) {
  try {
    return getAll()[id] ?? null;
  } catch {
    return null;
  }
}

export function getAllProgress() {
  return getAll();
}

export function clearProgress(id) {
  try {
    const all = getAll();
    delete all[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export function getReadingStats() {
  const all    = getAll();
  const entries = Object.values(all);
  const finished   = entries.filter((e) => e.finished);
  const inProgress = entries.filter((e) => e.progress > 0 && !e.finished);

  const estimatedPages = entries.reduce(
    (sum, e) => sum + Math.round((e.progress / 100) * 280), 0
  );

  const now       = Date.now();
  const yesterday = now - 86400000;
  const readToday = entries.some((e) => e.lastRead > yesterday);
  const readYesterday = entries.some(
    (e) => e.lastRead > now - 172800000 && e.lastRead <= yesterday
  );

  const lastRead = entries.length
    ? Math.max(...entries.map((e) => e.lastRead || 0))
    : null;

  return {
    booksStarted:   entries.filter((e) => e.progress > 0).length,
    booksFinished:  finished.length,
    inProgress:     inProgress.length,
    estimatedPages,
    lastRead,
    activeToday:    readToday,
    streak:         readToday && readYesterday ? 2 : readToday ? 1 : 0,
  };
}

export function markFinished(id) {
  try {
    const all = getAll();
    if (all[id]) {
      all[id].finished = true;
      all[id].finishedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  } catch {}
}
