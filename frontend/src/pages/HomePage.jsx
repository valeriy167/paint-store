import { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Alert, message } from 'antd';
import ProductCard from '../components/ui/ProductCard';
import { api } from '../services/api';

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
  if (error) return <Alert message="Ошибка загрузки товаров" description={error} type="error" showIcon style={{ margin: 24 }} />;

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Каталог товаров
      </Title>

      {products.length === 0 ? (
        <Alert message="Нет товаров" description="Скоро появятся новые позиции" type="info" showIcon style={{ margin: 24 }} />
      ) : (
        <Row gutter={[24, 32]} justify="center">
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