// Localized "time-ago" formatter.
// Used everywhere we display "Xh ago", "Yesterday", "Just now", etc.
//
// Usage:
//   const { t } = useLanguage();
//   formatTimeAgo(article.publishedAt, t);

export function formatTimeAgo(dateString, t) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return t('time.justNow');
  if (diffHr < 1)  return `${diffMin}${t('time.minutesAgoSuffix')}`;
  if (diffHr < 24) return `${diffHr}${t('time.hoursAgoSuffix')}`;
  if (diffDays < 2) return t('time.yesterday');
  return `${diffDays}${t('time.daysAgoSuffix')}`;
}
