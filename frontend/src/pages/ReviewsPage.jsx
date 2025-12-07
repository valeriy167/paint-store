import { useState, useEffect } from 'react';
import { Card, List, Rate, Typography, message, Spin, Alert } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { CommentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

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
  const [formData, setFormData] = useState({
    product_id: '',
    rating: 5,
    text: ''
  });

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
        <select
          value={formData.product_id}
          onChange={e => setFormData({ ...formData, product_id: e.target.value })}
          style={{ padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4 }}
        >
          <option value="">Выберите товар</option>
          {/* В реальном проекте — загрузить товары через api.getProducts() */}
          <option value="1">Эмаль ПФ-115 белая</option>
          <option value="2">Грунт ГФ-021 серый</option>
          <option value="3">Лак ПУ-258 глянцевый</option>
        </select>

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