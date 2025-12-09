import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Spin, Alert, message } from 'antd';
import ProductCard from '../components/ui/ProductCard';
import { api } from '../services/api';

const { Title } = Typography;

export default function ManufacturerPage() {
  const { manufacturerId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [manufacturer, setManufacturer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!manufacturerId) {
        navigate('/'); // Если ID не передан, вернуть на главную
        return;
    }
    setLoading(true);
    setError(null);

    // Загружаем товары по производителю
    api.getProductsByManufacturer(manufacturerId)
      .then(data => {
        setProducts(data);
        // Также загрузим данные самого производителя для отображения
        // Можно сделать отдельный запрос или вернуть производителя вместе с товаром
        // Пока просто возьмём из первого товара, если он есть
        if (data.length > 0 && data[0].manufacturer) {
            setManufacturer(data[0].manufacturer);
        } else {
            // Если товары не найдены, но ID валидный, можно попробовать загрузить саму сущность производителя
            // Это требует отдельного API endpoint или изменения логики
            // Для простоты, если товары не найдены, просто покажем заголовок с ID
            setManufacturer({ id: manufacturerId, name: `Производитель ${manufacturerId}` });
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [manufacturerId, navigate]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;
  if (error) return <Alert title="Ошибка загрузки товаров" description={error} type="error" showIcon style={{ margin: 24 }} />;

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Заголовок с информацией о производителе */}
      {manufacturer && (
        <div style={{
            textAlign: 'center',
            marginBottom: 32,
            padding: '16px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.8)',
            maxWidth: 'fit-content',
            margin: '0 auto',
          }}>
          <Title level={2} style={{ margin: 0 }}>
            {manufacturer.name}
          </Title>
          {manufacturer.logo && (
            <div style={{ marginTop: 16 }}>
              <img
                src={manufacturer.logo}
                alt={manufacturer.name}
                style={{ maxHeight: '100px', objectFit: 'contain' }}
              />
            </div>
          )}
          {manufacturer.description && (
            <div style={{ marginTop: 16 }}>
              <Typography.Text type="secondary">{manufacturer.description}</Typography.Text>
            </div>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <Alert title="Нет товаров" description="У этого производителя пока нет товаров в продаже." type="info" showIcon style={{ margin: 24 }} />
      ) : (
        <Row
          gutter={[24, 32]}
          justify="center"
        >
          {products.map(product => (
            <Col
              key={product.id}
              xs={24}
              sm={12}
              md={12}
              lg={8}
              xl={6}
              xxl={4.8}
            >
              <ProductCard
                product={product}
                onAddToCart={(productId) => {
                  api.addToCart(productId)
                    .then(() => {
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