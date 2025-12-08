import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, List, Space, Button, Form, Input, message, Alert } from 'antd';
import { UserOutlined, CommentOutlined, ShoppingCartOutlined, LogoutOutlined, EditOutlined, PhoneOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const handleUpdateUser = async (values) => {
    // Отправляем ТОЛЬКО разрешённые поля
    const payload = {
        first_name: values.first_name || '',
        last_name: values.last_name || '',
        email: values.email // ← email можно менять
    };
    try {
        await api.updateUser(payload);
        message.success('Личные данные обновлены');
        // Обновим данные — проще всего перезагрузить страницу
        window.location.reload();
    } catch (err) {
        const msg = err?.email?.[0] || err?.detail || 'Не удалось сохранить данные';
        message.error(msg);
    }
    };

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    // Загружаем отзывы текущего пользователя
    api.getMyReviews()
      .then(setReviews)
      .catch(err => message.error(err.message))
      .finally(() => setLoading(false));

    form.setFieldsValue({
      phone: user.profile?.phone || '',
      telegram: user.profile?.telegram || '',
    });
  }, [user, form]);

  const handleUpdateProfile = async (values) => {
    try {
      await api.updateProfile(values);
      message.success('Профиль обновлён');
      // Обновим данные в контексте
      const updated = await api.getProfile();
      // Но так как мы не передаём setProfile в контекст — просто обновим страницу
      window.location.reload(); // или: dispatch({ type: 'SET_USER', payload: updated });
    } catch (err) {
      message.error(err.message || 'Не удалось сохранить профиль');
    }
  };

  if (!user) {
    return <Alert title="Ошибка" description="Вы не авторизованы" type="error" />;
  }

  return (
    <div style={{ padding: '24px 0', maxWidth: 800, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Личный кабинет
      </Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* Основная информация (ФИО, email) */}
        <Card title={<><EditOutlined /> Личные данные</>}>
        <Form
            layout="vertical"
            onFinish={handleUpdateUser}
            initialValues={{
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || ''
            }}
        >
            <Form.Item name="first_name" label="Имя">
            <Input />
            </Form.Item>
            <Form.Item name="last_name" label="Фамилия">
            <Input />
            </Form.Item>
            <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Некорректный email' }]}
            >
            <Input />
            </Form.Item>
            <Form.Item>
            <Button type="primary" htmlType="submit">
                Сохранить личные данные
            </Button>
            </Form.Item>
        </Form>
        </Card>

        {/* Контактная информация (телефон, Telegram) */}
        <Card title={<><PhoneOutlined /> Контакты</>}>
        <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
            initialValues={{
            phone: user.profile?.phone || '',
            telegram: user.profile?.telegram || ''
            }}
        >
            <Form.Item name="phone" label="Телефон">
            <Input placeholder="+7 (999) 123-45-67" />
            </Form.Item>
            <Form.Item name="telegram" label="Telegram">
            <Input placeholder="@username" />
            </Form.Item>
            <Form.Item>
            <Button type="primary" htmlType="submit">
                Сохранить контакты
            </Button>
            </Form.Item>
        </Form>
        </Card>

        {/* Мои отзывы */}
        <Card 
          title={<><CommentOutlined /> Мои отзывы ({reviews.length})</>}
          extra={reviews.length === 0 && <Text type="secondary">Пока нет отзывов</Text>}
        >
          {loading ? (
            <div className="ant-spin-dot"></div>
          ) : reviews.length === 0 ? (
            <Text>Оставьте первый отзыв о товаре!</Text>
          ) : (
            <List
              dataSource={reviews}
              renderItem={review => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{review.product.name}</Text>
                        <Text type={review.is_approved ? 'success' : 'warning'}>
                          {review.is_approved ? 'Одобрен' : 'На модерации'}
                        </Text>
                      </Space>
                    }
                    description={
                      <>
                        <Rate disabled value={review.rating} style={{ marginRight: 8 }} />
                        {review.text}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Корзина как черновик */}
        <Card title={<><ShoppingCartOutlined /> Черновики заказов</>}>
          <Text>Ваша корзина сохраняется между сеансами. Чтобы оформить заказ — перейдите в <a onClick={() => navigate('/cart')}>корзину</a>.</Text>
        </Card>

        {/* Выход */}
        <Card>
          <Button 
            danger 
            icon={<LogoutOutlined />}
            onClick={logout}
            block
          >
            Выйти из аккаунта
          </Button>
        </Card>

      </Space>
    </div>
  );
}

function Rate({ value }) {
  return (
    <span>
      {'★'.repeat(value)}{'☆'.repeat(5 - value)}
    </span>
  );
}