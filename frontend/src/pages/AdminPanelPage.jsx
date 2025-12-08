// src/pages/AdminPanelPage.jsx
import { useState, useEffect } from 'react';
import { Tabs, Table, Form, Input, Button, Switch, Space, Card, Typography, message, Alert, Slider, Upload, Image } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api'; 
import {
  PlusOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useBackground } from '../contexts/BackgroundContext';

const { Title, Text } = Typography;

export default function AdminPanelPage() {
  const { user } = useAuth();

  if (!user?.profile?.is_moderator) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Title level={3}>Доступ запрещён</Title>
        <p>Только администраторы могут управлять контентом.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Административная панель
      </Title>
      <Tabs
        defaultActiveKey="reviews"
        items={[
          {
            key: 'reviews',
            label: 'Модерация отзывов',
            children: <ReviewModerationTab />
          },
          {
            key: 'products',
            label: 'Товары',
            children: <ProductsTab />
          },
          {
            key: 'contacts',
            label: 'Контакты',
            children: <ContactsTab />
          },
          {
            key: 'settings',
            label: 'Настройки',
            children: <SettingsTab />
          }
        ]}
      />
    </div>
  );
}

// === Вкладка: Модерация отзывов ===
function ReviewModerationTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const loadReviews = () => {
    const fetchFn = showAll ? api.getReviews : api.getPendingReviews;
    setLoading(true);
    fetchFn()
      .then(setReviews)
      .catch(err => message.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [showAll]);

  const approveReview = async (id) => {
    try {
      await api.approveReview(id);
      message.success('Отзыв одобрен');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      message.error(err.message);
    }
  };

  const rejectReview = async (id) => {
    try {
      await api.rejectReview(id);
      message.success('Отзыв отклонён');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Товар', dataIndex: ['product', 'name'], key: 'product' },
    { title: 'Автор', dataIndex: ['user', 'username'], key: 'user' },
    { 
      title: 'Оценка', 
      dataIndex: 'rating', 
      key: 'rating', 
      render: r => '*'.repeat(r) + ' '.repeat(5 - r)
    },
    { 
      title: 'Статус', 
      key: 'status',
      render: (_, r) => r.is_approved ? 'Одобрен' : 'На модерации'
    },
    { title: 'Текст', dataIndex: 'text', key: 'text', ellipsis: true },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {!record.is_approved && (
            <Button 
              type="primary" 
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => approveReview(record.id)}
            >
            </Button>
          )}
          <Button 
            danger 
            size="small"
            icon={<StopOutlined />}
            onClick={() => rejectReview(record.id)}
          >
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Switch 
          checked={showAll}
          onChange={setShowAll}
          checkedChildren="Все отзывы"
          unCheckedChildren="На модерации"
        />
      </Space>
      <Table
        dataSource={reviews}
        columns={columns}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: showAll ? 'Нет отзывов' : 'Нет отзывов на модерации' }}
      />
    </Card>
  );
}

