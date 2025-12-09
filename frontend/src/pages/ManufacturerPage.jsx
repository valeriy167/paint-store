import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Spin, Alert, message, Input, Select, Space } from 'antd';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!manufacturerId) {
        navigate('/');
        return;
    }
    setLoading(true);
    setError(null);
    setProducts([]); // Сбросим продукты
    setManufacturer(null); // Сбросим производителя

    // Сначала загружаем товары по производителю
    api.getProductsByManufacturer(manufacturerId)
      .then(data => {
        setProducts(data);
        // Если товары есть, получаем информацию о производителе из первого товара
        if (data.length > 0 && data[0].manufacturer) {
            setManufacturer(data[0].manufacturer);
            setLoading(false); // Загрузка завершена, т.к. мы получили и товары, и инфо о производителе
        } else {
            // Если товаров нет, загружаем информацию о производителе отдельно
            return api.getManufacturerInfo(manufacturerId);
        }
      })
      .then(manufacturerData => {
        // Этот .then сработает, только если товары не были найдены (т.е. сработал return api.getManufacturerInfo)
        if (manufacturerData) {
            setManufacturer(manufacturerData);
        }
        // В любом случае, загрузка завершена
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [manufacturerId, navigate]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.filter(cat => cat && typeof cat === 'string');
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === null || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;
  if (error) return <Alert title="Ошибка" description={error} type="error" showIcon style={{ margin: 24 }} />;

  return (
    // ... JSX ...
    <div style={{ padding: '24px 0' }}>
      {/* Заголовок с информацией о производителе */}
      {manufacturer && ( // Отображаем только если manufacturer !== null
        <div 
            style={{
            textAlign: 'center',
            marginBottom: 32,
            padding: '24px 16px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          {/* Логотип */}
          {manufacturer.logo && (
            <div style={{ marginBottom: 16 }}>
              <img
                src={manufacturer.logo}
                alt={manufacturer.name}
                style={{ 
                    objectFit: 'contain', 
                    maxWidth: '100%',
                    boxShadow: '0 0 20px 10px rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                 }}
              />
            </div>
          )}
          {/* Название */}
          <Title level={2} style={{ margin: '8px 0' }}>
            {manufacturer.name} 
          </Title>
          {/* Описание */}
          {manufacturer.description && (
            <div style={{ marginTop: 16 }}>
              <Typography.Text type="secondary">{manufacturer.description}</Typography.Text>
            </div>
          )}
                {/* Фильтры */}
            {/* ... JSX фильтров ... */}
            <div style={{  
                textAlign: 'center',
                marginTop: 32,
                padding: '16px',
                borderRadius: '8px',
                //background: 'rgba(255, 255, 255, 0.8)',
                maxWidth: 'fit-content',
                margin: '0 auto',
                }}>
                <Space size="middle" style={{ width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="search-input" style={{ marginRight: 8 }}>Поиск:</label>
                    <Input
                    id="search-input"
                    placeholder="Введите название товара"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 200 }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="category-select" style={{ marginRight: 8 }}>Категория:</label>
                    <Select
                    id="category-select"
                    placeholder="Выберите категорию"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    allowClear
                    style={{ width: 200 }}
                    >
                    {categories.map(category => (
                        <Select.Option key={category} value={category}>
                        {category}
                        </Select.Option>
                    ))}
                    </Select>
                </div>
                </Space>
            </div>
        </div>
      )}

      {/* Условие "Нет товаров" */}
      {filteredProducts.length === 0 ? (
        <Alert title="Нет товаров" description={products.length === 0 ? "У этого производителя пока нет товаров в продаже." : "Нет товаров, соответствующих фильтрам"} type="info" showIcon style={{ margin: 24 }} />
      ) : (
        <Row
          gutter={[24, 32]}
          justify="center"
        >
          {filteredProducts.map(product => (
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