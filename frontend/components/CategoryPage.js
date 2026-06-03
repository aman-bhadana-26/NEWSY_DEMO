import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { myNewsAPI } from '../utils/api';
import styles from '../styles/CategoryPage.module.css';

// Map filter id (English, stable) → translation key suffix.
// Using stable English ids keeps keyword matching in `applyFilter` working.
const FILTER_KEY_MAP = {
  'All':             'all',
  'Language Models': 'languageModels',
  'Research':        'research',
  'Robotics':        'robotics',
  'Computer Vision': 'computerVision',
  'Funding':         'funding',
  'Founders':        'founders',
  'IPO':             'ipo',
  'Acquisitions':    'acquisitions',
  'Deep Tech':       'deepTech',
  'Dev Tools':       'devTools',
  'Open Source':     'openSource',
  'Cloud':           'cloud',
  'Web':             'web',
  'Mobile':          'mobile',
  'Phones':          'phones',
  'Laptops':         'laptops',
  'Wearables':       'wearables',
  'Audio':           'audio',
  'Gaming':          'gaming',
  'Threats':         'threats',
  'Privacy':         'privacy',
  'Breaches':        'breaches',
  'Tools':           'tools',
  'Policy':          'policy',
  'AI':              'ai',
  'Startups':        'startups',
  'Software':        'software',
  'Gadgets':         'gadgets',
  'Cybersecurity':   'cybersecurity',
};

const filterLabel = (id, t) => {
  const key = FILTER_KEY_MAP[id];
  return key ? t(`catPage.filter.${key}`) : id;
};

// Sub-filters per category
const subFilters = {
  ai:           ['All', 'Language Models', 'Research', 'Robotics', 'Computer Vision'],
  startups:     ['All', 'Funding', 'Founders', 'IPO', 'Acquisitions', 'Deep Tech'],
  software:     ['All', 'Dev Tools', 'Open Source', 'Cloud', 'Web', 'Mobile'],
  gadgets:      ['All', 'Phones', 'Laptops', 'Wearables', 'Audio', 'Gaming'],
  cybersecurity:['All', 'Threats', 'Privacy', 'Breaches', 'Tools', 'Policy'],
  all:          ['All', 'AI', 'Startups', 'Software', 'Gadgets', 'Cybersecurity'],
  mynews:       ['All', 'AI', 'Startups', 'Software', 'Gadgets', 'Cybersecurity'],
  saved:        ['All', 'AI', 'Startups', 'Software', 'Gadgets', 'Cybersecurity'],
};

