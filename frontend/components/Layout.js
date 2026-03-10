import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TopUtilityBar from './TopUtilityBar';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

/* Selector that targets every animated element */
const ANIM_SEL = [
  '.anim-fade-up',
  '.anim-fade-left',
  '.anim-fade-right',
  '.anim-scale',
  '.anim-slide',
  '.anim-flip',
].join(', ');

const Layout = ({ children, title = 'NEWSY TECH - Latest Technology News' }) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    let io;   // IntersectionObserver  — plays / resets animations
    let mo;   // MutationObserver     — picks up dynamically-added elements

    /* ── attach a single element to the IO ── */
    const watch = (el) => {
      if (io) io.observe(el);
    };

    /* ── main setup ── */
    const setup = () => {
      /* tear down previous observers */
      if (io) io.disconnect();
      if (mo) mo.disconnect();

      /* ── IntersectionObserver ──────────────────────────
         threshold: 0   → fires the instant ANY part of the
                          element enters or leaves viewport
         rootMargin top → pre-trigger slightly above viewport
                          so fast scrollers never see a flash
         rootMargin bot → small negative so elements need to
                          travel a bit into view before playing
      ───────────────────────────────────────────────────── */
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');    /* play  */
            } else {
              entry.target.classList.remove('in-view'); /* reset */
            }
            /* no unobserve() → animations repeat on every scroll pass */
          });
        },
        { threshold: 0, rootMargin: '60px 0px -20px 0px' }
      );

      /* observe everything already in the DOM */
      document.querySelectorAll(ANIM_SEL).forEach(watch);

      /* ── MutationObserver ───────────────────────────────
         Watches for elements React adds AFTER the initial
         render — e.g. carousel rotations, lazy-loaded cards,
         route-driven content. Hands each new anim element
         straight to the IO so it is never missed.
      ───────────────────────────────────────────────────── */
      mo = new MutationObserver((mutations) => {
        mutations.forEach((mut) => {
          mut.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return; // skip text / comment nodes
            /* the node itself might be animated */
            if (node.matches && node.matches(ANIM_SEL)) watch(node);
            /* or one of its descendants */
            if (node.querySelectorAll) {
              node.querySelectorAll(ANIM_SEL).forEach(watch);
            }
          });
        });
      });

      mo.observe(document.body, { childList: true, subtree: true });
    };

    /* Run immediately on first paint, then re-check after React settles */
    setup();
    const t = setTimeout(setup, 150);

    return () => {
      clearTimeout(t);
      if (io) io.disconnect();
      if (mo) mo.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Stay updated with the latest technology news covering AI, startups, software, gadgets, and cybersecurity." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="" />
      </Head>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        margin: 0,
        padding: 0,
      }}>
        <TopUtilityBar />
        <Navbar />
        <main style={{
          flex: 1,
          width: '100%',
          margin: 0,
          padding: 0,
        }}>
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
};

export default Layout;
