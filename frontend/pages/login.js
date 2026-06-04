import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home?auth=login');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifycontent: 'center',
      backgroundColor: '#051622',
      color: '#ffffff',
      fontFamily: 'sans-serif'
    }}>
      <p style={{ opacity: 0.7 }}>Redirecting to premium login experience...</p>
    </div>
  );
}
