import { useEffect, useState, useMemo } from 'react';
import { Spin, Alert, Card, Row, Col, Typography, Space, Divider } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { api } from '../services/api';

const { Title, Text } = Typography;

export default function ContactsPage() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // // Для карты используем короткую ссылку — без координат
  // const mapUrl = 'https://yandex.ru/map-widget/v1/?um=CLgk4G43&source=constructor';

  const mapUrl = useMemo(() => {
    if (!contact?.longitude || !contact?.latitude) return '';
    return `https://yandex.ru/map-widget/v1/?ll=${contact.longitude},${contact.latitude}&z=15&pt=${contact.longitude},${contact.latitude}`;
  }, [contact]);

  useEffect(() => {
    api.getContacts()
      .then(data => {
        setContact(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Пока идёт загрузка — крутим спиннер
  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;
  }

  // Ошибка — покажем
  if (error) {
    return <Alert message="Ошибка" description={error} type="error" style={{ margin: 24 }} />;
  }

  // Главное: contact точно не null
  if (!contact) {
    return <Alert message="Нет данных" description="Контактная информация не найдена" type="warning" style={{ margin: 24 }} />;
  }

  // Теперь можно деструктурировать
  const { address, phone, email, whatsapp, telegram, working_hours } = contact;

  return (
    <div style={{ padding: '24px 0' }}>
      {/* <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Контакты и адрес
      </Title> */}

      <div style={{
          textAlign: 'center',
          marginBottom: 32,
          padding: '16px', // Отступы внутри
          borderRadius: '8px', // Скругление углов
          // Вариант 1: Полупрозрачный цвет на фоне
          background: 'rgba(255, 255, 255, 0.8)',
          // Вариант 2: Сплошной цвет (менее гармоничный с фоном сайта)
          // background: '#f0f2f5',
          // Вариант 3: Градиент
          // background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
          // Вариант 4: Белый с тенью
          // background: '#ffffff',
          // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          maxWidth: 'fit-content', // Ширина по содержимому (опционально)
          margin: '0 auto',       // Центрирование (если используешь maxWidth: 'fit-content')
          // maxWidth: '500px',      // Ограничиваем ширину (опционально)
          // margin: '0 auto',       // Центрируем
        }}>
        <Title level={2} style={{ margin: 0 }}>
          Контакты и адрес
        </Title>
      </div>

      <Row gutter={[24, 48]} justify="center" style={{ marginTop: 32 }}>
        <Col xs={24} lg={14}>
          <Card title={<><EnvironmentOutlined /> На карте</>} variant="filled">
            <div style={{ width: '100%', height: 400, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
              <iframe
                src={mapUrl || "about:blank"}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                title="Карта проезда"
                style={{ border: 0 }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Связаться с нами" variant="filled">
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>Адрес:</Text><br />
                <Text>{address}</Text>
              </div>

              <Divider />

              <Space orientation="vertical" size="small">
                <Space>
                  <PhoneOutlined style={{ color: '#1677ff' }} />
                  <a href={`tel:${phone?.replace(/\s/g, '')}`}>{phone}</a>
                </Space>

                <Space>
                  <MailOutlined style={{ color: '#ff4d4f' }} />
                  <a href={`mailto:${email}`}>{email}</a>
                </Space>

                {whatsapp && (
                  <Space>
                    <MessageOutlined style={{ color: '#25D366' }} />
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </Space>
                )}

                {telegram && (
                  <Space>
                    <MessageOutlined style={{ color: '#0088cc' }} />
                    <a
                      href={`https://t.me/${telegram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Telegram
                    </a>
                  </Space>
                )}
              </Space>

              {working_hours && (
                <>
                  <Divider />
                  <div>
                    <Text strong>Часы работы:</Text><br />
                    <Text>{working_hours}</Text>
                  </div>
                </>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}