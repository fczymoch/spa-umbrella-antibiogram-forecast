import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Interceptor de requisição ────────────────────────────────────────────────
// Injeta o Bearer token em todas as chamadas (se existir)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('biolab:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Interceptor de resposta ──────────────────────────────────────────────────
// Captura 401 (token expirado / inválido) e limpa a sessão
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('biolab:token')
      localStorage.removeItem('biolab:user')
      // Redireciona para o login sem depender do React Router
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
