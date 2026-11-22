const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

// Attach the saved token, handle expired sessions and return server JSON.
export async function apiFetch(path, { method = 'GET', body, ...options } = {}) {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Please log in to continue.')

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })

  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.assign('/login')
  }

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}.`)
  }

  return data
}
