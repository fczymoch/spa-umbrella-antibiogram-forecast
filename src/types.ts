export type User = {
  name: string
  email: string
  role: string
  shift: string
  doctorId?: string
}

export type Attachment = {
  id: string
  fileName: string
  type: string
  size: string
  uploadedAt: string
  notes?: string
}

export type Appointment = {
  id: string
  patient: string
  schedule: string
  location: string
  type: string
}

export type AntibiogramEntry = {
  antibiotic: string
  mic: string
  interpretation: 'S' | 'I' | 'R'
}

export type Exam = {
  id: string
  patientId: string
  doctorId: string
  organism: string
  specimen: string
  collectedAt: string
  status: 'Pendente' | 'Em análise' | 'Pendente de avaliação' | 'Finalizado'
  source: 'OneDrive' | 'Bucket'
  previewUrl: string
  antibiogram: AntibiogramEntry[]
  site: string
  notes?: string
}

export type Patient = {
  id: string
  name: string
  age: number
  bed: string
  risk: 'Verde' | 'Amarelo' | 'Vermelho'
}

export type Doctor = {
  id: string
  name: string
  specialty: string
  shift: string
}