// Keyword map – used to filter articles by sub-filter pill
const filterKeywords = {
  ai: {
    'Language Models': ['llm','language model','gpt','claude','gemini','chatgpt','llama','openai','mistral'],
    'Research':        ['research','paper','study','arxiv','benchmark','scientist','lab'],
    'Robotics':        ['robot','robotics','humanoid','automation','mechanical arm'],
    'Computer Vision': ['computer vision','image recognition','vision model','object detection','visual ai'],
  },
  startups: {
    'Funding':      ['funding','raise','raised','series a','series b','series c','investment','venture','seed round'],
    'Founders':     ['founder','ceo','co-founder','entrepreneur','startup founder'],
    'IPO':          ['ipo','public offering','stock market','nasdaq','nyse','listing'],
    'Acquisitions': ['acqui','acquisition','merger','buyout','purchase','acquired'],
    'Deep Tech':    ['deep tech','quantum','biotech','space tech','nanotech','synthetic bio'],
  },
  software: {
    'Dev Tools':   ['developer tool','ide','editor','github','git','cli','sdk','api','devops'],
    'Open Source': ['open source','open-source','linux','community project','fork','contributor'],
    'Cloud':       ['cloud','aws','azure','gcp','kubernetes','serverless','saas','infrastructure'],
    'Web':         ['web','browser','javascript','react','frontend','html','css','nextjs','vue'],
    'Mobile':      ['mobile','ios','android','app store','flutter','react native','swift','kotlin'],
  },
  gadgets: {
    'Phones':    ['phone','smartphone','iphone','android','samsung galaxy','pixel phone','oneplus','nothing phone'],
    'Laptops':   ['laptop','macbook','notebook','chromebook','thinkpad','dell xps','surface pro'],
    'Wearables': ['wearable','smartwatch','apple watch','fitbit','fitness tracker','galaxy watch','band'],
    'Audio':     ['audio','headphone','earphone','earbud','speaker','airpods','soundbar','hi-fi'],
    'Gaming':    ['gaming','game','console','playstation','xbox','nintendo','steam deck','gpu','pc gaming'],
  },
  cybersecurity: {
    'Threats':  ['threat','malware','ransomware','attack','vulnerability','exploit','zero-day'],
    'Privacy':  ['privacy','gdpr','data collection','tracking','surveillance','personal data'],
    'Breaches': ['breach','hack','leaked','data breach','stolen data','compromised'],
    'Tools':    ['security tool','antivirus','vpn','firewall','encryption','siem','soc'],
    'Policy':   ['policy','regulation','law','government','compliance','cybersecurity act'],
  },
  all: {
    'AI':           ['ai','artificial intelligence','machine learning','deep learning','neural network','openai'],
    'Startups':     ['startup','founder','funding','venture capital','seed','series'],
    'Software':     ['software','app','developer','code','programming','open source'],
    'Gadgets':      ['gadget','phone','laptop','device','hardware','wearable','console'],
    'Cybersecurity':['security','cyber','hack','breach','malware','vulnerability','ransomware'],
  },
  mynews: {
    'AI':           ['ai','artificial intelligence','machine learning','deep learning','neural network','openai'],
    'Startups':     ['startup','founder','funding','venture capital','seed','series'],
    'Software':     ['software','app','developer','code','programming','open source'],
    'Gadgets':      ['gadget','phone','laptop','device','hardware','wearable','console'],
    'Cybersecurity':['security','cyber','hack','breach','malware','vulnerability','ransomware'],
  },
  saved: {
    'AI':           ['ai','artificial intelligence','machine learning','deep learning','neural network','openai'],
    'Startups':     ['startup','founder','funding','venture capital','seed','series'],
    'Software':     ['software','app','developer','code','programming','open source'],
    'Gadgets':      ['gadget','phone','laptop','device','hardware','wearable','console'],
    'Cybersecurity':['security','cyber','hack','breach','malware','vulnerability','ransomware'],
  },
};

// Filter articles by active sub-filter
function applyFilter(articles, filter, cat) {
  if (filter === 'All') return articles;
  const keywords = filterKeywords[cat]?.[filter] || [];
  if (!keywords.length) return articles;
  return articles.filter(a => {
    const text = `${a.title || ''} ${a.description || ''} ${a.content || ''}`.toLowerCase();
    return keywords.some(kw => text.includes(kw.toLowerCase()));
  });
}

// Sort articles
function applySort(articles, sort) {
  const arr = [...articles];
  if (sort === 'Latest') {
    return arr.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }
  if (sort === 'Oldest') {
    return arr.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
  }
  if (sort === 'A–Z') {
    return arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }
  return arr;
}

// Maps category id → translation key suffix.
const CAT_LABEL_KEY_MAP = {
  ai:            'ai',
  startups:      'startups',
  software:      'software',
  gadgets:       'gadgets',
  cybersecurity: 'cybersecurity',
  all:           'all',
  mynews:        'mynews',
  saved:         'saved',
};

