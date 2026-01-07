import api from './api';

const userService = {
  async getUsers(role = null) {
    const params = role ? { role } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async resetPassword(id) {
    const response = await api.post(`/users/${id}/reset-password`);
    return response.data;
  },
};

export default userService;
