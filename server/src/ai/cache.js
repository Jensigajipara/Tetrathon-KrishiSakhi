const cacheStore = new Map();
const DEFAULT_TTL = 300 * 1000; // Cache duration: 5 minutes

export const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
};

export const setCache = (key, value, ttl = DEFAULT_TTL) => {
  cacheStore.set(key, {
    value,
    expiry: Date.now() + ttl
  });
};

export const clearCache = () => {
  cacheStore.clear();
};
