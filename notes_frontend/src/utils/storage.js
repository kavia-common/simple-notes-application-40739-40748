const isArray = (v) => Array.isArray(v);

/**
 * PUBLIC_INTERFACE
 * Check if Web Storage is available.
 */
export function storageAvailable(type = 'localStorage') {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * PUBLIC_INTERFACE
 * Safely load notes array from localStorage. Returns [] if invalid/unavailable.
 */
export function safeLoadNotes(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!isArray(parsed)) return [];
    // basic validation map
    return parsed
      .filter(n => n && typeof n === 'object')
      .map(n => ({
        id: String(n.id ?? ''),
        title: String(n.title ?? ''),
        body: String(n.body ?? ''),
        createdAt: Number(n.createdAt ?? Date.now()),
        updatedAt: Number(n.updatedAt ?? Date.now()),
      }));
  } catch {
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * Safely persist notes array to localStorage. No-op if unavailable.
 */
export function safeSaveNotes(key, notes) {
  try {
    if (!storageAvailable('localStorage')) return;
    const payload = JSON.stringify(isArray(notes) ? notes : []);
    window.localStorage.setItem(key, payload);
  } catch {
    // ignore write errors (e.g., private mode)
  }
}
