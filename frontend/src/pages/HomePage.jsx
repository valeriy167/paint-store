import { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Alert, message } from 'antd';
import ProductCard from '../components/ui/ProductCard';
import { api } from '../services/api';
import { FORMAT_RGB } from 'antd/es/color-picker/interface';

const { Title } = Typography;

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;
  if (error) return <Alert title="Ошибка загрузки товаров" description={error} type="error" showIcon style={{ margin: 24 }} />;

  return (
    <div style={{ padding: '24px 0' }}>
      {/* <Title level={2} style={{ textAlign: 'center', marginBottom: 32, background: 'fff' }}>
        Каталог товаров
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
          Каталог товаров
        </Title>
      </div>

      {products.length === 0 ? (
        <Alert title="Нет товаров" description="Скоро появятся новые позиции" type="info" showIcon style={{ margin: 24 }} />
      ) : (
        <Row 
          gutter={[24, 32]} 
          justify="center"
          style={{ marginTop: 32 }}
        >
          {products.map(product => (
            <Col 
              key={product.id}
              xs={24}      // 1 колонка (100%)
              sm={12}      // 2 колонки (~50%)
              md={12}      // 2 колонки
              lg={8}       // 3 колонки (~33%)
              xl={6}       // 4 колонки (~25%)
              xxl={4.8}    // 5 колонок (~20%) — 24 / 5 = 4.8
            >
              <ProductCard 
                product={product}
                onAddToCart={(productId) => {
                  api.addToCart(productId)
                    .then(() => {
                      // Опционально: обновить корзину в хедере 
                      // или просто показать уведомление
                      message.success('Товар добавлен в корзину');
                    })
                    .catch(err => message.error(err.message || 'Не удалось добавить в корзину'));
                }}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}