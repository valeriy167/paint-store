import { useState, useEffect } from 'react';
import { Card, List, Rate, Typography, message, Spin, Alert, Select } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { CommentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем только одобренные отзывы
  useEffect(() => {
    api.getReviews()
      .then(setReviews)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin style={{ display: 'block', margin: '60px auto' }} />;
  if (error) return <Alert message="Ошибка" description={error} type="error" style={{ margin: 24 }} />;

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Отзывы покупателей
      </Title>

      {/* Форма отзыва (только для авторизованных) */}
      {user ? <ReviewForm onNewReview={() => {
        // Перезагрузим список после отправки
        api.getReviews().then(setReviews);
      }} /> : (
        <Alert
          message="Оставить отзыв могут только авторизованные пользователи"
          type="info"
          showIcon
          style={{ marginBottom: 32 }}
        />
      )}

      {/* Список отзывов */}
      {reviews.length === 0 ? (
        <Alert
          message="Нет отзывов"
          description="Первым оставьте отзыв о товаре!"
          type="info"
          style={{ margin: 24 }}
        />
      ) : (
        <List
          dataSource={reviews}
          renderItem={review => (
            <List.Item>
              <Card
                style={{ width: '100%' }}
                title={
                  <div>
                    <Text strong>{review.user.username}</Text> — {review.product.name}
                  </div>
                }
                extra={<Rate disabled value={review.rating} />}
              >
                <Text>{review.text}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(review.created_at).toLocaleDateString('ru-RU')}
                </Text>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

// Форма отзыва
function ReviewForm({ onNewReview }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    rating: 5,
    text: ''
  });

  // Загружаем товары при монтировании
  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch(err => console.error('Не удалось загрузить товары:', err));
  }, []);

  const handleSubmit = async () => {
    if (!formData.product_id || !formData.text.trim()) {
      message.error('Выберите товар и напишите отзыв');
      return;
    }

    setLoading(true);
    try {
      await api.postReview(formData);
      message.success('Отзыв отправлен на модерацию. Он появится после проверки.');
      setFormData({ product_id: '', rating: 5, text: '' });
      onNewReview(); // обновим список (хотя нового отзыва там пока не будет)
    } catch (err) {
      message.error(err.message || 'Не удалось отправить отзыв');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Оставить отзыв" style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Select
            value={formData.product_id}
            onChange={value => setFormData({ ...formData, product_id: value })}
            placeholder="Выберите товар"
            style={{ width: '100%' }}
            >
            {products.map(product => (
                <Option key={product.id} value={product.id}>
                {product.name}
                </Option>
            ))}
        </Select>

        <div>
          <Text>Оценка:</Text>
          <Rate
            value={formData.rating}
            onChange={value => setFormData({ ...formData, rating: value })}
            style={{ marginLeft: 8 }}
          />
        </div>

        <textarea
          placeholder="Ваш отзыв..."
          value={formData.text}
          onChange={e => setFormData({ ...formData, text: e.target.value })}
          rows={4}
          style={{ padding: 12, border: '1px solid #d9d9d9', borderRadius: 4 }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#bfbfbf' : '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Отправка...' : 'Отправить на модерацию'}
        </button>
      </div>
    </Card>
  );
}