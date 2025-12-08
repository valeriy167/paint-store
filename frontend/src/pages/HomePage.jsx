import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Typography, Spin, Alert, message, Input, Select, Space } from 'antd'; // Добавлены Input, Select, Space
import ProductCard from '../components/ui/ProductCard';
import { api } from '../services/api';

const { Title } = Typography;

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поискового запроса
  const [selectedCategory, setSelectedCategory] = useState(null); // Состояние для выбранной категории (null означает "все")

  // Загрузка продуктов при монтировании компонента
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

  // Вычисляем уникальные категории для Select
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    // Отфильтровываем возможные пустые строки или null/undefined
    return uniqueCategories.filter(cat => cat && typeof cat === 'string');
  }, [products]);

  // Фильтрация продуктов на основе поиска и категории
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === null || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;
  if (error) return <Alert title="Ошибка загрузки товаров" description={error} type="error" showIcon style={{ margin: 24 }} />;

  return (
    <div style={{ padding: '24px 0' }}>

      {/* Заголовок */}
      <div style={{
          textAlign: 'center',
          marginBottom: 32,
          padding: '16px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.8)',
          maxWidth: 'fit-content',
          margin: '0 auto',
        }}>
          <Title level={2} style={{ margin: 0, marginBottom: 20, }}>
            Каталог товаров
          </Title>
          {/* Блок с фильтрами */}
      <div style={{ padding: '0 24px', marginBottom: 14 }}>
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
              allowClear // Позволяет сбросить выбор
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

      {/* Условие "Нет товаров" теперь зависит от filteredProducts */}
      {filteredProducts.length === 0 ? (
        <Alert title="Нет товаров" description={products.length === 0 ? "Скоро появятся новые позиции" : "Нет товаров, соответствующих фильтрам"} type="info" showIcon style={{ margin: 24 }} />
      ) : (
        <Row
          gutter={[24, 32]}
          justify="center"
          style={{ marginTop: 32 }}
        >
          {filteredProducts.map(product => ( // Отображаем filteredProducts вместо products
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