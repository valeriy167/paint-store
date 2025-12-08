import { Layout, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function Footer() {
  const { isDark } = useTheme();
  const bgColor = isDark ? '#141414' : '#fafafa';
  const textColor = isDark ? '#a0a0a0' : '#666';

  return (
    <div
      style={{
        background: bgColor,
        color: textColor,
        padding: '24px 0',
        textAlign: 'center',
        borderTop: isDark ? '1px solid #333' : '1px solid #eee'
      }}
    >
      <p>
        © {new Date().getFullYear()} Кузнечные краски Москвы — Интернет-магазин лакокрасочных материалов.{' '}
        <Link 
          to="/contacts" 
          style={{ color: isDark ? '#40a9ff' : '#1677ff', marginLeft: 8 }}
        >
          Контакты
        </Link>
      </p>
    </div>
  );
}