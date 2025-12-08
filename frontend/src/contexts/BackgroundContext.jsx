// src/contexts/BackgroundContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  const [bgData, setBgData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveBackground = async () => {
    console.log("BackgroundProvider: Fetching active background..."); // Лог
    try {
      const response = await api.getActiveBackgroundImage();
      console.log("BackgroundProvider: Received data:", response); // Лог
      if (response.image) {
        setBgData(response);
      } else {
        setBgData(null);
      }
    } catch (error) {
      console.error('Ошибка загрузки фона в BackgroundProvider:', error);
      setBgData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("BackgroundProvider: Initial fetch on mount"); // Лог
    fetchActiveBackground();
  }, []);

  const refreshBackground = () => {
    console.log("BackgroundProvider: Refresh called"); // Лог
    setLoading(true); // Устанавливаем загрузку при обновлении
    fetchActiveBackground();
  };

  return (
    <BackgroundContext.Provider value={{ bgData, loading, refreshBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};