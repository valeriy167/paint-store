import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext'; // ← только он нужен

const { Title } = Typography;

export default function LoginPage() {
  const { login } = useAuth(); // login из контекста!
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Используем login из контекста — он вызывает setUser()
      await login(values);
      message.success('Вход выполнен!');
      navigate('/');
    } catch (err) {
      // err — строка из AuthContext (например, "Неверный логин или пароль")
      message.error(err.message || err || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ width: 400, borderRadius: 8 }} title={
        <Title level={3} style={{ margin: 0 }}>Вход</Title>
      }>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ username: 'hello', password: '123' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Введите логин или email' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Логин или email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Войти
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <a onClick={() => navigate('/register')}>Регистрация</a>
          </div>
        </Form>
      </Card>
    </div>
  );
}