import { Layout, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function Footer() {
  return (
    <AntFooter style={{ textAlign: 'center', background: '#fafafa', padding: '24px 0' }}>
      <Text type="secondary">
        © {new Date().getFullYear()} Paint Store — Интернет-магазин лакокрасочных материалов.{' '}
        <Link to="/contacts" style={{ marginLeft: 8 }}>Контакты</Link>
      </Text>
    </AntFooter>
  );
}