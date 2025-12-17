import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const statsAPI = {
  getStats: () => api.get('/stats'),
  healthCheck: () => api.get('/health'),
};

export const nodesAPI = {
  getNodes: (params = {}) => api.get('/nodes/', { params }),
  getCountries: () => api.get('/nodes/countries'),
  generateNodes: (count = 20) => api.post('/nodes/generate', { count }),
  clearNodes: () => api.delete('/nodes/clear'),
  getStats: () => api.get('/nodes/stats'),
};

export const sessionsAPI = {
  getSessions: () => api.get('/sessions/'),
  getSession: (sessionId) => api.get(`/sessions/${sessionId}`),
  generateDemo: (packetCount = 100) => api.post(`/sessions/generate-demo?packet_count=${packetCount}`),
  uploadPcap: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/sessions/upload-pcap', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPackets: (sessionId, limit = 500, offset = 0) => 
    api.get(`/sessions/${sessionId}/packets`, { params: { limit, offset } }),
  deleteSession: (sessionId) => api.delete(`/sessions/${sessionId}`),
};

export const analysisAPI = {
  getAnalyses: () => api.get('/analysis/'),
  getAnalysis: (caseId) => api.get(`/analysis/${caseId}`),
  runAnalysis: (data) => api.post('/analysis/run', data),
  updateNotes: (caseId, notes) => api.post(`/analysis/${caseId}/notes?notes=${encodeURIComponent(notes)}`),
  deleteAnalysis: (caseId) => api.delete(`/analysis/${caseId}`),
};

export const reportsAPI = {
  getReports: () => api.get('/reports/'),
  generateReport: (caseId) => api.post(`/reports/generate/${caseId}`),
  downloadReport: (reportId) => `${API_BASE}/reports/download/${reportId}`,
  downloadReportByCase: (caseId) => `${API_BASE}/reports/download-by-case/${caseId}`,
  deleteReport: (reportId) => api.delete(`/reports/${reportId}`),
};

export default api;
