import { Card, Button, Typography, Space } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ProductCard({ product, onAddToCart }) {
  return (
    <Card
      hoverable
      style={{ 
        borderRadius: 8,
        height: '100%', // важно для Row/Col
        display: 'flex',
        flexDirection: 'column'
      }}
      cover={
        <div style={{ 
          height: 160, 
          backgroundColor: '#f5f5f5', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden'
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
      }
    >
      <Card.Meta
        title={<Title level={5} style={{ margin: 0 }}>{product.name}</Title>}
        description={
          <div>
            <Text type="secondary">{product.category}</Text>
            <Text style={{ display: 'block', marginTop: 8, minHeight: 48 }}>
              {product.description.length > 80 
                ? product.description.slice(0, 80) + '...' 
                : product.description}
            </Text>
          </div>
        }
      />
      <div style={{ marginTop: 'auto' }}>
        <Space style={{ 
          width: '100%', 
          justifyContent: 'space-between' 
          }}>
          <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
            {product.price} ₽
          </Title>
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            size="small"
            onClick={() => onAddToCart?.(product.id)}
          >
            В корзину
          </Button>
        </Space>
      </div>
    </Card>
  );
}