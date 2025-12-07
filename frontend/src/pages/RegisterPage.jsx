import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Title } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.register(values);
      message.success('Регистрация прошла успешно!');
      navigate('/login');
    } catch (err) {
      console.error('Ошибка регистрации:', err);
        alert(
            'Данные: ' + JSON.stringify(values, null, 2) + '\n\n' +
            'Ответ сервера: ' + JSON.stringify(err, null, 2)
        );
        message.error('Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ width: 400, borderRadius: 8 }} title={
        <Title level={3} style={{ margin: 0 }}>Регистрация</Title>
      }>
        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Введите логин' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Логин (латиница)" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item
            name="password_confirm"
            label="Подтвердите пароль"
            rules={[
                { required: true, message: 'Подтвердите пароль' },
                ({ getFieldValue }) => ({
                validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                    }
                    return Promise.reject(new Error('Пароли не совпадают'));
                },
                }),
            ]}
            >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Введите телефон' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+7 (999) 123-45-67" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <a onClick={() => navigate('/login')}>Уже есть аккаунт?</a>
          </div>
        </Form>
      </Card>
    </div>
  );
}