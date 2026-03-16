import { apiClient } from '../lib/apiClient';

export const authService = {
  register: (payload) => apiClient('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiClient('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiClient('/api/auth/me'),
  logout: () => apiClient('/api/auth/logout', { method: 'POST' }),
  updateProfile: (payload) => apiClient('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  updateProfileImage: (formData) => apiClient('/api/auth/profile-image', { method: 'PATCH', body: formData }),
  removeProfileImage: () => apiClient('/api/auth/profile-image', { method: 'DELETE' }),
};
