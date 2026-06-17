import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { newsAPI } from '../utils/api';
import { formatDate } from '../utils/formatDate';
import { useLanguage } from '../context/LanguageContext';
import { FaFire, FaEye, FaArrowUp, FaArrowDown, FaCircle } from 'react-icons/fa';
import { useNewsData } from '../hooks/useNewsData';
import styles from '../styles/Trending.module.css';

/* ─── helpers ─────────────────────────────────────────────── */

const createSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const buildArticleUrl = (article) => {
  const slug = createSlug(article.title);
  const data = encodeURIComponent(
    JSON.stringify({
      title: article.title,
      description: article.description,
      content: article.content,
      author: article.author,
      source: article.source?.name || 'Unknown Source',
      publishedAt: article.publishedAt,
      url: article.url,
      urlToImage: article.urlToImage,
    })
  );
  return `/article/${encodeURIComponent(slug)}?data=${data}`;
};

const SCORES = [842, 611, 488, 374, -12, 298, 215, 187, 143, 98];
const getScore = (i) => (i < SCORES.length ? SCORES[i] : Math.max(10, 90 - i * 5));

const VIEW_COUNTS = [24300, 18500, 15200, 12800, 8900, 7400, 6100, 5200, 4800, 3900];
const getViews = (i) => (i < VIEW_COUNTS.length ? VIEW_COUNTS[i] : Math.max(500, 3500 - i * 200));
const fmtViews = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v));

const detectCategory = (article) => {
  const text = `${article.title} ${article.description || ''}`.toLowerCase();
  if (/\bai\b|artificial intelligence|gpt|llm|machine learning|openai|anthropic|gemini/.test(text)) return 'AI';
  if (/security|vulnerability|hack|breach|malware|ransomware|cyber|zero.?day/.test(text)) return 'SECURITY';
  if (/bitcoin|ethereum|crypto|blockchain|web3|nft|defi|token/.test(text)) return 'WEB3';
  if (/space|nasa|spacex|rocket|satellite|mars|moon|orbit/.test(text)) return 'SPACE';
  if (/chip|processor|gpu|cpu|semiconductor|hardware/.test(text)) return 'HARDWARE';
  if (/startup|funding|series [a-z]|venture|vc\b|valuation/.test(text)) return 'STARTUPS';
  if (/robot|automation|humanoid|drone/.test(text)) return 'ROBOTICS';
  if (/apple|google|microsoft|meta\b|amazon|tesla/.test(text)) return 'BIG TECH';
  return 'TECH';
};

const getReadTime = (article, t) => {
  const words = `${article.content || ''} ${article.description || ''} ${article.title}`.split(/\s+/).length;
  return `${Math.max(2, Math.round(words / 200))} ${t('time.minRead')}`;
};

const LOCALE_MAP = { en: 'en-US', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR', de: 'de-DE' };
const getTodayDate = (lang) => {
  const d = new Date();
  return d.toLocaleDateString(LOCALE_MAP[lang] || 'en-US', { month: 'long', day: '2-digit', year: 'numeric' });
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 16 }
  }
};

const TickerItem = ({ article, rank }) => (
  <Link href={buildArticleUrl(article)} className={styles.tickerItem}>
    <span className={styles.tickerRank}>#{rank}</span>
    <span className={styles.tickerTitle}>{article.title}</span>
    <span className={styles.tickerTag}>{detectCategory(article)}</span>
  </Link>
);

