import { request } from './api.js'

const bookingService = {
  getMyBookings: () => request('/bookings/me'),
  bookSession: (sessionId, note) => request('/bookings/', { method: 'POST', body: { session_id: sessionId, note: note || null } }),
  updateNote: (bookingId, note) => request(`/bookings/${bookingId}`, { method: 'PUT', body: { note } }),
  cancelBooking: (bookingId) => request(`/bookings/${bookingId}`, { method: 'DELETE' }),
}

export default bookingService
