import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import AuthModal from '../components/AuthModal';
import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const useDefaultLayout = !Component.noLayout && router.pathname !== '/' && router.pathname !== '/login' && router.pathname !== '/signup';
  const show3DBackground = Component.show3DBackground ?? false;
  const title = Component.title;

  const pageContent = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.asPath}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', margin: 0, padding: 0 }}
      >
        <Component {...pageProps} />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <LanguageProvider>
      <AuthProvider>
        <div style={{ width: '100%', margin: 0, padding: 0 }}>
          {useDefaultLayout ? (
            <Layout title={title} show3DBackground={show3DBackground}>
              {pageContent}
            </Layout>
          ) : (
            pageContent
          )}
          <AuthModal />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default MyApp;
