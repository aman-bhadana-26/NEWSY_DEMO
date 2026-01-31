import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, title = 'NEWSY TECH - Latest Technology News' }) => {
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
        padding: 0
      }}>
        <Navbar />
        <main style={{ 
          flex: 1,
          width: '100%',
          margin: 0,
          padding: 0
        }}>{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
