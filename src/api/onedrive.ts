import { apiClient } from './client'
import type { OneDriveStatus } from '../types'

/** GET /v1/integrations/onedrive/status */
export async function getOneDriveStatus(): Promise<OneDriveStatus> {
  const { data } = await apiClient.get<OneDriveStatus>('/integrations/onedrive/status')
  return data
}

/** POST /v1/integrations/onedrive/connect → retorna { authUrl } */
export async function connectOneDrive(): Promise<{ authUrl: string }> {
  const { data } = await apiClient.post<{ authUrl: string }>('/integrations/onedrive/connect')
  return data
}

/** DELETE /v1/integrations/onedrive/disconnect */
export async function disconnectOneDrive(): Promise<void> {
  await apiClient.delete('/integrations/onedrive/disconnect')
}

/** POST /v1/integrations/onedrive/sync */
export async function syncOneDrive(): Promise<{ synced: number; errors: number; lastSync: string }> {
  const { data } = await apiClient.post<{ synced: number; errors: number; lastSync: string }>(
    '/integrations/onedrive/sync',
  )
  return data
}
