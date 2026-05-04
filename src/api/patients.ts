import { apiClient } from './client'
import type { PageResponse, Patient, PatientRisk } from '../types'

export interface PatientPayload {
  name: string
  age: number
  bed: string
  risk: PatientRisk
}

export interface ListPatientsParams {
  search?: string
  risk?: PatientRisk
  page?: number
  limit?: number
}

/** GET /v1/patients */
export async function listPatients(params: ListPatientsParams = {}): Promise<PageResponse<Patient>> {
  const { data } = await apiClient.get<PageResponse<Patient>>('/patients', { params })
  return data
}

/** GET /v1/patients/:id */
export async function getPatient(id: string): Promise<Patient> {
  const { data } = await apiClient.get<Patient>(`/patients/${id}`)
  return data
}

/** POST /v1/patients */
export async function createPatient(payload: PatientPayload): Promise<Patient> {
  const { data } = await apiClient.post<Patient>('/patients', payload)
  return data
}

/** PUT /v1/patients/:id */
export async function updatePatient(id: string, payload: PatientPayload): Promise<Patient> {
  const { data } = await apiClient.put<Patient>(`/patients/${id}`, payload)
  return data
}
