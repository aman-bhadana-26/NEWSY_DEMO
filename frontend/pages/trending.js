import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { newsAPI } from '../utils/api';
import { formatDate } from '../utils/formatDate';
import { FaFire, FaEye, FaArrowUp, FaArrowDown, FaCircle } from 'react-icons/fa';
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

const getReadTime = (article) => {
  const words = `${article.content || ''} ${article.description || ''} ${article.title}`.split(/\s+/).length;
  return `${Math.max(2, Math.round(words / 200))} min read`;
};

const getTodayDate = () => {
  const d = new Date();
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
};

/* ─── ticker item ──────────────────────────────────────────── */
const TickerItem = ({ article, rank }) => (
  <Link href={buildArticleUrl(article)} className={styles.tickerItem}>
    <span className={styles.tickerRank}>#{rank}</span>
    <span className={styles.tickerTitle}>{article.title}</span>
    <span className={styles.tickerTag}>{detectCategory(article)}</span>
  </Link>
);

/* ─── hero card (rank #1) ──────────────────────────────────── */
const HeroCard = ({ article, rank }) => {
  const score = getScore(rank - 1);
  const views = getViews(rank - 1);
  const category = detectCategory(article);
  const url = buildArticleUrl(article);
  const isUp = score >= 0;

  return (
    <div className={styles.heroCard}>
      <div className={styles.heroCardHeader}>
        <div className={styles.rankBadge}>
          <span className={styles.rankNum}>{rank}</span>
          <span className={styles.rankLabel}>RANK</span>
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
          />
        ) : (
          <div className={styles.heroImagePlaceholder}>
            <span className={styles.heroImagePlaceholderText}>// HERO IMAGE</span>
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
          <span className={styles.heroSource}>{article.source?.name || 'Unknown Source'}</span>
          <span className={styles.heroMeta}>• {formatDate(article.publishedAt)}</span>
          <span className={styles.heroMeta}>• {getReadTime(article)}</span>
          <span className={styles.heroViews}>
            <FaCircle className={styles.viewDot} /> {fmtViews(views)} views
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── side list card (ranks #2–5) ─────────────────────────── */
const SideCard = ({ article, rank }) => {
  const score = getScore(rank - 1);
  const category = detectCategory(article);
  const url = buildArticleUrl(article);
  const isUp = score >= 0;

  return (
    <div className={styles.sideCard}>
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
          <span className={styles.sideSource}>{article.source?.name || 'Unknown Source'}</span>
          <span className={styles.sideDot}>•</span>
          <span className={styles.sideTime}>{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
};

/* ─── full list row (ranks #6+) ───────────────────────────── */
const FullListRow = ({ article, rank }) => {
  const score = getScore(rank - 1);
  const category = detectCategory(article);
  const url = buildArticleUrl(article);
  const isUp = score >= 0;

  return (
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
  );
};

/* ─── page ─────────────────────────────────────────────────── */
export default function Trending() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchTrending(); }, []);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsAPI.getTrendingNews(1, 30);
      // NewsAPI free plan often returns <5 articles for sortBy=popularity —
      // fall back to the general feed whenever we don't have enough to fill the layout
      if (data?.articles?.length >= 5) {
        setNews(data.articles);
      } else {
        const fallback = await newsAPI.getNews('all', 1, 30);
        const combined = [
          ...(data?.articles || []),
          ...(fallback.articles || []),
        ];
        // deduplicate by url
        const seen = new Set();
        setNews(combined.filter(a => {
          if (seen.has(a.url)) return false;
          seen.add(a.url);
          return true;
        }));
      }
    } catch (err) {
      setError('Failed to load trending news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const topFive   = news.slice(0, 5);
  const bottomFive = news.slice(5, 10);
  const restArticles = news.slice(10);

  return (
    <Layout title="Trending Now — NEWSY TECH">
      <div className={styles.page}>

        {/* ── PAGE HEADER ── */}
        <div className={styles.pageHeader}>
          <div className={styles.liveBar}>
            <FaCircle className={styles.livePulse} />
            <span>UPDATED LIVE EVERY 5 MINUTES</span>
          </div>
          <div className={styles.titleRow}>
            <h1 className={styles.mainTitle}>
              TRENDING <span className={styles.nowText}>NOW</span>
              <FaFire className={styles.fireIcon} />
            </h1>
            <a href="#allTrending" className={styles.viewAll}>VIEW ALL TRENDING →</a>
          </div>
          <div className={styles.subtitleRow}>
            <span>Top stories right now</span>
            <span className={styles.liveBadge}><FaCircle className={styles.liveDot} /> Live</span>
            <span>{getTodayDate()}</span>
          </div>
        </div>

        {/* ── TOP TICKER ── */}
        {topFive.length > 0 && (
          <div className={styles.tickerBar}>
            <div className={styles.tickerLabel}>
              <FaFire /> TRENDING
            </div>
            <div className={styles.tickerTrack}>
              <div className={styles.tickerScroll}>
                {[...topFive, ...topFive].map((a, i) => (
                  <TickerItem key={`top-${i}`} article={a} rank={(i % topFive.length) + 1} />
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingWrap}><LoadingSpinner message="Loading trending news…" /></div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchTrending} className={styles.retryBtn}>Try Again</button>
          </div>
        ) : (
          <>
            {/* ── MAIN GRID ── */}
            {news.length > 0 && (
              <div className={styles.mainGrid}>
                {/* Hero */}
                {news[0] && <HeroCard article={news[0]} rank={1} />}

                {/* Side list #2–5 */}
                <div className={styles.sideList}>
                  {topFive.slice(1).map((a, i) => (
                    <SideCard key={a.url + i} article={a} rank={i + 2} />
                  ))}
                </div>
              </div>
            )}

            {/* ── BOTTOM TICKER (#6–10) ── */}
            {bottomFive.length > 0 && (
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

            {/* ── FULL LIST ── */}
            {news.length > 5 && (
              <div id="allTrending" className={styles.fullListSection}>
                <h2 className={styles.fullListHeading}>
                  <FaFire className={styles.fullListIcon} /> All Trending Stories
                </h2>
                <div className={styles.fullList}>
                  {news.slice(5).map((a, i) => (
                    <FullListRow key={a.url + i} article={a} rank={i + 6} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
