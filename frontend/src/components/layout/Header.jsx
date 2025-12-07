import { Layout, Menu, Button, Space, Row, Col } from 'antd';
import { Link, useNavigate } from 'react-router-dom'; // ← useNavigate добавлен
import { 
  UserOutlined, ShoppingCartOutlined, 
  HomeOutlined, ContactsOutlined, CommentOutlined 
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;

export default function Header() {
  const navigate = useNavigate(); // ← хук навигации

  return (
    <AntHeader 
      style={{ 
        background: '#fff',
        padding: '0 24px',
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
          <div style={{ fontWeight: 'bold', fontSize: 20, color: '#1677ff' }}>
            Paint Store
          </div>
        </Col>

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
            items={[
              { key: 'home', icon: <HomeOutlined />, label: <Link to="/">Главная</Link> },
              { key: 'contacts', icon: <ContactsOutlined />, label: <Link to="/contacts">Контакты</Link> },
              { key: 'cart', icon: <ShoppingCartOutlined />, label: <Link to="/cart">Корзина</Link> },
              { key: 'reviews', icon: <CommentOutlined />, label: <Link to="/reviews">Отзывы</Link> },
            ]}
          />
        </Col>

        <Col>
          <Space size="middle">
            <Button 
              type="text" 
              icon={<UserOutlined />} 
              onClick={() => navigate('/login')}
            >
              Войти
            </Button>
            <Button 
              type="primary" 
              onClick={() => navigate('/register')}
            >
              Регистрация
            </Button>
          </Space>
        </Col>
      </Row>
    </AntHeader>
  );
}