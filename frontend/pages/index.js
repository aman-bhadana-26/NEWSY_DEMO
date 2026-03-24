/**
 * Apple-style scroll storytelling landing page for NewsyTech.
 * 6 cinematic scenes driven by Framer Motion scroll hooks + R3F particles.
 */
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { newsAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import { NewsCardSkeleton } from '../components/Skeleton';
import styles from '../styles/Landing.module.css';

/* ── Lazy-load R3F canvas (no SSR) ─────────────────────────── */
const ParticleLayer = dynamic(() => import('../components/ParticleLayer'), {
  ssr: false,
  loading: () => null,
});

/* ── Lazy-load Aurora background (no SSR) ──────────────────── */
const AuroraBg = dynamic(() => import('../components/Aurora'), {
  ssr: false,
  loading: () => null,
});



/* ── Framer variants ────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 44, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.11 } },
};

/* ══════════════════════════════════════════════════════════════
   SCENE 1 – CINEMATIC HERO  (sticky, 200vh)
══════════════════════════════════════════════════════════════ */
function HeroScene() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  /* Copy: drifts up and fades as user scrolls */
  const copyY       = useTransform(scrollYProgress, [0, 1],    ['0%', '-24%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7],  [1, 0]);


  return (
    <div ref={containerRef} style={{ height: '100vh', position: 'relative' }}>
      <div className={styles.heroSticky}>

        {/* ── Navbar floating over aurora ───────────────────── */}
        <div className={styles.heroNavbar}>
          <Navbar />
          <div className={styles.heroNavbarGlow} />
        </div>

        {/* ── Aurora background ─────────────────────────────── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.72 }}>
          <AuroraBg
            colorStops={['#1BA098', '#051622', '#DEB992']}
            blend={0.55}
            amplitude={1.1}
            speed={0.7}
          />
        </div>

        {/* ── R3F Particles (depth layer on top of Aurora) ──── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.45 }}>
          <ParticleLayer />
        </div>

        {/* ── Ambient glow orbs ─────────────────────────────── */}
        <div className={styles.glowOrbRight} />
        <div className={styles.glowOrbLeft} />

        {/* ── Inner grid ────────────────────────────────────── */}
        <div className={styles.heroGrid}>

          {/* LEFT: Headline copy */}
          <motion.div
            className={styles.heroCopy}
            style={{ y: copyY, opacity: copyOpacity }}
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow badge */}
            <motion.div variants={fadeUp} className={styles.eyebrow}>
              <span className={styles.liveDot} />
              <span className={styles.eyebrowText}>Technology Intelligence Platform</span>
            </motion.div>

            {/* H1 — word-by-word blur-in */}
            <h1 className={styles.heroH1}>
              {['Technology', 'Intelligence', 'for', 'the', 'Modern', 'World.'].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 36, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.78, delay: 0.3 + i * 0.10, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'inline-block',
                    marginRight: '0.28em',
                    ...(i >= 2 ? {
                      background: 'linear-gradient(105deg, #1BA098, #24c9b8 40%, #DEB992)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    } : {
                      color: '#eef2f4',
                      WebkitTextFillColor: '#eef2f4',
                    }),
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subtext */}
            <motion.p variants={fadeUp} className={styles.heroSub}>
              AI, startups, cybersecurity, software and gadget news —{' '}
              <span style={{ color: '#6a8a9a' }}>curated for innovators.</span>
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className={styles.heroBtns}>
              <Link href="/home" className={styles.btnPrimary}>Explore News →</Link>
              <Link href="/trending" className={styles.btnSecondary}>View Trending</Link>
            </motion.div>

          </motion.div>

        </div>

        {/* ── Scroll hint ────────────────────────────────────── */}
        <motion.div
          className={styles.scrollHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={{ opacity: copyOpacity }}
        >
          <span className={styles.scrollLabel}>Scroll</span>
          <div className={styles.scrollChevron} />
        </motion.div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   SCENE 2 – PLATFORM INTRODUCTION
══════════════════════════════════════════════════════════════ */
function PlatformScene() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-100px' });
  const WORDS = ['Built', 'for', 'the', 'Next', 'Generation', 'of', 'Innovators.'];
  const ACCENT_IDX = new Set([3, 4, 5]);

  return (
    <section className={styles.platformSection}>
      <div className={styles.dividerTop} />

      {/* Eyebrow */}
      <motion.div
        className={styles.eyebrowRow}
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-80px' }}
        transition={{ duration: 0.7 }}
      >
        <span className={styles.eyebrowLine} />
        <span className={styles.eyebrowLabel}>Our Mission</span>
        <span className={styles.eyebrowLine} />
      </motion.div>

      {/* Word-by-word headline */}
      <div ref={ref} className={styles.platformHeadline}>
        {WORDS.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 36, filter: 'blur(10px)' }}
            animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.75, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-block',
              marginRight: '0.28em',
              ...(ACCENT_IDX.has(i) ? {
                background: 'linear-gradient(105deg, #1BA098, #24c9b8 40%, #DEB992)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              } : {}),
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* Three pillars */}
      <div className={styles.pillarsRow}>
        {[
          { label: 'Real-time',        desc: 'Updated every 15 min from 1,000+ global sources',    color: '#1BA098' },
          { label: 'AI-Curated',       desc: 'Machine learning filters noise, surfaces signal',     color: '#a78bfa' },
          { label: 'Editorial Quality',desc: 'Human editorial oversight ensures accuracy',          color: '#DEB992' },
        ].map((p, i) => (
          <motion.div
            key={p.label}
            className={styles.pillar}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.2 + i * 0.13 }}
          >
            <div className={styles.pillarLine} style={{ background: p.color }} />
            <div className={styles.pillarLabel}>{p.label}</div>
            <p className={styles.pillarDesc}>{p.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className={styles.dividerBottom} />
    </section>
  );
}


/* ══════════════════════════════════════════════════════════════
   SCENE 4 – TRENDING NEWS VISUALIZATION
══════════════════════════════════════════════════════════════ */
function TrendingScene({ articles }) {
  const trackRef   = useRef(null);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollLeft = useRef(0);

  const detectCat = (a) => {
    const t = `${a.title} ${a.description || ''}`.toLowerCase();
    if (/\bai\b|gpt|machine learning|openai/.test(t)) return { label: 'AI',       color: '#a78bfa', bg: 'rgba(167,139,250,' };
    if (/security|hack|breach|cyber/.test(t))          return { label: 'SECURITY', color: '#f87171', bg: 'rgba(248,113,113,' };
    if (/startup|funding|unicorn/.test(t))              return { label: 'STARTUP',  color: '#DEB992', bg: 'rgba(222,185,146,' };
    if (/software|code|developer/.test(t))              return { label: 'SOFTWARE', color: '#60a5fa', bg: 'rgba(96,165,250,'  };
    return { label: 'TECH', color: '#1BA098', bg: 'rgba(27,160,152,' };
  };

  const buildUrl = (a) => {
    const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `/article/${encodeURIComponent(slug)}?data=${encodeURIComponent(JSON.stringify({
      title: a.title, description: a.description, content: a.content,
      author: a.author, source: a.source?.name || 'Unknown',
      publishedAt: a.publishedAt, url: a.url, urlToImage: a.urlToImage,
    }))}`;
  };

  if (!articles || articles.length === 0) return (
    <section className={styles.trendingSection}>
      <div className={styles.sectionInner}>
        <div style={{ display: 'flex', gap: 20, overflow: 'hidden', padding: '20px 0' }}>
          {[0,1,2,3].map(i => <div key={i} style={{ minWidth: 280, flex: '0 0 280px' }}><NewsCardSkeleton /></div>)}
        </div>
      </div>
    </section>
  );

  return (
    <section className={styles.trendingSection}>
      <div className={styles.sectionInner}>
        {/* Header */}
        <motion.div
          className={styles.trendingHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className={styles.sectionEyebrow}>
              <span className={styles.eyebrowLine} />
              <span className={styles.sectionEyebrowText}>🔥 Trending Now</span>
            </div>
            <h2 className={styles.sectionH2}>
              What&apos;s{' '}
              <span className={styles.gradientText}>Hot</span>{' '}Right Now
            </h2>
          </div>
          <a href="/trending" className={styles.viewAllLink}>View All →</a>
        </motion.div>

        {/* Draggable card track */}
        <div
          ref={trackRef}
          className={styles.trendingTrack}
          onMouseDown={(e) => {
            isDragging.current = true;
            startX.current     = e.pageX - trackRef.current.offsetLeft;
            scrollLeft.current = trackRef.current.scrollLeft;
            trackRef.current.style.cursor = 'grabbing';
          }}
          onMouseMove={(e) => {
            if (!isDragging.current) return;
            e.preventDefault();
            const x = e.pageX - trackRef.current.offsetLeft;
            trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.3;
          }}
          onMouseUp={() => { isDragging.current = false; if (trackRef.current) trackRef.current.style.cursor = 'grab'; }}
          onMouseLeave={() => { isDragging.current = false; if (trackRef.current) trackRef.current.style.cursor = 'grab'; }}
        >
          {articles.slice(0, 10).map((a, i) => {
            const cat  = detectCat(a);
            const url  = buildUrl(a);
            const mins = Math.round((Date.now() - new Date(a.publishedAt)) / 60000);
            const ago  = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.round(mins / 60)}h ago` : `${Math.round(mins / 1440)}d ago`;

            return (
              <motion.a
                key={a.url + i}
                href={url}
                className={styles.trendingCard}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-30px' }}
                transition={{ duration: 0.62, delay: Math.min(i, 4) * 0.07 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform    = 'translateY(-9px)';
                  e.currentTarget.style.borderColor  = 'rgba(27,160,152,0.35)';
                  e.currentTarget.style.boxShadow    = '0 18px 52px rgba(0,0,0,0.55), 0 0 28px rgba(27,160,152,0.10)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform    = 'translateY(0)';
                  e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow    = 'none';
                }}
              >
                {/* Image */}
                <div className={styles.tCardImg}>
                  {a.urlToImage ? (
                    <img
                      src={a.urlToImage}
                      alt={a.title}
                      onError={(e) => { e.target.style.display = 'none'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseEnter={(e) => { e.target.style.transform = 'scale(1.07)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                    />
                  ) : (
                    <div className={`${styles.tCardImgSkeleton}`}>
                      <span style={{ fontSize: '2rem', opacity: 0.12 }}>📰</span>
                    </div>
                  )}
                  <div className={styles.tCardImgOverlay} />
                  <div
                    className={styles.tCardBadge}
                    style={{
                      background: `${cat.bg}0.2)`,
                      color: cat.color,
                      border: `1px solid ${cat.bg}0.35)`,
                    }}
                  >
                    {cat.label}
                  </div>
                </div>

                {/* Content */}
                <div className={styles.tCardBody}>
                  <p className={styles.tCardTitle}>{a.title}</p>
                  <span className={styles.tCardTime}>{ago}</span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SCENE 5 – VISION STATEMENT
══════════════════════════════════════════════════════════════ */
function VisionScene() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale         = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [0.86, 1, 1, 0.92]);
  const opacity       = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0,    1, 1, 0   ]);
  const letterSpacing = useTransform(scrollYProgress, [0, 0.3],            ['-0.04em', '-0.015em']);

  return (
    <section ref={ref} className={styles.visionSection}>
      <div className={styles.visionGlow} />

      <motion.div style={{ scale, opacity, maxWidth: '940px', textAlign: 'center' }}>
        {/* Eyebrow */}
        <motion.div
          className={styles.eyebrowRow}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7 }}
          style={{ justifyContent: 'center', marginBottom: '42px' }}
        >
          <span className={styles.eyebrowLine} style={{ background: '#DEB992' }} />
          <span className={styles.eyebrowLabel} style={{ color: '#DEB992' }}>Our Vision</span>
          <span className={styles.eyebrowLine} style={{ background: '#DEB992' }} />
        </motion.div>

        <motion.h2 className={styles.visionH2} style={{ letterSpacing }}>
          NewsyTech delivers the most important{' '}
          <span className={styles.gradientText}>technology insights</span>{' '}
          from around the world.
        </motion.h2>

        <motion.p
          className={styles.visionSub}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.35 }}
        >
          Join thousands of professionals who trust NewsyTech to stay ahead of
          the curve in AI, cybersecurity, startups, and emerging technologies.
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SCENE 6 – FINAL CTA
══════════════════════════════════════════════════════════════ */
function CTAScene() {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaDivider} />
      <div className={styles.ctaGlow} />

      <motion.div
        className={styles.ctaInner}
        initial={{ opacity: 0, y: 44 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-60px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Eyebrow */}
        <div className={styles.eyebrowRow} style={{ justifyContent: 'center', marginBottom: '26px' }}>
          <span className={styles.eyebrowLine} style={{ background: '#DEB992' }} />
          <span className={styles.eyebrowLabel} style={{ color: '#DEB992' }}>Stay Informed</span>
          <span className={styles.eyebrowLine} style={{ background: '#DEB992' }} />
        </div>

        {/* Headline */}
        <h2 className={styles.ctaH2}>
          Explore the Future of{' '}
          <span className={styles.gradientText}>Technology.</span>
        </h2>

        {/* Body copy */}
        <p className={styles.ctaSub}>
          Join thousands of professionals who rely on NewsyTech for crisp,
          curated, real-time technology news from around the globe.
        </p>

        {/* Buttons */}
        <div className={styles.ctaBtns}>
          <Link href="/home" className={styles.btnPrimary}>Explore News →</Link>
          <Link href="/trending" className={styles.btnSecondary}>View Trending</Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    newsAPI.getNews('all', 1, 10)
      .then(d => setArticles(d?.articles || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>NewsyTech — Technology Intelligence for the Modern World</title>
        <meta name="description" content="AI, Startups, Software, Gadgets and Cybersecurity news — curated daily for innovators." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div id="read-progress" />

      <div className={styles.page}>
        <HeroScene />
        <PlatformScene />

        <TrendingScene articles={articles} />
        <VisionScene />
        <CTAScene />
      </div>
    </>
  );
}
