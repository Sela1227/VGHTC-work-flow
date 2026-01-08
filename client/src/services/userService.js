import api from './api';

const userService = {
  // 取得所有使用者（同仁管理用）
  async getAll() {
    const response = await api.get('/users');
    return response.data;
  },

  // 取得指定角色的使用者（案件指派用）
  async getUsers(role) {
    const params = role ? `?role=${role}` : '';
    const response = await api.get(`/users${params}`);
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

  async toggleStatus(id) {
    const response = await api.patch(`/users/${id}/toggle`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async resetPassword(id) {
    const response = await api.post(`/users/${id}/reset-password`);
    return response.data;
  },
};

export default userService;
