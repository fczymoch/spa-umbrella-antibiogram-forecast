import { apiClient } from './client'
import type { PageResponse, Report } from '../types'

export interface ListReportsParams {
  examId?: string
  page?: number
  limit?: number
}

export interface GenerateReportResponse {
  reportId: string
  status: 'generating' | 'pending' | 'ready' | 'error'
  message?: string
}

/** GET /v1/reports */
export async function listReports(params: ListReportsParams = {}): Promise<PageResponse<Report>> {
  const { data } = await apiClient.get<PageResponse<Report>>('/reports', { params })
  return data
}

/** GET /v1/reports/:id */
export async function getReport(id: string): Promise<Report> {
  const { data } = await apiClient.get<Report>(`/reports/${id}`)
  return data
}

/** POST /v1/reports/generate */
export async function generateReport(examId: string): Promise<GenerateReportResponse> {
  const { data } = await apiClient.post<GenerateReportResponse>('/reports/generate', { examId })
  return data
}

/** DELETE /v1/reports/:id */
export async function deleteReport(id: string): Promise<void> {
  await apiClient.delete(`/reports/${id}`)
}
