import api from './api';

const caseService = {
  async getCases(filters = {}) {
    const response = await api.get('/cases', { params: filters });
    return response.data;
  },

  async getMyCases() {
    const response = await api.get('/cases/my');
    return response.data;
  },

  async getUnconfirmedCases() {
    const response = await api.get('/cases/unconfirmed');
    return response.data;
  },

  async getCaseById(id) {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  async createCase(data) {
    const response = await api.post('/cases', data);
    return response.data;
  },

  async selfAssign(data) {
    const response = await api.post('/cases/self-assign', data);
    return response.data;
  },

  async updateCase(id, data) {
    const response = await api.put(`/cases/${id}`, data);
    return response.data;
  },

  async reassignCase(id, assignedTo) {
    const response = await api.put(`/cases/${id}/assign`, { assignedTo });
    return response.data;
  },

  async confirmCase(id) {
    const response = await api.put(`/cases/${id}/confirm`);
    return response.data;
  },

  async completeCase(id) {
    const response = await api.put(`/cases/${id}/complete`);
    return response.data;
  },

  async deleteCase(id) {
    const response = await api.delete(`/cases/${id}`);
    return response.data;
  },
};

export default caseService;