export default function CategoryPage({
  category,
  news,
  totalResults,
  hasMore,
  loadingMore,
  onLoadMore,
  lastUpdated,
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [imageErrors, setImageErrors] = useState({});
  const INITIAL_VISIBLE = 3;
  const LOAD_STEP = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  // ── Save state ──
  const [savedUrls, setSavedUrls] = useState(new Set());
  const [savingUrl, setSavingUrl] = useState(null);   // url currently being toggled
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Load saved articles when authenticated
  useEffect(() => {
    if (!isAuthenticated) { setSavedUrls(new Set()); return; }
    myNewsAPI.getSavedArticles()
      .then(data => {
        const urls = (data.savedArticles || []).map(a => a.url);
        setSavedUrls(new Set(urls));
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleSaveClick = useCallback(async (e, article) => {
    e.stopPropagation();
    if (!isAuthenticated) { setShowLoginPrompt(true); return; }
    if (savingUrl === article.url) return; // debounce
    setSavingUrl(article.url);
    try {
      if (savedUrls.has(article.url)) {
        await myNewsAPI.unsaveArticle(article.url);
        setSavedUrls(prev => { const s = new Set(prev); s.delete(article.url); return s; });
      } else {
        await myNewsAPI.saveArticle({
          title:       article.title,
          url:         article.url,
          urlToImage:  article.urlToImage,
          source:      article.source?.name || article.source || '',
          author:      article.author || '',
          description: article.description || '',
          content:     article.content || '',
          publishedAt: article.publishedAt,
        });
        setSavedUrls(prev => new Set([...prev, article.url]));
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSavingUrl(null);
    }
  }, [isAuthenticated, savedUrls, savingUrl]);

  // Reset visible count whenever category, filter, or sort changes
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [category, activeFilter, sortBy]);

  const handleImageError = (url) => {
    setImageErrors(prev => ({ ...prev, [url]: true }));
  };

  const createSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

  const goToArticle = (article) => {
    const slug = createSlug(article.title);
    const data = encodeURIComponent(JSON.stringify({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name || article.source || 'Unknown Source',
      author: article.author,
    }));
    router.push(`/article/${slug}?data=${data}`);
  };

  const labelKey = CAT_LABEL_KEY_MAP[category];
  const categoryName = labelKey ? t(`catPage.label.${labelKey}`) : t('catPage.label.tech');
  const filters = subFilters[category] || subFilters.all;

  // Hero = first 2 articles (fixed, unaffected by filter/sort)
  const featured     = news[0];
  const heroRight    = news[1];
  // Apply filter + sort to the remaining articles
  const allGridArticles     = applySort(applyFilter(news.slice(2), activeFilter, category), sortBy);
  const visibleGridArticles = allGridArticles.slice(0, visibleCount);
  // Bottom sidebar — from original order, not affected by filter/sort
  const latestList  = news.slice(5, 13);
  const editorPicks = news.slice(13, 16);

  // Local "show more" handler — expands grid first, then fetches from API
  const handleLoadMore = () => {
    if (visibleCount < allGridArticles.length) {
      // Still have locally fetched articles to reveal
      setVisibleCount(prev => prev + LOAD_STEP);
    } else if (hasMore) {
      // All local articles shown — fetch next page from API
      onLoadMore();
      setVisibleCount(prev => prev + LOAD_STEP);
    }
  };

  const localHasMore = visibleCount < allGridArticles.length || hasMore;

  const ImageOrPlaceholder = ({ src, alt, className }) => {
    if (src && !imageErrors[src]) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          onError={() => handleImageError(src)}
          loading="lazy"
        />
      );
    }
    return (
      <div className={styles.imgPlaceholder}>
        <span className={styles.imgPlaceholderIcon}>// IMAGE</span>
      </div>
    );
  };

  // ── Save button helper ──
  const SaveBtn = ({ article }) => {
    const isSaved   = savedUrls.has(article.url);
    const isSaving  = savingUrl === article.url;
    return (
      <button
        className={`${styles.saveBtn} ${isSaved ? styles.saveBtnSaved : ''}`}
        onClick={e => handleSaveClick(e, article)}
        title={isSaved ? t('catPage.removeSaved') : t('catPage.saveLater')}
        disabled={isSaving}
        aria-label={isSaved ? t('catPage.unsaveAria') : t('catPage.saveAria')}
      >
        {isSaving ? (
          <span className={styles.saveBtnSpinner} />
        ) : isSaved ? (
          /* solid bookmark */
          <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
            <path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z"/>
          </svg>
        ) : (
          /* outline bookmark */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z"/>
          </svg>
        )}
      </button>
    );
  };

  if (!featured) return null;

  return (
    <div className={styles.categoryPage}>

      {/* ── Login Prompt Modal ── */}
      {showLoginPrompt && (
        <div className={styles.loginOverlay} onClick={() => setShowLoginPrompt(false)}>
          <div className={styles.loginModal} onClick={e => e.stopPropagation()}>
            <button className={styles.loginModalClose} onClick={() => setShowLoginPrompt(false)}>✕</button>
            <div className={styles.loginModalIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                <path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z"/>
              </svg>
            </div>
            <h3 className={styles.loginModalTitle}>{t('catPage.loginPrompt.title')}</h3>
            <p className={styles.loginModalText}>
              {t('catPage.loginPrompt.text')}
            </p>
            <div className={styles.loginModalBtns}>
              <button
                className={styles.loginModalPrimary}
                onClick={() => { setShowLoginPrompt(false); router.push('/login'); }}
              >
                {t('catPage.loginPrompt.login')}
              </button>
              <button
                className={styles.loginModalSecondary}
                onClick={() => { setShowLoginPrompt(false); router.push('/signup'); }}
              >
                {t('catPage.loginPrompt.signup')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className={`${styles.pageHeader} anim-slide`}>
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbHome} onClick={() => router.push('/')}>{t('catPage.breadcrumbHome')}</span>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>
            {category === 'mynews'
              ? t('catPage.breadcrumb.mynews')
              : category === 'saved'
              ? t('catPage.breadcrumb.saved')
              : (labelKey ? t(`catPage.label.${labelKey}`) : category).toUpperCase()}
          </span>
        </div>

        <div className={styles.headerRow}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className={styles.categoryTitle}>
              <span className={styles.titleGradient}>
                {router.query.search || router.query.from || router.query.to || router.query.source || router.query.author
                  ? t('home.searchResults')
                  : categoryName}
              </span>
            </h1>
            {(router.query.search || router.query.from || router.query.to || router.query.source || router.query.author) && (
              <div className={styles.activeFiltersRow}>
                {router.query.search && <span className={styles.activeFilterBadge}>Keyword: "{router.query.search}"</span>}
                {router.query.category && router.query.category !== 'all' && <span className={styles.activeFilterBadge}>Category: {router.query.category.toUpperCase()}</span>}
                {router.query.source && <span className={styles.activeFilterBadge}>Source: {router.query.source}</span>}
                {router.query.author && <span className={styles.activeFilterBadge}>Author: {router.query.author}</span>}
                {(router.query.from || router.query.to) && (
                  <span className={styles.activeFilterBadge}>
                    Date: {router.query.from ? router.query.from : '*'} to {router.query.to ? router.query.to : '*'}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={styles.articleMeta}>
            <p className={styles.articleCount}>
              {t('catPage.showing')} <strong>{news.length}</strong> {t('catPage.of')}{' '}
              <strong>{totalResults.toLocaleString()}</strong> {t('catPage.articles')}
            </p>
            {lastUpdated && (
              <p className={styles.lastUpdated}>{t('catPage.updated')} {lastUpdated}</p>
            )}
          </div>
        </div>

        {/* Sub-filter pills + Sort — hidden for mynews / saved */}
        {category !== 'mynews' && category !== 'saved' && (
          <div className={styles.filterRow}>
            <div className={styles.filterPills}>
              {filters.map(f => (
                <button
                  key={f}
                  className={`${styles.filterPill} ${activeFilter === f ? styles.filterPillActive : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {filterLabel(f, t).toUpperCase()}
                </button>
              ))}
            </div>
            <div className={styles.sortWrapper}>
              <span className={styles.sortLabel}>{t('catPage.sort')}</span>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="Latest">{t('catPage.sort.latest')}</option>
                <option value="Oldest">{t('catPage.sort.oldest')}</option>
                <option value="A–Z">{t('catPage.sort.az')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Hero Section: Featured + Hero Right ── */}
      <div className={styles.heroSection}>
        {/* Featured article – big left */}
        <div className={styles.featuredCard} onClick={() => goToArticle(featured)}>
          <div className={styles.featuredImgWrap}>
            <ImageOrPlaceholder
              src={featured.urlToImage}
              alt={featured.title}
              className={styles.featuredImg}
            />
            <div className={styles.featuredOverlay} />
            <SaveBtn article={featured} />
          </div>
          <div className={styles.featuredContent}>
            <span className={styles.featuredBadge}>{t('catPage.featured')}</span>
            <h2 className={styles.featuredTitle}>{featured.title}</h2>
            <p className={styles.featuredDesc}>
              {featured.description?.slice(0, 180) || ''}
            </p>
            <div className={styles.featuredFooter}>
              <div className={styles.featuredMeta}>
                <span className={styles.metaSource}>
                  {featured.source?.name || featured.source || t('common.unknown')}
                </span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaTime}>{formatDate(featured.publishedAt)}</span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaRead}>5 {t('catPage.minRead')}</span>
              </div>
              <button className={styles.readMoreBtn}>{t('catPage.readMore')}</button>
            </div>
          </div>
        </div>

        {/* Hero right article */}
        {heroRight && (
          <div className={styles.heroRightCard} onClick={() => goToArticle(heroRight)}>
            <div className={styles.heroRightImgWrap}>
              <ImageOrPlaceholder
                src={heroRight.urlToImage}
                alt={heroRight.title}
                className={styles.heroRightImg}
              />
              <div className={styles.heroRightOverlay} />
              <SaveBtn article={heroRight} />
            </div>
            <div className={styles.heroRightContent}>
              <span className={styles.heroRightCategory}>
                {category !== 'all' && labelKey ? t(`catPage.label.${labelKey}`).toUpperCase() : t('common.tech').toUpperCase()}
              </span>
              <h3 className={styles.heroRightTitle}>{heroRight.title}</h3>
              <p className={styles.heroRightDesc}>
                {heroRight.description?.slice(0, 120) || ''}
              </p>
              <div className={styles.heroRightMeta}>
                <span className={styles.metaSource}>
                  {heroRight.source?.name || heroRight.source || t('common.unknown')}
                </span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaTime}>{formatDate(heroRight.publishedAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No-results message when filter returns nothing */}
      {allGridArticles.length === 0 && activeFilter !== 'All' && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon}>◈</span>
          <p>{t('catPage.noResults1')} <strong>{filterLabel(activeFilter, t)}</strong>.</p>
          <button className={styles.noResultsReset} onClick={() => setActiveFilter('All')}>
            {t('catPage.noResultsReset')}
          </button>
        </div>
      )}

      {/* ── 3-Column Grid (starts with 3, expands on Load More) ── */}
      {visibleGridArticles.length > 0 && (
        <div className={styles.gridSection}>
          <div className={`${styles.gridSectionHeading} anim-slide`}>
            <span className={styles.sectionHeading}>{t('catPage.moreStories')}</span>
            <span className={styles.gridArticleCount}>{visibleGridArticles.length} {t('catPage.articlesOf')} {allGridArticles.length} {t('catPage.articles')}</span>
          </div>
          <div className={styles.threeGrid}>
            {visibleGridArticles.map((article, i) => (
              <div key={`${article.url}-${i}`} className={`${styles.gridCard} anim-fade-up delay-${(i % 3) + 1}`} onClick={() => goToArticle(article)}>
                <div className={styles.gridImgWrap}>
                  <ImageOrPlaceholder
                    src={article.urlToImage}
                    alt={article.title}
                    className={styles.gridImg}
                  />
                  <span className={styles.gridCategoryBadge}>
                    {category !== 'all' && labelKey ? t(`catPage.label.${labelKey}`).toUpperCase() : t('common.tech').toUpperCase()}
                  </span>
                  <SaveBtn article={article} />
                </div>
                <div className={styles.gridContent}>
                  <h4 className={styles.gridTitle}>{article.title}</h4>
                  <p className={styles.gridDesc}>
                    {article.description?.slice(0, 100) || ''}
                  </p>
                  <div className={styles.gridMeta}>
                    <span className={styles.metaSource}>
                      {article.source?.name || article.source || t('common.unknown')}
                    </span>
                    <span className={styles.metaDot}>•</span>
                    <span className={styles.metaTime}>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom 2-col: Latest Stories + Editor's Picks ── */}
      {(latestList.length > 0 || editorPicks.length > 0) && (
        <div className={styles.bottomSection}>

          {/* Latest Stories list */}
          <div className={styles.latestStories}>
            <div className={`${styles.sectionHeadingRow} anim-slide`}>
              <span className={styles.sectionHeading}>{t('catPage.latestStories')}</span>
              <span className={styles.storyCount}>{latestList.length} {t('catPage.latestArticleCount')}</span>
            </div>
            <div className={styles.latestList}>
              {latestList.map((article, i) => (
                <div key={`latest-${i}`} className={`${styles.latestItem} ${i % 2 === 0 ? 'anim-fade-left' : 'anim-fade-right'} delay-${(i % 6) + 1}`} onClick={() => goToArticle(article)}>
                  <span className={styles.latestNum}>{String(i + 1).padStart(2, '0')}</span>
                  <div className={styles.latestBody}>
                    <SaveBtn article={article} />
                    <span className={styles.latestCategory}>
                      {category !== 'all' && labelKey ? t(`catPage.label.${labelKey}`).toUpperCase() : t('common.tech').toUpperCase()}
                    </span>
                    <h4 className={styles.latestTitle}>{article.title}</h4>
                    <p className={styles.latestDesc}>{article.description?.slice(0, 100) || ''}</p>
                    <div className={styles.latestMeta}>
                      <span className={styles.metaSource}>
                        {article.source?.name || article.source || t('common.unknown')}
                      </span>
                      <span className={styles.metaDot}>•</span>
                      <span className={styles.metaTime}>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor's Picks sidebar */}
          <div className={styles.editorPicks}>
            <div className={`${styles.sectionHeadingRow} anim-slide`}>
              <span className={styles.sectionHeading}>{t('catPage.editorPicks')}</span>
            </div>
            <div className={styles.editorList}>
              {editorPicks.map((article, i) => (
                <div key={`editor-${i}`} className={`${styles.editorCard} anim-fade-up delay-${i + 1}`} onClick={() => goToArticle(article)}>
                  <div className={styles.editorImgWrap}>
                    <ImageOrPlaceholder
                      src={article.urlToImage}
                      alt={article.title}
                      className={styles.editorImg}
                    />
                    <SaveBtn article={article} />
                  </div>
                  <div className={styles.editorBody}>
                    <span className={styles.editorCategory}>
                      {category !== 'all' && labelKey ? t(`catPage.label.${labelKey}`).toUpperCase() : t('common.tech').toUpperCase()}
                    </span>
                    <h4 className={styles.editorTitle}>{article.title}</h4>
                    <div className={styles.editorMeta}>
                      <span className={styles.metaSource}>
                        {article.source?.name || article.source || t('common.unknown')}
                      </span>
                      <span className={styles.metaDot}>•</span>
                      <span className={styles.metaTime}>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Load More ── */}
      <div className={styles.loadMoreSection}>
        <div className={styles.loadMoreInfo}>
          {t('catPage.showing')} <strong>{visibleCount + 2}</strong> {t('catPage.of')}{' '}
          <strong>{totalResults.toLocaleString()}</strong> {t('catPage.articles')}
        </div>
        {localHasMore && (
          <button
            className={styles.loadMoreBtn}
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <><span className={styles.loadSpinner} /> {t('catPage.loadingMore')}</>
            ) : (
              <>{t('catPage.loadMore')}</>
            )}
          </button>
        )}
        {!localHasMore && news.length > 0 && (
          <p className={styles.endMsg}>{t('catPage.endOf')} {categoryName} {t('catPage.endSuffix')}</p>
        )}
      </div>
    </div>
  );
}
