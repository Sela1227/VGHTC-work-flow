import api from './api';

const caseTypeService = {
  async getCaseTypes(includeInactive = false) {
    const response = await api.get('/case-types', { params: { includeInactive } });
    return response.data;
  },

  async getCaseTypeStats(yearMonth = null) {
    const params = yearMonth ? { yearMonth } : {};
    const response = await api.get('/case-types/stats', { params });
    return response.data;
  },

  async getCaseTypeById(id) {
    const response = await api.get(`/case-types/${id}`);
    return response.data;
  },

  async createCaseType(data) {
    const response = await api.post('/case-types', data);
    return response.data;
  },

  async updateCaseType(id, data) {
    const response = await api.put(`/case-types/${id}`, data);
    return response.data;
  },

  async deleteCaseType(id) {
    const response = await api.delete(`/case-types/${id}`);
    return response.data;
  },
};

export default caseTypeService;
