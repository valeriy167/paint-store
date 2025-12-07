import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return <div>Не авторизован</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Профиль</h2>
      <p><strong>Логин:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Имя:</strong> {user.first_name} {user.last_name}</p>
      {user.profile?.phone && <p><strong>Телефон:</strong> {user.profile.phone}</p>}
    </div>
  );
}