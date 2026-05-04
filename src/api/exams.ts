import { apiClient } from './client'
import type {
  AntibiogramEntry,
  Exam,
  ExamSource,
  ExamStatus,
  PageResponse,
} from '../types'

export interface ListExamsParams {
  view?: 'all' | 'mine'
  patientName?: string
  doctorName?: string
  status?: string[]
  dateFrom?: string
  dateTo?: string
  doctorId?: string
  patientId?: string
  page?: number
  limit?: number
}

export interface ExamPayload {
  patientId: string
  doctorId: string
  organism: string
  specimen: string
  site?: string
  collectedAt: string         // "YYYY-MM-DD HH:mm" ou ISO 8601
  source?: ExamSource
  notes?: string
  antibiogram?: Array<Omit<AntibiogramEntry, 'id'>>
}

/** GET /v1/exams (com filtros) */
export async function listExams(params: ListExamsParams = {}): Promise<PageResponse<Exam>> {
  const { data } = await apiClient.get<PageResponse<Exam>>('/exams', {
    params,
    // Axios serializa arrays como repetições do mesmo param: ?status=A&status=B
    paramsSerializer: { indexes: null },
  })
  return data
}

/** GET /v1/exams/:id */
export async function getExam(id: string): Promise<Exam> {
  const { data } = await apiClient.get<Exam>(`/exams/${id}`)
  return data
}

/** POST /v1/exams */
export async function createExam(payload: ExamPayload): Promise<Exam> {
  const { data } = await apiClient.post<Exam>('/exams', payload)
  return data
}

/** PUT /v1/exams/:id */
export async function updateExam(id: string, payload: ExamPayload): Promise<Exam> {
  const { data } = await apiClient.put<Exam>(`/exams/${id}`, payload)
  return data
}

/** PATCH /v1/exams/:id/status */
export async function updateExamStatus(id: string, status: ExamStatus): Promise<Exam> {
  const { data } = await apiClient.patch<Exam>(`/exams/${id}/status`, { status })
  return data
}
