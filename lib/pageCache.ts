// Next.js App Router unmounts a route's component tree on navigation and
// remounts it fresh on return, so every tab page's own useState resets to
// empty and shows its loading skeleton again -- even for data fetched
// seconds ago. This is a plain module-scope cache (survives remounts
// within the same JS runtime, cleared only on a real page reload): pages
// initialize their state from it and skip the skeleton when something's
// already there, then silently refetch and update it in the background.
const cache = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return cache.has(key) ? (cache.get(key) as T) : undefined;
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value);
}
