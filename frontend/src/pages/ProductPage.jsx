import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Alert, Button, message, Space, List, Rate, Divider } from 'antd';
import { ShoppingCartOutlined, HomeOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Title, Text } = Typography;

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (!productId) {
      navigate('/'); // Если ID не передан, вернуть на главную
      return;
    }
    setLoading(true);
    setError(null);

    api.getProductById(productId) 
      .then(data => {
        setProduct(data);
        setLoading(false);
        loadReviews(data.id);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId, navigate]);

  const loadReviews = (productId) => {
    setLoadingReviews(true);
    api.getReviewsByProductId(productId)
      .then(data => {
        setReviews(data);
        if (data.length > 0) {
          const sum = data.reduce((acc, review) => acc + review.rating, 0);
          const avg = sum / data.length;
          // Округляем до 1 знака после запятой
          setAverageRating(parseFloat(avg.toFixed(1)));
        } else {
          setAverageRating(0); // Если отзывов нет, средняя оценка 0
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки отзывов:', err);
        setReviews([]); // Просто отображаем пустой список
        setAverageRating(0); // В случае ошибки тоже 0
      })
      .finally(() => {
        setLoadingReviews(false);
      });
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;
  if (error) return <Alert title="Ошибка загрузки товара" description={error} type="error" showIcon style={{ margin: 24 }} />;

  if (!product) {
    return <Alert title="Товар не найден" type="warning" showIcon style={{ margin: 24 }} />;
  }

  const primaryImageUrl = product.images && product.images.length > 0 ? product.images[0].image : null;

  return (
    <div style={{ padding: '24px 0' }}>
      <Card
        style={{
          maxWidth: 800,
          margin: '0 auto',
          borderRadius: 8,
        }}
        cover={
          <div style={{
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {primaryImageUrl ? (
              <img
                alt={product.name}
                src={primaryImageUrl}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Text type="secondary">Нет изображения</Text>
            )}
          </div>
        }
      >
        <Title level={2} style={{ marginBottom: 8 }}>{product.name}</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>{product.category}</Text>
        <div style={{ marginTop: 16 }}>
          <Title level={4}>Описание</Title>
          <Text style={{ fontSize: 16, lineHeight: 1.8 }}>{product.description}</Text>
        </div>
        <div style={{ marginTop: 24 }}>
          <Space size="large" style={{ justifyContent: 'space-between', width: '100%' }}>
            <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
              Цена уточняется при заказе
            </Title>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              size="large"
              onClick={() => {
                api.addToCart(product.id)
                  .then(() => {
                    message.success('Товар добавлен в корзину');
                  })
                  .catch(err => message.error(err.message || 'Не удалось добавить в корзину'));
              }}
            >
              В корзину
            </Button>
          </Space>
        </div>

        {/* --- Блок с отзывами --- */}
        <Divider style={{ margin: '24px 0' }} />
        <Title level={4} style={{ marginBottom: 16 }}>Отзывы</Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Rate disabled value={averageRating} /> 
            <Text type="secondary" style={{ marginLeft: 8, marginBottom: 10}}>
                {averageRating > 0 ? averageRating.toFixed(1) : 'Нет оценок'} ({reviews.length})
            </Text>
        </div>
        {loadingReviews ? (
          <Spin size="small" />
        ) : reviews.length > 0 ? (
          <List
            itemLayout="vertical"
            size="small"
            dataSource={reviews}
            renderItem={review => (
              <List.Item key={review.id}>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{review.user.username}</span>
                      <Rate disabled value={review.rating} />
                    </div>
                  }
                  description={`Оставлен: ${new Date(review.created_at).toLocaleDateString()}`}
                />
                <div>{review.text}</div>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">Пока нет отзывов.</Text>
        )}
      </Card>
    </div>
  );
}