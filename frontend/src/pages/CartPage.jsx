import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Typography, Space, InputNumber, Alert, message } from 'antd';
import { MinusOutlined, PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Ваша корзина
      </Title>

      {cart.items.length === 0 ? (
        <Card>
          <Alert
            message="Корзина пуста"
            description={
              <>
                <p>Добавьте товары на <a onClick={() => navigate('/')}>главной странице</a>.</p>
              </>
            }
            type="info"
            showIcon
          />
        </Card>
      ) : (
        <>
          <List
            dataSource={cart.items}
            renderItem={item => (
              <List.Item>
                <Card style={{ width: '100%' }}>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div style={{ width: 100, height: 80, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary">img</Text>
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
              style={{ marginTop: 16 }}
              onClick={() => message.info('Оформление заказа — в будущем')}
            >
              Оформить заказ
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}