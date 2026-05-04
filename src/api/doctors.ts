import { apiClient } from './client'
import type { Doctor, PageResponse } from '../types'

export interface ListDoctorsParams {
  search?: string
  page?: number
  limit?: number
}

/** GET /v1/doctors */
export async function listDoctors(params: ListDoctorsParams = {}): Promise<PageResponse<Doctor>> {
  const { data } = await apiClient.get<PageResponse<Doctor>>('/doctors', { params })
  return data
}

/** GET /v1/doctors/:id (inclui recentExams) */
export async function getDoctor(id: string): Promise<Doctor> {
  const { data } = await apiClient.get<Doctor>(`/doctors/${id}`)
  return data
}
