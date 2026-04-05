import { Link, useParams } from 'react-router-dom'
import type { Doctor, Exam, Patient } from '../types.ts'
import { statusClass } from '../utils/status.ts'

interface PatientDetailPageProps {
  patients: Patient[]
  exams: Exam[]
  doctors: Doctor[]
}

export function PatientDetailPage({ patients, exams, doctors }: PatientDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const patient = patients.find((p) => p.id === id)

  const patientExams = exams
    .filter((ex) => ex.patientId === id)
    .sort(
      (a, b) =>
        new Date(b.collectedAt.replace(' ', 'T')).getTime() -
        new Date(a.collectedAt.replace(' ', 'T')).getTime(),
    )

  const getDoctor = (doctorId: string) => doctors.find((d) => d.id === doctorId)?.name || 'Médico'

  const formatDateTime = (value: string) => {
    const date = new Date(value.replace(' ', 'T'))
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!patient) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Paciente não encontrado</h1>
        </div>
        <Link className="pill subtle" to="/patients">
          ← Voltar para pacientes
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link className="pill subtle" to="/patients" style={{ marginBottom: 'var(--space-2)', display: 'inline-block' }}>
            ← Voltar para pacientes
          </Link>
          <p className="muted">Detalhes do paciente</p>
          <h1>{patient.name}</h1>
          <p className="muted small">
            {patient.age} anos • {patient.bed}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span className={`pill status ${statusClass(patient.risk)}`}>{patient.risk}</span>
          <span className="pill subtle">{patientExams.length} antibiogramas</span>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <h3>Antibiogramas do paciente</h3>
        </div>
        {patientExams.length === 0 ? (
          <p className="muted" style={{ padding: 'var(--space-4)' }}>
            Nenhum antibiograma registrado para este paciente.
          </p>
        ) : (
          <ul className="list">
            {patientExams.map((exam) => (
              <li key={exam.id} className="list-row">
                <div>
                  <p className="list-title">{exam.organism}</p>
                  <p className="muted small">
                    {exam.specimen} • {exam.site}
                  </p>
                  <p className="muted small">Coletado: {formatDateTime(exam.collectedAt)}</p>
                  <p className="muted small">Médico solicitante: {getDoctor(exam.doctorId)}</p>
                  {exam.notes && (
                    <p className="muted small" style={{ marginTop: 'var(--space-1)', fontStyle: 'italic' }}>
                      Observações: {exam.notes}
                    </p>
                  )}
                </div>
                <div className="list-meta">
                  <span className={`pill status ${statusClass(exam.status)}`}>{exam.status}</span>
                  <span className="muted small">Origem: {exam.source}</span>
                  <Link className="pill subtle" to={`/app/exams/${exam.id}`}>
                    Ver antibiograma completo
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
