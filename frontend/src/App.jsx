import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ContactsPage from './pages/ContactsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReviewsPage from './pages/ReviewsPage';
import RequireAuth from './components/auth/RequireAuth';
import CartPage from './pages/CartPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  
  return (
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route 
            path="/cart" 
            element={
              <RequireAuth>
                <CartPage />
              </RequireAuth>
            } 
          />
          <Route 
            path="/admin-panel" 
            element={
              <RequireAuth>
                <AdminPanelPage />
              </RequireAuth>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            } 
          />
          <Route path="*" element={<div>404 - Страница не найдена</div>} />
        </Routes>
      </Layout>
  );
}