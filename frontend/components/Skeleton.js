/**
 * Skeleton – shimmer placeholder components used while content loads.
 * Usage:
 *   <TopStoriesSkeleton />          ← hero grid on home page
 *   <NewsGridSkeleton count={8} />  ← category / search grid
 *   <ArticleSkeleton />             ← article detail page
 */
import styles from '../styles/Skeleton.module.css';

/* ── single news card ──────────────────────────────────────── */
export function NewsCardSkeleton() {
  return (
    <div className={styles.newsCard}>
      <div className={styles.newsCardImage} />
      <div className={styles.newsCardBody}>
        <div className={styles.newsCardTag} />
        <div className={styles.newsCardTitle} />
        <div className={styles.newsCardTitle} />
        <div className={styles.newsCardMeta} />
      </div>
    </div>
  );
}

/* ── top-stories hero grid (1 big + 3 side) ────────────────── */
export function TopStoriesSkeleton() {
  return (
    <>
      <div className={styles.topStoriesGrid}>
        {/* Hero card */}
        <div className={styles.heroCard}>
          <div className={styles.heroImage} />
          <div className={styles.heroBody}>
            <div className={styles.heroTag} />
            <div className={styles.heroTitle} />
            <div className={styles.heroTitle2} />
            <div className={styles.heroMeta} />
          </div>
        </div>

        {/* Side stack */}
        <div className={styles.sideStack}>
          {[0, 1, 2].map(i => (
            <div key={i} className={styles.sideCard}>
              <div className={styles.sideImage} />
              <div className={styles.sideBody}>
                <div className={styles.sideTitle} />
                <div className={styles.sideTitle2} />
                <div className={styles.sideMeta} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Second row — 4 cards */}
      <div className={styles.newsGrid}>
        {[0, 1, 2, 3].map(i => <NewsCardSkeleton key={i} />)}
      </div>
    </>
  );
}

/* ── category / search grid ────────────────────────────────── */
export function NewsGridSkeleton({ count = 8 }) {
  return (
    <div className={styles.newsGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── article detail page ───────────────────────────────────── */
export function ArticleSkeleton() {
  return (
    <div className={styles.articleContainer}>
      <div className={styles.articleBreadcrumb} />
      <div className={styles.articleHeroImage} />
      <div className={styles.articleTag} />
      <div className={styles.articleTitle} />
      <div className={styles.articleTitle2} />

      <div className={styles.articleMeta}>
        <div className={styles.articleMetaItem} style={{ width: 120 }} />
        <div className={styles.articleMetaItem} style={{ width: 80 }} />
        <div className={styles.articleMetaItem} style={{ width: 60 }} />
      </div>

      <hr className={styles.articleDivider} />

      {/* Paragraph lines */}
      {[100, 95, 88, 100, 92, 80, 100, 96, 70].map((w, i) => (
        <div
          key={i}
          className={styles.articlePara}
          style={{ width: `${w}%` }}
        />
      ))}

      <div className={styles.articleMetaItem} style={{ width: 160, marginTop: 8 }} />

      {[100, 90, 84, 100, 76].map((w, i) => (
        <div
          key={`b${i}`}
          className={styles.articlePara}
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}