// === Вкладка: Товары ===
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch(err => message.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (values) => {
    try {
      await api.createProduct(values);
      message.success('Товар добавлен');
      form.resetFields();
      setEditingProduct(null);
      api.getProducts().then(setProducts);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleUpdate = async (values) => {
    if (!editingProduct) return;
    try {
      await api.updateProduct(editingProduct.id, values);
      message.success('Товар обновлён');
      setEditingProduct(null);
      form.resetFields();
      api.getProducts().then(setProducts);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteProduct(id);
      message.success('Товар удалён');
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      message.error(err.message);
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { 
      title: 'Изображение', 
      key: 'image',
      render: (_, record) => record.image_url ? (
        <img 
          src={record.image_url} 
          alt={record.name} 
          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
        />
      ) : '—'
    },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Цена', dataIndex: 'price', key: 'price' },
    { title: 'Остаток', dataIndex: 'stock', key: 'stock' },
    { title: 'Категория', dataIndex: 'category', key: 'category' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => startEditing(record)}
          >
          </Button>
          <Button 
            danger 
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="Добавить / редактировать товар">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={editingProduct ? handleUpdate : handleCreate}
        >
          <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Укажите название' }]}>
            <Input placeholder="Эмаль ПФ-115" />
          </Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Описание товара..." />
          </Form.Item>
          <Form.Item name="price" label="Цена (₽)" rules={[{ required: true }]}>
            <Input type="number" step="0.01" min="0" />
          </Form.Item>
          <Form.Item name="stock" label="Остаток" rules={[{ required: true }]}>
            <Input type="number" min="0" />
          </Form.Item>
          <Form.Item name="category" label="Категория">
            <Input placeholder="Эмаль, Грунт, Лак..." />
          </Form.Item>
          <Form.Item name="image_url" label="Ссылка на изображение">
            <Input placeholder="https://example.com/image.jpg  " />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={editingProduct ? <EditOutlined /> : <PlusOutlined />}
            >
              {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
            </Button>
            {editingProduct && (
              <Button 
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setEditingProduct(null);
                  form.resetFields();
                }}
              >
                Отмена
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>

      <Card title="Список товаров">
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  );
}

// === Вкладка: Контакты ===
function ContactsTab() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    api.getContacts()
      .then(data => {
        setContact(data);
        form.setFieldsValue(data);
      })
      .catch(err => message.error(err.message))
      .finally(() => setLoading(false));
  }, [form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await api.updateContacts(values);
      message.success('Контакты обновлены');
      setContact(prev => ({ ...prev, ...values }));
    } catch (err) {
      message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}><div className="ant-spin-dot"></div></div>;
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="Редактирование контактов">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="address" label="Адрес" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Телефон" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="whatsapp" label="WhatsApp">
            <Input placeholder="+79001234567" />
          </Form.Item>
          <Form.Item name="telegram" label="Telegram">
            <Input placeholder="@username" />
          </Form.Item>
          <Form.Item name="working_hours" label="Часы работы">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="latitude" label="Широта (lat)" rules={[{ required: true }]}>
            <Input type="number" step="0.000001" placeholder="55.684329" />
          </Form.Item>
          <Form.Item name="longitude" label="Долгота (lon)" rules={[{ required: true }]}>
            <Input type="number" step="0.000001" placeholder="37.274712" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving} 
              icon={<EnvironmentOutlined />}
            >
              Сохранить контакты и обновить карту
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {contact && contact.latitude && contact.longitude && (
        <Card title="Предпросмотр карты">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Text type="secondary">
              Карта обновится после сохранения координат
            </Text>
          </div>
          <iframe
            src={`https://yandex.ru/map-widget/v1/?ll=${contact.longitude},${contact.latitude}&z=15&pt=${contact.longitude},${contact.latitude}`}
            width="100%"
            height="400"
            frameBorder="0"
            allowFullScreen
            title="Карта проезда"
            style={{ border: '1px solid #eee', borderRadius: 4 }}
          />
        </Card>
      )}

      {!contact?.latitude && (
        <Alert
          message="Заполните широту и долготу"
          description="После сохранения появится предпросмотр карты"
          type="info"
          showIcon
        />
      )}
    </Space>
  );
}

