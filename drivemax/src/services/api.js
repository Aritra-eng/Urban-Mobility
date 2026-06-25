const API_BASE_URL = 'https://drive-max-backend-bncp.onrender.com';
const AI_BASE_URL = 'http://localhost:5001';

export const getToken = () => localStorage.getItem('token');
export const getDriverId = () => localStorage.getItem('driverId');

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('driverId');
};

export const redirectToLogin = () => {
  clearSession();
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
};

const readResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const headers = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  ...(options.headers || {}),
};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await readResponse(response);

  if (response.status === 401) {
    redirectToLogin();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Something went wrong. Please try again.');
  }

  return data;
};

export const aiRequest = async (path, body) => {
  const response = await fetch(`${AI_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await readResponse(response);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.error || 'AI service unavailable');
  }

  return data?.data ?? data;
};

