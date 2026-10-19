import { request } from './api.js'

const sessionService = {
  getSessions(filters = {}) {
    // only send filters that are actually set
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== '' && v != null))
    const query = params.toString()
    return request(`/sessions/${query ? `?${query}` : ''}`)
  },
  getSession: (id) => request(`/sessions/${id}`),
  createSession: (session) => request('/sessions/', { method: 'POST', body: session }),
  updateSession: (id, changes) => request(`/sessions/${id}`, { method: 'PUT', body: changes }),
  deleteSession: (id) => request(`/sessions/${id}`, { method: 'DELETE' }),
  getRoster: (id) => request(`/sessions/${id}/roster`),
}

export default sessionService
