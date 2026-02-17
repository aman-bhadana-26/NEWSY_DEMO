import { useEffect } from 'react';

/**
 * Custom hook to optimize scrolling performance
 * Implements passive event listeners and requestAnimationFrame for smooth scrolling
 */
export const useScrollOptimization = () => {
  useEffect(() => {
    // Optimize scroll event handling with passive listeners
    const handleScroll = () => {
      // Use requestAnimationFrame for smooth scroll handling
      window.requestAnimationFrame(() => {
        // Scroll handling logic can be added here if needed
      });
    };

    // Add passive event listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
};

/**
 * Throttle function to limit how often a function can be called
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Debounce function to delay function execution
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};
