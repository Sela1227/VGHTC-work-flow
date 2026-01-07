import api from './api';

const importService = {
  async getTemplate() {
    const response = await api.get('/import/template');
    return response.data;
  },

  async preview(rows) {
    const response = await api.post('/import/preview', { rows });
    return response.data;
  },

  async execute(rows) {
    const response = await api.post('/import/execute', { rows });
    return response.data;
  },
};

export default importService;
