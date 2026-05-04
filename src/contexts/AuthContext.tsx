import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { login as apiLogin, logout as apiLogout } from '../api/auth'
import type { LoginRequest } from '../api/auth'
import type { User } from '../types'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Usuário autenticado ou null se não logado */
  user: User | null
  /** Token JWT atual */
  token: string | null
  /** true enquanto restaura sessão do localStorage na inicialização */
  isLoading: boolean
  /** Realiza login; lança erro em caso de falha */
  login: (credentials: LoginRequest) => Promise<void>
  /** Encerra a sessão */
  logout: () => Promise<void>
  /** Atualiza dados do usuário localmente (após PATCH /users/me) */
  updateUser: (updated: Partial<User>) => void
}

// ── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Chaves localStorage ───────────────────────────────────────────────────────

const TOKEN_KEY   = 'biolab:token'
const REFRESH_KEY = 'biolab:refresh'
const USER_KEY    = 'biolab:user'

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken]         = useState<string | null>(null)
  const [user, setUser]           = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaura sessão salva no localStorage ao montar
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const savedUser  = localStorage.getItem(USER_KEY)
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser) as User)
      }
    } catch {
      // localStorage corrompido — ignora
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(USER_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await apiLogin(credentials)
    localStorage.setItem(TOKEN_KEY, response.token)
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_KEY, response.refreshToken)
    }
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    setToken(response.token)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()           // remove localStorage internamente
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...updated }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, logout, updateUser }),
    [user, token, isLoading, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Exporta o contexto bruto para o hook useAuth consumir
export { AuthContext }
export type { AuthContextValue }
