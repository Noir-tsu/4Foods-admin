// src/utils/api.js

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// Hàm lấy token từ localStorage (sau khi login bạn phải lưu vào đây)
const getToken = () => localStorage.getItem('token');

// Hàm chung để thêm header Authorization nếu có token
const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// GET
export async function getJSON(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
    credentials: 'include', // cần nếu bạn dùng cookie session (tùy chọn)
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Request failed ${res.status}`);
  }
  return await res.json();
}

// POST
export async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Request failed ${res.status}`);
  }
  return await res.json();
}

// PUT
export async function putJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Request failed ${res.status}`);
  }
  return await res.json();
}

// DELETE (bonus nếu cần)
export async function deleteJSON(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`Delete failed ${res.status}`);
  return await res.json();
}