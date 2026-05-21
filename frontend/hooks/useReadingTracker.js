import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../utils/api';

/**
 * Tracks time spent on an article page and sends to analytics API on leave.
 */
export function useReadingTracker(article, topic) {
  const { isAuthenticated } = useAuth();
  const startRef = useRef(null);
  const sentRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !article?.url) return;

    startRef.current = Date.now();
    sentRef.current = false;

    const sendTrack = () => {
      if (sentRef.current || !startRef.current) return;
      sentRef.current = true;

      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      if (elapsed < 3) return;

      const sourceName =
        typeof article.source === 'string'
          ? article.source
          : article.source?.name || '';

      analyticsAPI
        .trackReading({
          articleUrl: article.url,
          articleTitle: article.title,
          topic,
          source: sourceName,
          timeSpentSeconds: elapsed
        })
        .catch(() => {});
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') sendTrack();
    };

    window.addEventListener('beforeunload', sendTrack);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      sendTrack();
      window.removeEventListener('beforeunload', sendTrack);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isAuthenticated, article?.url, article?.title, article?.source, topic]);
}
