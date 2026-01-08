import api from './api';

const userService = {
  async getAll() {
    const response = await api.get('/users');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async resetPassword(id) {
    const response = await api.post(`/users/${id}/reset-password`);
    return response.data;
  },

  async toggleStatus(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
