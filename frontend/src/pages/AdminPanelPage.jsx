// src/pages/AdminPanelPage.jsx
import { useState, useEffect } from 'react';
import { Tabs, Table, Form, Input, Button, Switch, Space, Card, Typography, message, Alert, Slider, InputNumber, App } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  PlusOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  SwapOutlined,
} from '@ant-design/icons';

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
            key: 'theme',
            label: 'Тема',
            children: <ThemeSettingsTab />
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
            <Input placeholder="https://example.com/image.jpg" />
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

//========Вкладка: Тема========
function ThemeSettingsTab() {
  const [form] = Form.useForm();
  const contextHolder = message.useMessage();
  const { message: messageApi } = App.useApp();

  useEffect(() => {
    // Загрузить текущие настройки из БД
    api.getSiteSettings().then(data => {
      form.setFieldsValue(data);
      applySettings(data); // применить сразу
    });
  }, [form]);

  const applySettings = (data) => {
    const { bgImage, bgBlur = 4, bgOpacity = 0.2 } = data;
    document.documentElement.style.setProperty('--bg-image', bgImage ? `url(${bgImage})` : 'none');
    document.documentElement.style.setProperty('--bg-blur', `${bgBlur}px`);
    document.documentElement.style.setProperty('--bg-opacity', bgOpacity);
  };

  const onFinish = async (values) => {
    try {
      const res = await api.updateSiteSettings(values);
      applySettings(res);
      messageApi.success('Фон и тема обновлены для всех пользователей');
    } catch (err) {
      messageApi.error(err.message);
    }
  };

  return (
    <Card title="Глобальные настройки сайта">
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="bgImage" label="URL фона">
          <Input placeholder="https://example.com/bg.jpg" />
        </Form.Item>
        <Form.Item name="bgBlur" label="Размытие (px)">
          <InputNumber min={0} max={20} />
        </Form.Item>
        <Form.Item name="bgOpacity" label="Прозрачность фона (0–1)">
          <InputNumber min={0} max={1} step={0.05} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SwapOutlined />}>
            Сохранить и применить для всех
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}