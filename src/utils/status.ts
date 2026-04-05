import type { AntibiogramEntry, Exam, Patient } from '../types.ts'

export function statusClass(status: Exam['status'] | string) {
  if (status === 'Liberado') return 'ok'
  if (status === 'Em análise' || status === 'Sensível') return 'warn'
  if (status === 'Pendente') return 'pending'
  if (status === 'Resistente') return 'alert'
  if (status === 'Intermediário') return 'mid'
  return 'soft'
}

export function riskClass(risk: Patient['risk']) {
  if (risk === 'Vermelho') return 'alert'
  if (risk === 'Amarelo') return 'warn'
  return 'ok'
}

export function mapInterpretation(value: AntibiogramEntry['interpretation']) {
  return value === 'S' ? 'Sensível' : value === 'I' ? 'Intermediário' : 'Resistente'
}

export function scoreFromInterpretation(value: AntibiogramEntry['interpretation']) {
  if (value === 'S') return 90
  if (value === 'I') return 50
  return 15
}

export function colorFromInterpretation(value: AntibiogramEntry['interpretation'], alpha = 1) {
  if (value === 'S') return `rgba(14, 165, 233, ${alpha})`
  if (value === 'I') return `rgba(234, 179, 8, ${alpha})`
  return `rgba(239, 68, 68, ${alpha})`
}
