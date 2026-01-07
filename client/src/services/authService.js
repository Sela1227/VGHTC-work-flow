import api from './api';

const authService = {
  async login(employeeId, password) {
    const response = await api.post('/auth/login', { employeeId, password });
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  async me() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
