import { Layout, Menu, Button, Space, Row, Col, Avatar, Drawer } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserOutlined, ShoppingCartOutlined,
  HomeOutlined, ContactsOutlined, CommentOutlined,
  LogoutOutlined, DashboardOutlined, SettingFilled,
  SettingOutlined, MenuOutlined, CloseOutlined, MailOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

const { Header: AntHeader } = Layout;

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- Подготовим элементы для мобильного меню ---
  const baseMenuItems = [
    { key: 'home', icon: <HomeOutlined />, label: <Link to="/">Главная</Link> },
    { key: 'cart', icon: <ShoppingCartOutlined />, label: <Link to="/cart">Корзина</Link> },
    { key: 'reviews', icon: <CommentOutlined />, label: <Link to="/reviews">Отзывы</Link> },
    { key: 'contacts', icon: <MailOutlined />, label: <Link to="/contacts">Контакты</Link> },
  ];

  let mobileMenuItems = [...baseMenuItems];

  if (user) {
    mobileMenuItems.push(
      { type: 'divider' }, // Разделитель
      { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">Профиль</Link> },
      ...(user.profile?.is_moderator ? [{ key: 'admin-panel', icon: <SettingOutlined />, label: <Link to="/admin-panel">Админ-панель</Link> }] : []),
      { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', onClick: logout }, // onClick вместо отдельной кнопки
    );
  } else {
    mobileMenuItems.push(
      { type: 'divider' }, // Разделитель
      { key: 'login', icon: <UserOutlined />, label: <Link to="/login">Войти</Link> },
      { key: 'register', icon: <UserOutlined />, label: <Link to="/register">Регистрация</Link> },
    );
  }

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Row
        justify="space-between"
        align="middle"
        style={{
          width: '100%',
          maxWidth: '1600px',
          margin: '0 auto'
        }}
      >
        <Col>
          <Link to="/" style={{ fontWeight: 'bold', fontSize: 20, color: '#1677ff' }}>
            Кузнечные краски Москвы
          </Link>
        </Col>

        {/* Desktop menu */}
        {!isMobile ? (
          <Col flex="1" style={{ margin: '0 24px' }}>
            <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={[]}
              style={{
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                minWidth: 0
              }}
              items={baseMenuItems} // <-- Используем только основные пункты
            />
          </Col>
        ) : null}

        {/* Desktop auth buttons */}
        {!isMobile && ( // <-- Отображаем кнопки только на десктопе
          <Col>
            {user ? (
              <Space size="middle">
                {user.profile?.is_moderator && (
                  <Button type="text" onClick={() => navigate('/admin-panel')} icon={<SettingOutlined />} />
                )}
                <Link to="/profile">
                  <Avatar icon={<UserOutlined />} size="small" />
                </Link>
                <Button type="text" icon={<LogoutOutlined />} onClick={logout} size="small">
                  Выход
                </Button>
              </Space>
            ) : (
              <Space size="middle">
                <Button type="text" icon={<UserOutlined />} onClick={() => navigate('/login')} size="small">
                  Войти
                </Button>
                <Button type="primary" onClick={() => navigate('/register')} size="small">
                  Регистрация
                </Button>
              </Space>
            )}
          </Col>
        )}

        {/* Mobile menu button */}
        {isMobile && (
          <Col>
            <Button
              type="text"
              icon={
                mobileMenuOpen ?
                  <CloseOutlined style={{ fontSize: 18 }} /> :
                  <MenuOutlined style={{ fontSize: 18 }} />
              }
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ padding: 0, height: '100%' }}
            />
          </Col>
        )}
      </Row>

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          title="Меню"
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={240}
        >
          <Menu
            mode="inline"
            items={mobileMenuItems} // <-- Используем расширенный список для мобильного меню
            onClick={(e) => {
                // Закрываем меню при клике на пункт (кроме разделителя)
                if (e.key !== 'divider') {
                    setMobileMenuOpen(false);
                }
            }}
          />
        </Drawer>
      )}
    </AntHeader>
  );
}