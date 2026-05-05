import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div style={{ width: '100%', margin: 0, padding: 0 }}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default MyApp;
