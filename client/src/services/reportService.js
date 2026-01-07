import api from './api';

const reportService = {
  async getDashboardStats() {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  async getMonthlyReport(yearMonth = null) {
    const params = yearMonth ? { yearMonth } : {};
    const response = await api.get('/reports/monthly', { params });
    return response.data;
  },

  async getPersonalStats(userId = null, months = 6) {
    const url = userId ? `/reports/personal/${userId}` : '/reports/personal';
    const response = await api.get(url, { params: { months } });
    return response.data;
  },

  async getAvailableMonths() {
    const response = await api.get('/reports/months');
    return response.data;
  },

  async getExportData(yearMonth = null) {
    const params = yearMonth ? { yearMonth } : {};
    const response = await api.get('/reports/export', { params });
    return response.data;
  },
};

export default reportService;
