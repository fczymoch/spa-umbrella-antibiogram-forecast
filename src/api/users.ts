import { apiClient } from './client'
import type { PageResponse, User, UserStatus } from '../types'

export interface UpdateProfilePayload {
  name?: string
  email?: string
  role?: string
  shift?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: string
  shift?: string
}

/** GET /v1/users/me */
export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me')
  return data
}

/** PATCH /v1/users/me */
export async function updateMe(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await apiClient.patch<User>('/users/me', payload)
  return data
}

/** PATCH /v1/users/me/password (204 No Content) */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.patch('/users/me/password', payload)
}

/** GET /v1/users (admin) */
export async function listUsers(params: {
  status?: UserStatus
  page?: number
  limit?: number
} = {}): Promise<PageResponse<User>> {
  const { data } = await apiClient.get<PageResponse<User>>('/users', { params })
  return data
}

/** POST /v1/users (admin) */
export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post<User>('/users', payload)
  return data
}

/** PATCH /v1/users/:id/status (admin) */
export async function updateUserStatus(id: string, status: UserStatus): Promise<User> {
  const { data } = await apiClient.patch<User>(`/users/${id}/status`, { status })
  return data
}
