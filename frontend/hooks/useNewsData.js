import { useState, useEffect, useCallback, useRef } from 'react';

// Global cache variables outside component lifecycle to survive page transitions
const globalCache = new Map();
const activeRequests = new Map();
const listeners = new Map(); // key -> Set of setState functions

const subscribe = (key, listener) => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key).add(listener);
  return () => {
    listeners.get(key).delete(listener);
    if (listeners.get(key).size === 0) {
      listeners.delete(key);
    }
  };
};

const notify = (key, data) => {
  if (listeners.has(key)) {
    listeners.get(key).forEach((listener) => listener(data));
  }
};

/**
 * Fetch helper that caches responses and de-duplicates concurrent requests.
 * @param {string} key - Cache key
 * @param {Function} fetcher - Promise-returning fetch function
 * @returns {Promise<any>}
 */
export const fetchWithCache = async (key, fetcher) => {
  // If there is an active request in progress for this key, reuse it
  if (activeRequests.has(key)) {
    return activeRequests.get(key);
  }

  const promise = (async () => {
    try {
      const freshData = await fetcher();
      globalCache.set(key, {
        data: freshData,
        timestamp: Date.now(),
      });
      notify(key, freshData);
      return freshData;
    } finally {
      activeRequests.delete(key);
    }
  })();

  activeRequests.set(key, promise);
  return promise;
};

/**
 * Prefetch data in background. Resolves immediately if data is already fresh in cache.
 * @param {string} key - Cache key
 * @param {Function} fetcher - Fetcher function
 * @param {number} ttl - Cache time-to-live in ms (default 5m)
 */
export const prefetchNewsData = (key, fetcher, ttl = 5 * 60 * 1000) => {
  const cached = globalCache.get(key);
  const isStale = !cached || (Date.now() - cached.timestamp > ttl);
  if (isStale) {
    fetchWithCache(key, fetcher).catch(() => {});
  }
};

/**
 * Clear a specific cache key or invalidate cache.
 * @param {string} [key] - Optional cache key to clear. If omitted, clears all cache.
 */
export const invalidateNewsCache = (key) => {
  if (key) {
    globalCache.delete(key);
  } else {
    globalCache.clear();
  }
};

/**
 * Helper to generate cache keys consistently.
 */
export const getNewsCacheKey = (category, page, search, from, to, source, author) => {
  return `news-${category || 'all'}-${page || 1}-${search || ''}-${from || ''}-${to || ''}-${source || ''}-${author || ''}`;
};

/**
 * Hook for loading news with stale-while-revalidate caching.
 * @param {string} key - Cache key
 * @param {Function} fetcher - Fetcher function
 * @param {object} [options] - Cache options
 * @returns {{ data: any, loading: boolean, error: Error|null }}
 */
export const useNewsData = (key, fetcher, options = {}) => {
  const { enabled = true, ttl = 5 * 60 * 1000 } = options;

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [prevKey, setPrevKey] = useState(key);
  const [data, setData] = useState(() => {
    const cached = globalCache.get(key);
    return cached ? cached.data : null;
  });

  const [loading, setLoading] = useState(() => {
    if (!enabled) return false;
    const cached = globalCache.get(key);
    return !cached;
  });

  const [error, setError] = useState(null);

  // Sync state immediately during render if the cache key changes
  if (key !== prevKey) {
    setPrevKey(key);
    const cached = globalCache.get(key);
    setData(cached ? cached.data : null);
    setLoading(!cached && enabled);
    setError(null);
  }

  const mutate = useCallback(async (customFetcher = null) => {
    // Force bypass cache and fetch fresh data
    setLoading(true);
    try {
      invalidateNewsCache(key);
      const fetchFn = customFetcher || fetcherRef.current;
      const freshData = await fetchWithCache(key, () => fetchFn());
      setData(freshData);
      setError(null);
      return freshData;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!enabled) return;

    // Set up subscription for real-time synchronization between active components
    const unsubscribe = subscribe(key, (newData) => {
      setData(newData);
      setLoading(false);
      setError(null);
    });

    const cached = globalCache.get(key);
    const isStale = !cached || (Date.now() - cached.timestamp > ttl);

    if (isStale) {
      if (!cached) {
        setLoading(true);
      }

      fetchWithCache(key, () => fetcherRef.current())
        .catch((err) => {
          if (!globalCache.has(key)) {
            setError(err);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(cached.data);
      setLoading(false);
    }

    return unsubscribe;
  }, [key, enabled, ttl]);

  return { data, loading, error, mutate };
}
