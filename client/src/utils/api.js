import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased from 10s for slow networks
})

// Stores the 401 callback (set by AuthContext)
let on401Callback = null
export function setOn401Callback(callback) {
  on401Callback = callback
}

// Fetch CSRF token on initialization
export async function fetchCSRFToken() {
  try {
    const res = await api.get('/auth/csrf-token')
    if (res.data?.csrfToken) {
      localStorage.setItem('csrf-token', res.data.csrfToken)
      return res.data.csrfToken
    }
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err.message)
  }
}

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (should be httpOnly cookies in production)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Add CSRF token if available
      const csrfToken = localStorage.getItem('csrf-token')
      if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('csrf-token')
      // Call callback instead of hard redirect to preserve React state
      if (on401Callback) {
        on401Callback()
      }
    }
    return Promise.reject(error)
  }
)

export default api
