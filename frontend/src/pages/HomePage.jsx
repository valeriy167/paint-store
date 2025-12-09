import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Typography, Spin, Alert, message, Input, Select, Space, Carousel } from 'antd'; 
import ProductCard from '../components/ui/ProductCard';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поискового запроса
  const [selectedCategory, setSelectedCategory] = useState(null); // Состояние для выбранной категории (null означает "все")

  // Загрузка производителей
  useEffect(() => {
    api.getManufacturers()
      .then(setManufacturers)
      .catch(err => console.error('Ошибка загрузки производителей:', err));
  }, []);

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

      {manufacturers.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 16 }}>Наши производители</Title>
          <Carousel
            autoplay
            infinite
            slidesToShow={5} // Показываем 5 карточек
            slidesToScroll={1}
            dots={true}
            arrows={true}
            responsive={[
              {
                breakpoint: 1200,
                settings: { slidesToShow: 4, slidesToScroll: 1 }
              },
              {
                breakpoint: 992,
                settings: { slidesToShow: 3, slidesToScroll: 1 }
              },
              {
                breakpoint: 768,
                settings: { slidesToShow: 2, slidesToScroll: 1 }
              },
              {
                breakpoint: 480,
                settings: { slidesToShow: 1, slidesToScroll: 1 }
              }
            ]}
            style={{ padding: '0 20px' }} // Отступы по бокам для стрелок
          >
            {manufacturers.map(manufacturer => (
              <div key={manufacturer.id} style={{ padding: '0 8px' }}>
                <div
                  onClick={() => navigate(`/manufacturer/${manufacturer.id}`)} // Переход на страницу производителя
                  style={{
                    cursor: 'pointer',
                    padding: '16px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9',
                    transition: 'box-shadow 0.3s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  {manufacturer.logo ? (
                    <img
                      src={manufacturer.logo}
                      alt={manufacturer.name}
                      style={{ maxHeight: '60px', objectFit: 'contain', marginBottom: 8 }}
                    />
                  ) : (
                    <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      <Typography.Text strong>{manufacturer.name}</Typography.Text>
                    </div>
                  )}
                  <Typography.Text strong>{manufacturer.name}</Typography.Text>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      )}
      
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