const HeroCard = ({ article, rank, t }) => {
  const score = getScore(rank - 1);
  const views = getViews(rank - 1);
  const category = detectCategory(article);
  const url = buildArticleUrl(article);
  const isUp = score >= 0;

  return (
    <motion.div variants={cardVariants} className={styles.heroCard}>
      {/* Giant outlined rank background */}
      <span className={styles.bgRank}>#{rank}</span>

      <div className={styles.heroCardHeader}>
        <div className={styles.rankBadge}>
          <span className={styles.rankNum}>{rank}</span>
          <span className={styles.rankLabel}>{t('trending.rank')}</span>
        </div>
        <div className={`${styles.scoreBadge} ${isUp ? styles.scoreUp : styles.scoreDown}`}>
          {isUp ? <FaArrowUp /> : <FaArrowDown />}
          {isUp ? ` +${score}` : ` ${score}`}
        </div>
      </div>

      <Link href={url} className={styles.heroImageWrap}>
        {article.urlToImage ? (
          <Image
            src={article.urlToImage}
            alt={article.title}
            fill
            className={styles.heroImage}
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 58vw"
            unoptimized
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.heroImagePlaceholder}>
            <span className={styles.heroImagePlaceholderText}>{t('trending.heroImagePlaceholder')}</span>
          </div>
        )}
      </Link>

      <div className={styles.heroCardBody}>
        <div className={styles.heroCategory}>{category} ——</div>
        <Link href={url}>
          <h2 className={styles.heroTitle}>{article.title}</h2>
        </Link>
        {article.description && (
          <p className={styles.heroDesc}>
            {article.description.length > 160
              ? `${article.description.substring(0, 160)}…`
              : article.description}
          </p>
        )}
        <div className={styles.heroFooter}>
          <span className={styles.heroSource}>{article.source?.name || t('trending.unknownSource')}</span>
          <span className={styles.heroMeta}>• {formatDate(article.publishedAt)}</span>
          <span className={styles.heroMeta}>• {getReadTime(article, t)}</span>
          <span className={styles.heroViews}>
            <FaCircle className={styles.viewDot} /> {fmtViews(views)} {t('trending.viewsLabel')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const SideCard = ({ article, rank, t }) => {
  const score = getScore(rank - 1);
  const category = detectCategory(article);
  const url = buildArticleUrl(article);
  const isUp = score >= 0;

  return (
    <motion.div variants={cardVariants} className={styles.sideCard}>
      {/* Giant background rank */}
      <span className={styles.bgRank} style={{ fontSize: '6rem', bottom: '-15px' }}>#{rank}</span>

      <div className={styles.sideRank}>{rank}</div>
      <div className={styles.sideCardBody}>
        <div className={styles.sideCardTop}>
          <span className={styles.sideCategory}>{category}</span>
          <div className={`${styles.scoreBadge} ${styles.scoreBadgeSm} ${isUp ? styles.scoreUp : styles.scoreDown}`}>
            {isUp ? <FaArrowUp /> : <FaArrowDown />}
            {isUp ? ` +${score}` : ` ${score}`}
          </div>
        </div>
        <Link href={url}>
          <h3 className={styles.sideTitle}>{article.title}</h3>
        </Link>
        <div className={styles.sideMeta}>
          <span className={styles.sideSource}>{article.source?.name || t('trending.unknownSource')}</span>
          <span className={styles.sideDot}>•</span>
          <span className={styles.sideTime}>{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
};

const FullListRow = ({ article, rank }) => {
  const score = getScore(rank - 1);
  const category = detectCategory(article);
  const url = buildArticleUrl(article);
  const isUp = score >= 0;

  return (
    <motion.div variants={cardVariants}>
      <Link href={url} className={styles.fullRow}>
        <span className={styles.fullRowRank}>#{rank}</span>
        <div className={styles.fullRowBody}>
          <span className={styles.fullRowCategory}>{category}</span>
          <span className={styles.fullRowTitle}>{article.title}</span>
          <span className={styles.fullRowMeta}>
            {article.source?.name} • {formatDate(article.publishedAt)}
          </span>
        </div>
        <div className={`${styles.scoreBadge} ${styles.scoreBadgeSm} ${isUp ? styles.scoreUp : styles.scoreDown}`}>
          {isUp ? <FaArrowUp /> : <FaArrowDown />}
          {isUp ? ` +${score}` : ` ${score}`}
        </div>
      </Link>
    </motion.div>
  );
};

const CATEGORIES_LIST = ['ALL', 'AI', 'SECURITY', 'STARTUPS', 'WEB3', 'SPACE', 'HARDWARE', 'BIG TECH'];

export default function Trending() {
  const { t, language } = useLanguage();
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  const { data: initialData, loading: initialLoading, error: initialError, mutate } = useNewsData(
    'trending-news-1-30',
    async () => {
      const data = await newsAPI.getTrendingNews(1, 30);
      if (data?.articles?.length >= 5) {
        return data;
      }
      const fallback = await newsAPI.getNews('all', 1, 30);
      const combined = [
        ...(data?.articles || []),
        ...(fallback.articles || []),
      ];
      const seen = new Set();
      const articles = combined.filter(a => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      });
      return { articles };
    }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialData) {
      setNews(initialData.articles || []);
    }
  }, [initialData]);

  const loading = initialLoading && news.length === 0;
  const error = initialError ? t('trending.error') : null;

  // Dynamic filter logic
  const filteredArticles = activeTab === 'ALL'
    ? news
    : news.filter(a => detectCategory(a) === activeTab);

  // Layout calculations
  const topFive = filteredArticles.slice(0, 5);
  const bottomFive = news.slice(5, 10); // keep tickers global for rich scroll volume

  return (
    <>
      <Head>
        <title>Trending Now — NEWSY TECH</title>
      </Head>
      <div className={styles.page}>

        {/* ── PAGE HEADER ── */}
        <div className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <h1 className={styles.mainTitle}>
              {mounted ? (
                <>
                  <motion.span
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: 'inline-block' }}
                  >
                    {t('trending.title.line1')}
                  </motion.span>{' '}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.22, duration: 0.6 }}
                    className={styles.nowText}
                    style={{ display: 'inline-block' }}
                  >
                    {t('trending.title.line2')}
                  </motion.span>{' '}
                  <motion.span
                    initial={{ opacity: 0, rotate: -25 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.42, type: 'spring', stiffness: 120 }}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <FaFire className={styles.fireIcon} />
                  </motion.span>
                </>
              ) : (
                <>
                  <span style={{ display: 'inline-block' }}>{t('trending.title.line1')}</span>{' '}
                  <span className={styles.nowText} style={{ display: 'inline-block' }}>{t('trending.title.line2')}</span>{' '}
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <FaFire className={styles.fireIcon} />
                  </span>
                </>
              )}
            </h1>
            <a href="#allTrending" className={styles.viewAll}>{t('trending.viewAll')}</a>
          </div>
          <div className={styles.subtitleRow}>
            <span>{t('trending.subtitleStories')}</span>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} /> {t('time.live')}
            </span>
            <span>{getTodayDate(language)}</span>
          </div>
        </div>

        {/* ── TOP TICKER (Ranks #1–5 global) ── */}
        {!loading && news.length > 0 && (
          <div className={styles.tickerBar}>
            <div className={styles.tickerLabel}>
              <FaFire /> {t('trending.tickerLabel')}
            </div>
            <div className={styles.tickerTrack}>
              <div className={styles.tickerScroll}>
                {[...news.slice(0, 5), ...news.slice(0, 5)].map((a, i) => (
                  <TickerItem key={`top-${i}`} article={a} rank={(i % 5) + 1} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── INTERACTIVE CATEGORY TABS ── */}
        {!loading && (
          <div className={styles.filtersRow}>
            {CATEGORIES_LIST.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`${styles.filterPill} ${activeTab === cat ? styles.filterPillActive : ''}`}
              >
                {activeTab === cat && (
                  <motion.div
                    layoutId="activeTrendingTabBg"
                    className={styles.filterPillActiveBg}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className={styles.filterPillText}>{cat}</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingWrap}><LoadingSpinner message={t('trending.loading')} /></div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => mutate()} className={styles.retryBtn}>{t('common.tryAgain')}</button>
          </div>
        ) : (
          <>
            {/* ── MAIN GRID ── */}
            <AnimatePresence mode="wait">
              {filteredArticles.length > 0 ? (
                <motion.div
                  key={activeTab} // Re-animate whole grid when category switches
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className={styles.mainGrid}
                >
                  {/* Hero Card (#1 in category) */}
                  {topFive[0] && (
                    <HeroCard
                      article={topFive[0]}
                      rank={news.indexOf(topFive[0]) + 1}
                      t={t}
                    />
                  )}

                  {/* Side List Cards (#2–5 in category) */}
                  <div className={styles.sideList}>
                    {topFive.slice(1).map((a) => (
                      <SideCard
                        key={a.url}
                        article={a}
                        rank={news.indexOf(a) + 1}
                        t={t}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.error}
                  style={{ color: '#8b9ba8', padding: '60px 20px' }}
                >
                  <p>No trending articles in "{activeTab}" category right now. Check back shortly!</p>
                  <button onClick={() => setActiveTab('ALL')} className={styles.retryBtn}>
                    View All Categories
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── BOTTOM TICKER (#6–10 global) ── */}
            {!loading && bottomFive.length > 0 && (
              <div className={`${styles.tickerBar} ${styles.tickerBarBottom}`}>
                <div className={`${styles.tickerLabel} ${styles.tickerLabelAlt}`}>
                  # 6–10
                </div>
                <div className={styles.tickerTrack}>
                  <div className={`${styles.tickerScroll} ${styles.tickerScrollReverse}`}>
                    {[...bottomFive, ...bottomFive].map((a, i) => (
                      <TickerItem key={`bot-${i}`} article={a} rank={(i % bottomFive.length) + 6} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── FULL LIST SECTION (Remaining Stories) ── */}
            {filteredArticles.length > 5 && (
              <div id="allTrending" className={styles.fullListSection}>
                <h2 className={styles.fullListHeading}>
                  <FaFire className={styles.fullListIcon} /> {t('trending.allStories')}
                </h2>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab} // Re-animate lists when tab switches
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className={styles.fullList}
                  >
                    {filteredArticles.slice(5).map((a) => (
                      <FullListRow
                        key={a.url}
                        article={a}
                        rank={news.indexOf(a) + 1}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

Trending.show3DBackground = true;
