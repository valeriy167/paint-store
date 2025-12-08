// src/components/layout/Layout.jsx
import { Layout as AntLayout } from 'antd';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { api } from "../../services/api"; // Путь скорректирован

export default function Layout({ children }) {
  const [bgData, setBgData] = useState(null);
  const [loading, setLoading] = useState(true); // Добавим состояние загрузки

  useEffect(() => {
    const fetchBackgroundAndSettings = async () => {
      try {
        const response = await api.getActiveBackgroundImage();
        if (response.image) {
          setBgData(response); // Сохраняем все данные (image, blur_amount, scale_factor)
        } else {
          setBgData(null);
        }
      } catch (error) {
        console.error('Ошибка загрузки фона в Layout:', error);
        setBgData(null); // В случае ошибки не показываем фон
      } finally {
        setLoading(false); // Завершаем загрузку
      }
    };

    fetchBackgroundAndSettings();
  }, []);

  // Рендерим фоновый div, если данные загружены
  const backgroundDiv = bgData ? (
    <div
      key="background" // Ключ помогает React понять, что элемент изменился
      style={{
        position: 'fixed', // Фиксируем фон
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${bgData.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        // Применяем параметры с бэкенда
        filter: `blur(${bgData.blur_amount || 0}px)`,
        // backgroundSize для масштаба: используем проценты или 'cover'
        // 'cover' масштабирует изображение, чтобы оно покрывало весь контейнер, возможно обрезая края
        // Проценты масштабируют само изображение, что может оставить пустое пространство
        // Выберем проценты, как в SettingsTab
        backgroundSize: `${(bgData.scale_factor || 1) * 100}% auto`,
        zIndex: -1, // Помещаем позади остального контента
      }}
    />
  ) : null;

  if (loading) {
    // Можно вернуть спиннер или заглушку, пока данные фона загружаются
    return <div>Загрузка фона...</div>; // Или Ant Design Spin
  }

  return (
    <AntLayout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {backgroundDiv} {/* Вставляем фоновый div */}
      <Header />
      <AntLayout.Content
        style={{
          flex: 1,
          padding: '24px 16px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </AntLayout.Content>
      <Footer />
    </AntLayout>
  );
}