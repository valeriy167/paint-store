// src/components/layout/Layout.jsx
import { Layout as AntLayout } from 'antd';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <AntLayout style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      <AntLayout.Content 
        style={{ 
          flex: 1,
          padding: '24px 16px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
          // ← НЕТ maxWidth здесь!
        }}
      >
        {children}
      </AntLayout.Content>
      <Footer />
    </AntLayout>
  );
}