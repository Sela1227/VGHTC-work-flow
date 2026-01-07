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

  async getPointsHistory(userId, months = 6) {
    const url = userId ? `/points/history/${userId}` : '/points/history';
    const response = await api.get(url, { params: { months } });
    return response.data;
  },

  async adjustPoints(data) {
    const response = await api.post('/points/adjust', data);
    return response.data;
  },

  async getAdjustments(yearMonth = null) {
    const params = yearMonth ? { yearMonth } : {};
    const response = await api.get('/points/adjustments', { params });
    return response.data;
  },

  async monthlyReset() {
    const response = await api.post('/points/monthly-reset');
    return response.data;
  },
};

export default pointsService;
