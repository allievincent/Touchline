import { request, setToken, clearToken } from './api.js'

// calls every /auth and /users endpoint on the backend
const userService = {
  async register(user) {
    const data = await request('/auth/register', { method: 'POST', body: user })
    setToken(data.access_token)
    return data.user
  },

  async login(email, password) {
    const data = await request('/auth/login', { method: 'POST', form: { username: email, password } })
    setToken(data.access_token)
    return data.user
  },

  logout() {
    clearToken()
  },

  getMe: () => request('/auth/me'),
  updateMe: (changes) => request('/users/me', { method: 'PUT', body: changes }),
  deleteMe: () => request('/users/me', { method: 'DELETE' }),
  getUsers: (role) => request(`/users/${role ? `?role=${role}` : ''}`),
  getUser: (id) => request(`/users/${id}`),
}

export default userService
