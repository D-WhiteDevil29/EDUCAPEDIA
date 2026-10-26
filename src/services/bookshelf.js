import { getAllProgress } from './readingProgress';

const SHELF_KEY = 'educapedia-want-to-read';

function getRaw() {
  try {
    return JSON.parse(localStorage.getItem(SHELF_KEY) || '[]');
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(SHELF_KEY, JSON.stringify(list));
  } catch {}
}

export function addToWantToRead(book) {
  const list = getRaw();
  if (list.find((b) => b.id === book.id)) return;
  list.unshift({ ...book, addedAt: Date.now() });
  save(list);
}

export function removeFromWantToRead(id) {
  save(getRaw().filter((b) => b.id !== id));
}

export function isInWantToRead(id) {
  return getRaw().some((b) => b.id === id);
}

export function getWantToRead() {
  return getRaw();
}

export function getCurrentlyReading() {
  const progress = getAllProgress();
  return Object.entries(progress)
    .filter(([, p]) => p.progress > 0 && !p.finished)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => b.lastRead - a.lastRead);
}

export function getFinished() {
  const progress = getAllProgress();
  return Object.entries(progress)
    .filter(([, p]) => p.finished)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
}

export function getShelfCounts() {
  return {
    want:     getRaw().length,
    reading:  getCurrentlyReading().length,
    finished: getFinished().length,
  };
}
