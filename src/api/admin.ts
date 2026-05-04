import { apiClient } from './client'
import type { AdminSettings, AdminStats } from '../types'

/** GET /v1/admin/stats */
export async function getStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>('/admin/stats')
  return data
}

/** GET /v1/admin/settings */
export async function getSettings(): Promise<AdminSettings> {
  const { data } = await apiClient.get<AdminSettings>('/admin/settings')
  return data
}

/** PUT /v1/admin/settings */
export async function updateSettings(payload: AdminSettings): Promise<AdminSettings> {
  const { data } = await apiClient.put<AdminSettings>('/admin/settings', payload)
  return data
}
