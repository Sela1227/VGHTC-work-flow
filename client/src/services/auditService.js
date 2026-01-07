import api from './api';

const auditService = {
  async getLogs(params = {}) {
    const response = await api.get('/audit/logs', { params });
    return response.data;
  },

  async getEntityHistory(entityType, entityId) {
    const response = await api.get(`/audit/entity/${entityType}/${entityId}`);
    return response.data;
  },

  async getStats(days = 30) {
    const response = await api.get('/audit/stats', { params: { days } });
    return response.data;
  },
};

export default auditService;
