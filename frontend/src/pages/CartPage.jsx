import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Typography, Space, InputNumber, Alert, message, Modal, Form, Input } from 'antd';
import { MinusOutlined, PlusOutlined, DeleteOutlined, ShoppingCartOutlined, FilePdfOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const cartListRef = useRef(null);

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

  // --- Функция генерации PDF ---
  const generatePDF = async () => {
    if (!cart || cart.items.length === 0) {
      message.warn('Корзина пуста. Невозможно создать PDF.');
      return;
    }

    try {
      message.info('Подготовка PDF...');

      // Ждем, пока DOM обновится, если были изменения
      await new Promise(resolve => setTimeout(resolve, 100));

      // Выбираем элемент списка товаров
      const listElement = cartListRef.current;
      if (!listElement) {
        throw new Error('Элемент списка товаров не найден');
      }

      // Используем html2canvas для создания изображения списка
      const canvas = await html2canvas(listElement, {
        scale: 1, // Можно увеличить для лучшего качества, но увеличится время
        useCORS: true, // Позволяет загружать изображения с других доменов (если CORS разрешён)
        allowTaint: true, // Альтернатива для useCORS, но менее безопасна
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Ширина A4 в мм
      const pageHeight = 297; // Высота A4 в мм
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Если изображение больше одной страницы, добавляем следующие страницы
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Добавляем итоговую цену в конец PDF
      const finalY = pdf.internal.getNumberOfPages() * pageHeight - 20; // Примерное расположение внизу последней страницы
      pdf.text(`Итого: ${cart.total_price} ₽`, 10, finalY);

      // Сохраняем PDF
      pdf.save(`Корзина_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);
      message.success('PDF успешно создан и сохранён!');
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      message.error('Не удалось создать PDF. Проверьте консоль.');
    }
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
        <Card style={{ marginTop: 32 }}>
          <Alert 
            title={<strong>Корзина пуста</strong>}  
            description="Добавьте товары на главной странице." 
            type="info" 
            showIcon 
          />
        </Card>
      ) : (
        <>
        <div ref={cartListRef}>
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

          </div>

          <Card style={{ marginTop: 24, }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Левая часть - кнопка PDF */}
              <Space size="large">
                <Button
                    type="default"
                    size="large"
                    icon={<FilePdfOutlined />}
                    onClick={generatePDF}
                    disabled={cart?.items.length === 0}
                    >
                    Сохранить в PDF
                </Button>
              </Space>

              {/* Правая часть - итого, цена и кнопка оформить заказ */}
              <Space size="middle">
                <Text>Итого:</Text>
                <Title level={3} style={{ margin: '0 10px 0 0', color: '#1677ff' }}>  
                  {cart.total_price} ₽
                </Title>
                <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    disabled={cart?.items.length === 0}
                    >
                    Оформить заказ
                </Button>
              </Space>
            </div>
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