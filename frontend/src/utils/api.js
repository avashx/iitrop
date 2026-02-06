import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// attach JWT on every request if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexus_token')
      // No redirect for demo mode
    }
    return Promise.reject(err)
  }
)

export default api
