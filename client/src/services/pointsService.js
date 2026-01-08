import api from './api';

const pointsService = {
  async getCurrentPoints() {
    const response = await api.get('/points/current');
    return response.data;
  },

  async getAllCurrentPoints() {
    const response = await api.get('/points/all');
    return response.data;
  },

  async getPointsHistory(userId) {
    const response = await api.get(`/points/history/${userId || ''}`);
    return response.data;
  },

  async getAdjustments(yearMonth) {
    const params = yearMonth ? `?yearMonth=${yearMonth}` : '';
    const response = await api.get(`/points/adjustments${params}`);
    return response.data;
  },

  async adjustPoints(data) {
    const response = await api.post('/points/adjust', data);
    return response.data;
  },

  async deleteAdjustment(id) {
    const response = await api.delete(`/points/adjustments/${id}`);
    return response.data;
  },

  async monthlyReset() {
    const response = await api.post('/points/monthly-reset');
    return response.data;
  },
};

export default pointsService;
