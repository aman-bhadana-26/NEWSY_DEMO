/**
 * Simple in-memory cache with Time-To-Live (TTL) support.
 * Zero-dependency, lightweight, and fast.
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached item if it exists and has not expired.
   * @param {string} key - Cache key
   * @returns {*} Cached value, or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Store item in cache.
   * @param {string} key - Cache key
   * @param {*} value - Value to store
   * @param {number} ttlMs - Time to live in milliseconds
   */
  set(key, value, ttlMs) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  /**
   * Delete item from cache.
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all items in cache.
   */
  clear() {
    this.cache.clear();
  }
}

module.exports = MemoryCache;
