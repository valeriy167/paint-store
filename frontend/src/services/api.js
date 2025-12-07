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
};