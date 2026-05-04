import { apiClient } from './client'
import type { Attachment, PageResponse } from '../types'

export interface ListAttachmentsParams {
  page?: number
  limit?: number
}

export interface UploadResult {
  uploaded: Attachment[]
}

/** GET /v1/attachments */
export async function listAttachments(params: ListAttachmentsParams = {}): Promise<PageResponse<Attachment>> {
  const { data } = await apiClient.get<PageResponse<Attachment>>('/attachments', { params })
  return data
}

/**
 * POST /v1/attachments (multipart/form-data)
 * Upload de um ou mais arquivos.
 * O Content-Type é definido automaticamente pelo browser quando enviamos FormData.
 */
export async function uploadAttachments(files: File[] | FileList, notes?: string): Promise<UploadResult> {
  const formData = new FormData()
  for (const file of Array.from(files)) {
    formData.append('files', file)
  }
  if (notes && notes.trim()) {
    formData.append('notes', notes)
  }
  const { data } = await apiClient.post<UploadResult>('/attachments', formData)
  return data
}

/** DELETE /v1/attachments/:id */
export async function deleteAttachment(id: string): Promise<void> {
  await apiClient.delete(`/attachments/${id}`)
}
