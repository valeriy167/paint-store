import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Typography, Space, InputNumber, Alert, message, Modal, Form, Input } from 'antd';
import { MinusOutlined, PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCheckout = async (values) => {
    setConfirmLoading(true);
    try {
        await api.checkout(values);
        message.success('Заказ оформлен! Администратор свяжется с вами.');
        setIsModalOpen(false);
        loadCart(); // обновим корзину
    } catch (err) {
        message.error(err.message || 'Не удалось оформить заказ');
    } finally {
        setConfirmLoading(false);
    }
    };

  const loadCart = () => {
    setLoading(true);
    api.getCart()
      .then(setCart)
      .catch(err => {
        message.error(err.message);
        navigate('/login');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCart(); }, []);

  const updateQuantity = (itemId, delta) => {
    const item = cart.items.find(i => i.id === itemId);
    const newQty = Math.max(1, item.quantity + delta);
    if (newQty !== item.quantity) {
      api.updateCartItem(itemId, newQty)
        .then(setCart)
        .catch(err => message.error(err.message));
    }
  };

  const removeItem = (itemId) => {
    api.removeCartItem(itemId)
      .then(setCart)
      .catch(err => message.error(err.message));
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="ant-spin-dot"></div></div>;
  if (!cart) return null;

  return (
    <div style={{ padding: '24px 0' }}>
      {/* <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Ваша корзина
      </Title> */}

      <div style={{
          textAlign: 'center',
          marginBottom: 32,
          padding: '16px', // Отступы внутри
          borderRadius: '8px', // Скругление углов
          // Вариант 1: Полупрозрачный цвет на фоне
          background: 'rgba(255, 255, 255, 0.8)',
          // Вариант 2: Сплошной цвет (менее гармоничный с фоном сайта)
          // background: '#f0f2f5',
          // Вариант 3: Градиент
          // background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
          // Вариант 4: Белый с тенью
          // background: '#ffffff',
          // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          maxWidth: 'fit-content', // Ширина по содержимому (опционально)
          margin: '0 auto',       // Центрирование (если используешь maxWidth: 'fit-content')
          // maxWidth: '500px',      // Ограничиваем ширину (опционально)
          // margin: '0 auto',       // Центрируем
        }}>
        <Title level={2} style={{ margin: 0 }}>
          Ваша корзина
        </Title>
      </div>

      {cart.items.length === 0 ? (
        <Card>
          <Alert 
            title={<strong>Корзина пуста</strong>}  
            description="Добавьте товары на главной странице." 
            type="info" 
            showIcon 
          />
        </Card>
      ) : (
        <>
          <List
            style={{ marginTop: 32 }}
            dataSource={cart.items}
            renderItem={item => (
              <List.Item>
                <Card style={{ width: '100%' }}>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div style={{ width: 100, height: 80, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.product_image ? (
                            <img
                            src={item.product_image}
                            alt={item.product_name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <Text type="secondary" style={{ fontSize: 12 }}>img</Text>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong>{item.product_name}</Text>
                      <br />
                      <Text type="secondary">{item.product_price} ₽</Text>
                    </div>
                    <Space>
                      <Button icon={<MinusOutlined />} onClick={() => updateQuantity(item.id, -1)} />
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={qty => api.updateCartItem(item.id, qty).then(setCart)}
                        style={{ width: 60 }}
                      />
                      <Button icon={<PlusOutlined />} onClick={() => updateQuantity(item.id, 1)} />
                    </Space>
                    <Text strong>{item.total_price} ₽</Text>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeItem(item.id)}
                    />
                  </div>
                </Card>
              </List.Item>
            )}
          />

          <Card style={{ marginTop: 24, textAlign: 'right' }}>
            <Space size="large">
              <Text>Итого:</Text>
              <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
                {cart.total_price} ₽
              </Title>
            </Space>
            <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />}
                onClick={() => setIsModalOpen(true)}
                disabled={cart?.items.length === 0}
                >
                Оформить заказ
            </Button>
          </Card>
          <Modal
            title="Оформление заказа"
            open={isModalOpen}
            onOk={() => form.submit()}
            confirmLoading={confirmLoading}
            onCancel={() => setIsModalOpen(false)}
            okText="Отправить"
            cancelText="Отмена"
            >
            <Form form={form} layout="vertical" onFinish={handleCheckout}>
                <Form.Item 
                name="name" 
                label="Имя" 
                initialValue={user?.first_name || ''}
                rules={[{ required: true }]}
                >
                <Input />
                </Form.Item>
                <Form.Item 
                name="email" 
                label="Email" 
                initialValue={user?.email || ''}
                rules={[{ required: true, type: 'email' }]}
                >
                <Input />
                </Form.Item>
                <Form.Item 
                name="phone" 
                label="Телефон" 
                initialValue={user?.profile?.phone || ''}
                rules={[{ required: true }]}
                >
                <Input />
                </Form.Item>
                <Alert 
                message="Заказ будет отправлен администратору. С вами свяжутся для подтверждения."
                type="info"
                showIcon
                />
            </Form>
          </Modal>

        </>
      )}
    </div>
  );
}