import { apiClient } from './client'
import type { User } from '../types'

// ── Shapes ───────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresIn: number
  user: User & { id: string; status: string }
}

export interface RefreshResponse {
  token: string
  expiresIn: number
}

// ── Funções ──────────────────────────────────────────────────────────────────

/** Autentica o usuário e retorna token + dados do usuário. */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
  return data
}

/**
 * Invalida o token no servidor.
 * O frontend deve limpar localStorage independentemente do resultado.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout')
  } finally {
    localStorage.removeItem('biolab:token')
    localStorage.removeItem('biolab:user')
  }
}

/** Troca o refresh token por um novo access token. */
export async function refreshToken(refreshTk: string): Promise<RefreshResponse> {
  const { data } = await apiClient.post<RefreshResponse>('/auth/refresh', {
    refreshToken: refreshTk,
  })
  return data
}
