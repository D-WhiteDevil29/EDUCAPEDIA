const KEY = 'educapedia-search-history';
const MAX = 8;

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveSearch(term) {
  if (!term?.trim()) return;
  const clean = term.trim();
  const list = getHistory().filter((t) => t.toLowerCase() !== clean.toLowerCase());
  list.unshift(clean);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function removeSearch(term) {
  localStorage.setItem(KEY, JSON.stringify(getHistory().filter((t) => t !== term)));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
