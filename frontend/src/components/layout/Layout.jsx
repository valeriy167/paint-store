// src/components/layout/Layout.jsx
import { Layout as AntLayout } from 'antd';
import { useBackground } from '../../contexts/BackgroundContext'; // Импортируем хук
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  const { bgData, loading } = useBackground(); // Получаем данные из контекста
  console.log("Layout.jsx: bgData changed to", bgData); // Лог

  if (loading) {
    return <div>Загрузка фона...</div>;
  }

  const backgroundDiv = bgData ? (
    <div
      key="background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${bgData.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: `blur(${bgData.blur_amount || 0}px)`,
        // Используем backgroundSize для масштаба фона
        backgroundSize: `${(bgData.scale_factor || 1) * 100}% auto`,
        // backgroundSize: 'cover', // Альтернатива: покрыть всё, может обрезать
        zIndex: -1,
      }}
    />
  ) : null;

  return (
    <AntLayout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent', }}>
      {backgroundDiv}
      <Header />
      <AntLayout.Content
        style={{
          flex: 1,
          padding: '24px 16px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          // // background: 'transparent',
          // background: 'rgba(228, 17, 17, 0.1)', // 80% непрозрачности
          // //backgroundAttachment: 'transparent',
          // //color: 'transparent',
        }}
      >
        {children}
      </AntLayout.Content>
      <Footer />
    </AntLayout>
  );
}