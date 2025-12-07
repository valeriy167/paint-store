const BASE_URL = 'http://localhost:8000/api';

export const api = {
  getProducts() {
    return fetch(`${BASE_URL}/products/`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
  },

  getContacts() {
    return fetch(`${BASE_URL}/contacts/`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
  },

  // Авторизация
  login(credentials) {
    return fetch(`${BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(res => {
      if (!res.ok) throw new Error('Неверный логин или пароль');
      return res.json();
    });
  },

  register(userData) {
  return fetch(`${BASE_URL}/profile/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) {
      // Если ошибка — попробуем извлечь первое сообщение
      const firstError = Object.values(data)[0]?.[0] || 'Ошибка регистрации';
      throw new Error(firstError);
    }
    return data;
    });
  },

  // Проверка авторизации
  getProfile() {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/profile/me/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error('Не авторизован');
      return res.json();
    });
  }
};