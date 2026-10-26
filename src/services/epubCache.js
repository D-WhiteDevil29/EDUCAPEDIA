const DB_NAME    = 'educapedia-epub';
const STORE      = 'books';
const DB_VERSION = 1;
const MAX_BOOKS  = 12;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('lastAccessed', 'lastAccessed');
      }
    };
    req.onsuccess  = () => resolve(req.result);
    req.onerror    = () => reject(req.error);
  });
}

export async function getCachedEpub(id) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx    = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req   = store.get(id);
      req.onsuccess = () => {
        const rec = req.result;
        if (!rec) { resolve(null); return; }
        rec.lastAccessed = Date.now();
        store.put(rec);
        resolve(rec.buffer);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function cacheEpub(id, buffer, title) {
  try {
    const db = await openDB();
    await pruneCache(db);
    return new Promise((resolve) => {
      const tx    = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      store.put({
        id,
        buffer,
        title:        title ?? '',
        size:         buffer.byteLength,
        cachedAt:     Date.now(),
        lastAccessed: Date.now(),
      });
      tx.oncomplete = resolve;
      tx.onerror    = resolve;
    });
  } catch {
    // non-critical — reader still works without cache
  }
}

async function pruneCache(db) {
  return new Promise((resolve) => {
    const tx      = db.transaction(STORE, 'readwrite');
    const store   = tx.objectStore(STORE);
    const index   = store.index('lastAccessed');
    const records = [];

    const req = index.openCursor();
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        records.sort((a, b) => a.lastAccessed - b.lastAccessed);
        const now = Date.now();
        records.forEach((rec, i) => {
          const stale    = now - rec.lastAccessed > MAX_AGE_MS;
          const overLimit = i < records.length - MAX_BOOKS;
          if (stale || overLimit) store.delete(rec.id);
        });
        resolve();
      }
    };
    req.onerror = () => resolve();
  });
}

export async function getCacheStats() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => {
        const rows = req.result;
        resolve({
          count:     rows.length,
          totalSize: rows.reduce((s, r) => s + r.size, 0),
          books:     rows
            .sort((a, b) => b.lastAccessed - a.lastAccessed)
            .map(({ id, title, size, cachedAt, lastAccessed }) => ({
              id, title, size, cachedAt, lastAccessed,
            })),
        });
      };
      req.onerror = () => resolve({ count: 0, totalSize: 0, books: [] });
    });
  } catch {
    return { count: 0, totalSize: 0, books: [] };
  }
}

export async function clearAllCache() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = resolve;
      tx.onerror    = resolve;
    });
  } catch {
    // ignore
  }
}
