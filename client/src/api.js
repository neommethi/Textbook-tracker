const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : '')
).replace(/\/$/, '')

export function apiUrl(path) {
  return `${API_BASE}${path}`
}

// Attach the saved token, handle expired sessions and return server JSON.
export async function apiFetch(path, { method = 'GET', body, ...options } = {}) {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Please log in to continue.')

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(apiUrl(path), {
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

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('json')) {
    const bodyText = await response.text()
    if (/<!doctype\s+html|<html[\s>]/i.test(bodyText)) {
      throw new Error(
        `The API returned an HTML page instead of JSON for ${path}. Check that VITE_API_URL points to the deployed backend and that its API route is deployed.`,
      )
    }
    throw new Error(
      `The API returned a non-JSON response for ${path} (HTTP ${response.status}).`,
    )
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`The API returned invalid JSON for ${path}.`)
  }
  if (response.status === 403 && data.error === 'Admins only.') {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (user) {
        localStorage.setItem('user', JSON.stringify({ ...user, role: 'user' }))
        window.location.assign('/student-dashboard')
      }
    } catch {
      localStorage.removeItem('user')
      window.location.assign('/login')
    }
  }
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}.`)
  }

  return data
}
