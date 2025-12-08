import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { App as AntdApp } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import 'antd/dist/reset.css';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const { defaultAlgorithm, darkAlgorithm } = theme;

function ThemeConfigWrapper({ children }) {
  const { isDark } = useTheme();
  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemeConfigWrapper>
          <AntdApp>
            <AuthProvider>
              <App />
            </AuthProvider>
          </AntdApp>
        </ThemeConfigWrapper>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);