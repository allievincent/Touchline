// one place that talks to the backend. every service uses this.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TOKEN_KEY = 'touchline_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (form) {
    // login uses a form (OAuth2 standard), everything else is JSON
    payload = new URLSearchParams(form)
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload })
  } catch {
    throw new Error("Can't reach the server. Is the backend running?")
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    // fastapi errors come back as { detail: "..." } or a list for validation errors
    let message = 'Something went wrong'
    if (typeof data?.detail === 'string') message = data.detail
    else if (Array.isArray(data?.detail)) message = data.detail.map((d) => `${d.loc?.at(-1)}: ${d.msg}`).join(', ')
    const error = new Error(message)
    error.status = res.status
    throw error
  }
  return data
}
