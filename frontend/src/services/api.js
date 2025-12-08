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
  },

  // Получить одобренные отзывы
  getReviews() {
    return fetch(`${BASE_URL}/reviews/`)
      .then(res => {
        if (!res.ok) throw new Error('Не удалось загрузить отзывы');
        return res.json();
      });
  },

  // Отправить отзыв (требует авторизации)
  postReview(data) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/reviews/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          const msg = Object.values(err)[0]?.[0] || 'Ошибка отправки';
          throw new Error(msg);
        });
      }
      return res.json();
    });
  },

  // Получить корзину
  getCart() {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/cart/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось загрузить корзину');
      return res.json();
    });
  },

  // Добавить товар
  addToCart(productId, quantity = 1) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/cart/add_item/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity })
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось добавить в корзину');
      return res.json();
    });
  },

  // Обновить количество
  updateCartItem(itemId, quantity) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/cart/${itemId}/update_item/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось обновить');
      return res.json();
    });
  },

  // Удалить элемент
  removeCartItem(itemId) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/cart/${itemId}/remove_item/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось удалить');
      return res.json();
    });
  },

  // Получить отзывы на модерации
  getPendingReviews() {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/reviews/pending/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось загрузить отзывы на модерации');
      return res.json();
    });
  },

  // Одобрить отзыв
  approveReview(reviewId) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/reviews/${reviewId}/approve/`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось одобрить отзыв');
      return res.json();
    });
  },

  // Создать товар
  createProduct(data) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/products/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось создать товар');
      return res.json();
    });
  },

  // Обновить контакты
  updateContacts(data) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/contacts/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось обновить контакты');
      return res.json();
    });
  },

  // Удалить товар
  deleteProduct(id) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/products/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось удалить товар');
    });
  },

  // Обновить товар
  updateProduct(id, data) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/products/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось обновить товар');
      return res.json();
    });
  },

  // Отклонить отзыв (удалить)
  rejectReview(reviewId) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/reviews/${reviewId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось отклонить отзыв');
    });
  },

  // Получить свои отзывы
  getMyReviews() {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/reviews/my/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось загрузить отзывы');
      return res.json()
    });
  },

  // Обновить профиль (расширим ProfileSerializer, чтобы phone/telegram можно было писать)
  updateProfile(data) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/profile/me/`, {
      method: 'PATCH', // или PUT
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) throw new Error('Не удалось обновить профиль');
      return res.json();
    });
  },

  // Обновить основные данные пользователя (User)
  updateUser(data) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/profile/me/update/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) return res.json().then(err => { throw err; });
      return res.json();
    });
  },

  // Оформить заказ — отправить на email админа
  checkout(data) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/cart/checkout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw err; });
      }
      return res.json();
    });
  },

  // Получить настройки
  getSiteSettings() {
    return fetch(`${BASE_URL}/site/settings/`).then(r => r.json());
  },

  // Обновить настройки (только для модераторов)
  updateSiteSettings(data) {
    const token = localStorage.getItem('access');
    return fetch(`${BASE_URL}/site/settings/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    }).then(r => {
      if (!r.ok) throw new Error('Не удалось сохранить настройки');
      return r.json();
    });
  },

};