// === Вкладка: Настройки (Фоновое изображение) ===
function SettingsTab() {
  const { refreshBackground } = useBackground(); // Получаем функцию обновления
  const [loadingButtonId, setLoadingButtonId] = useState(null);
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeImageId, setActiveImageId] = useState(null);
  const [form] = Form.useForm();

  // Функция для обновления состояния после API вызова
  const updateStateAfterApiCall = async () => {
    try {
      const imagesResponse = await api.getBackgroundImages();
      setBackgrounds(imagesResponse);

      const activeResponse = await api.getActiveBackgroundImage();
      if (activeResponse.image) {
        const activeImage = imagesResponse.find(img => img.image === activeResponse.image);
        if (activeImage) {
          setActiveImageId(activeImage.id);
          form.setFieldsValue({
            blur_amount: activeResponse.blur_amount || 0,
            scale_factor: activeResponse.scale_factor || 1,
          });
        } else {
          // Если активного изображения нет, сбросить форму и activeImageId
          setActiveImageId(null);
          form.resetFields();
        }
      } else {
         // Если активного изображения нет, сбросить форму и activeImageId
         setActiveImageId(null);
         form.resetFields();
      }
    } catch (error) {
      console.error('Error fetching backgrounds or active image after API call:', error);
      message.error('Ошибка обновления данных после действия');
    }
  };


  useEffect(() => {
    updateStateAfterApiCall();
  }, []);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_active', 'true');
    const values = form.getFieldsValue(['blur_amount', 'scale_factor']);
    formData.append('blur_amount', values.blur_amount || 0);
    formData.append('scale_factor', values.scale_factor || 1);

    try {
      await api.createBackgroundImage(formData);
      message.success('Фоновое изображение загружено и установлено!');
      await updateStateAfterApiCall(); // Обновляем после загрузки
    } catch (error) {
      console.error('Error uploading background:', error);
      message.error('Ошибка загрузки изображения');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteBackgroundImage(id);
      message.success('Фоновое изображение удалено!');
      // Если удалили активное, сбросим его
      if (activeImageId === id) {
        setActiveImageId(null);
        form.resetFields();
      }
      await updateStateAfterApiCall(); // Обновляем после удаления
    } catch (error) {
      console.error('Error deleting background:', error);
      message.error('Ошибка удаления изображения');
    }
  };

    const handleSetAsActive = async (id) => {
      setLoadingButtonId(id); // Установи ID кнопки как загружающейся
      try {
        await api.setActiveBackgroundImage(id);
        message.success('Фоновое изображение установлено!');
        // Вызываем updateStateAfterApiCall для обновления локального состояния вкладки
        await updateStateAfterApiCall();
        // Вызываем refreshBackground из контекста для обновления фона на сайте
        refreshBackground();
      } catch (error) {
        console.error('Error setting background as active:', error);
        message.error('Ошибка установки изображения');
      } finally {
        setLoadingButtonId(null); // Сбрось состояние загрузки
      }
    };

  const handleSaveSettings = async () => {
     if (!activeImageId) {
        message.warn('Сначала выберите активное изображение.');
        return;
     }
     try {
        const values = form.getFieldsValue(['blur_amount', 'scale_factor']);
        await api.updateBackgroundImage(activeImageId, values);
        message.success('Настройки фона сохранены на сервере!');
        // Обновляем, чтобы убедиться, что отображаются актуальные данные
        await updateStateAfterApiCall();
     } catch (error) {
        console.error('Error saving settings:', error);
        message.error(error.message || 'Ошибка сохранения настроек');
     }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Вы можете загружать только изображения!');
      }
      return isImage;
    },
    onChange: async ({ file }) => {
      if (file.status === 'done') {
        // Загрузка успешна
      } else if (file.status === 'error') {
        message.error(`${file.name} загрузка не удалась.`);
      }
    },
    customRequest: ({ file, onSuccess, onError }) => {
      handleUpload(file)
        .then(() => onSuccess('ok'))
        .catch((error) => onError(error));
    },
  };

  // Найдем активное изображение для предварительного просмотра
  const activeImageForPreview = backgrounds.find(img => img.id === activeImageId);

  const columns = [
    {
      title: 'Изображение',
      key: 'image',
      render: (_, record) => (
        <Image
          src={record.image} // Убедись, что record.image - это корректный URL
          alt={`Background ${record.id}`}
          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          // Добавим fallback на случай ошибки загрузки
          fallback="https://via.placeholder.com/100" // или путь к локальной заглушке
        />
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Параметры (B/S)',
      key: 'params',
      render: (_, record) => (
        `${record.blur_amount.toFixed(1)}/${record.scale_factor.toFixed(2)}x`
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => (
        record.id === activeImageId ? <span style={{ color: 'green' }}>Активное</span> : 'Неактивное'
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type={record.id === activeImageId ? 'primary' : 'default'}
            size="small"
            onClick={() => handleSetAsActive(record.id)}
            disabled={record.id === activeImageId}
            loading={loadingButtonId === record.id}
          >
            Установить как фон
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="Загрузить новое фоновое изображение">
        <Upload {...uploadProps} showUploadList={false}>
          <Button icon={<UploadOutlined />} loading={loading}>
            Нажмите для загрузки
          </Button>
        </Upload>
      </Card>

      <Card title="Список фоновых изображений">
        <Table
          dataSource={backgrounds}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card title="Настройки отображения активного изображения">
        <Form form={form} layout="vertical">
          <Form.Item name="blur_amount" label="Размытие (px)" rules={[{ type: 'float', min: 0, max: 20 }]}>
            <Slider min={0} max={20} step={0.5} />
          </Form.Item>
          <Form.Item name="scale_factor" label="Масштаб (x)" rules={[{ type: 'float', min: 0.5, max: 2 }]}>
            <Slider min={0.5} max={2} step={0.01} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSaveSettings} disabled={!activeImageId}>
              Сохранить настройки на сервере
            </Button>
          </Form.Item>
        </Form>
        {/* Предварительный просмотр (локально, на основе данных активного изображения) */}
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Предварительный просмотр (локально):</Text>
          <div
            style={{
              height: '200px',
              border: '1px solid #eee',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundImage: activeImageForPreview ? `url(${activeImageForPreview.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              // Используем данные из activeImageForPreview, а не из формы
              filter: `blur(${activeImageForPreview?.blur_amount || 0}px)`,
              backgroundSize: `${(activeImageForPreview?.scale_factor || 1) * 100}% auto`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            }}
          >
            {activeImageForPreview ? 'Предпросмотр фона' : 'Активное изображение не выбрано'}
          </div>
        </div>
      </Card>
    </Space>
  );
}
// ... остальная часть AdminPanelPage.jsx ...