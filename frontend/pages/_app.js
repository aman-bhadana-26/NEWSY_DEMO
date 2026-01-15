import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div style={{ width: '100%', margin: 0, padding: 0 }}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default MyApp;
