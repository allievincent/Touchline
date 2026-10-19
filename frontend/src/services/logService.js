import { request } from './api.js'

// calls the /logs endpoints (training journal)
const logService = {
  getMyLogs: (kind) => request(`/logs/me${kind ? `?kind=${kind}` : ''}`),
  getLog: (id) => request(`/logs/${id}`),
  createLog: (log) => request('/logs/', { method: 'POST', body: log }),
  updateLog: (id, changes) => request(`/logs/${id}`, { method: 'PUT', body: changes }),
  deleteLog: (id) => request(`/logs/${id}`, { method: 'DELETE' }),
  getSharedWithMe: () => request('/logs/shared'),
  leaveFeedback: (id, feedback) => request(`/logs/${id}/feedback`, { method: 'PUT', body: { feedback } }),
}

export default logService
