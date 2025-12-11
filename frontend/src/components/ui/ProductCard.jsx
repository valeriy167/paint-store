import { Card, Button, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import { ShoppingCartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ProductCard({ product, onAddToCart }) {

  return (
    <Card
      hoverable
      style={{ 
        borderRadius: 8,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      cover={
        <Link to={`/product/${product.id}`}> 
          <div style={{ 
            height: 160, 
            backgroundColor: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: 8,
          }}>
            {product.image_url ? (
              <img 
                alt={product.name} 
                src={product.image_url} 
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
        </Link>
      }
      onClick={(e) => {
        // Предотвращаем срабатывание onClick родительского элемента и переходим по ссылке из Link
        if (e.target.closest('a, button')) {
          return; // Если клик был по ссылке или кнопке внутри, не переходим
        }
      }}
    >
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}> 
        <Card.Meta
          title={<Title level={5} style={{ margin: 0 }}>{product.name}</Title>}
          description={
            <div>
              <Text type="secondary">{product.category}</Text>
              <Text style={{ display: 'block', marginTop: 8, minHeight: 48 }}>
                {product.description.length > 100 
                  ? product.description.slice(0, 100) + '...' 
                  : product.description}
              </Text>
            </div>
          }
        />
      </Link>
      <div style={{ marginTop: 'auto' }}>
        <Space style={{ 
          width: '100%', 
          justifyContent: 'space-between' 
          }}>
          <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
            {/* {product.price} ₽ */}
            Цена уточняется после заказа
          </Title>
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал onClick Card
              onAddToCart?.(product.id)
            }}
          >
            В корзину
          </Button>
        </Space>
      </div>
    </Card>
  );
}