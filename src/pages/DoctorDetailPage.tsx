import { Link, useParams } from 'react-router-dom'
import type { Doctor, Exam, Patient } from '../types.ts'
import { statusClass } from '../utils/status.ts'

interface DoctorDetailPageProps {
  doctors: Doctor[]
  exams: Exam[]
  patients: Patient[]
}

export function DoctorDetailPage({ doctors, exams, patients }: DoctorDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const doctor = doctors.find((d) => d.id === id)
  const doctorExams = exams
    .filter((e) => e.doctorId === id)
    .sort(
      (a, b) =>
        new Date(b.collectedAt.replace(' ', 'T')).getTime() -
        new Date(a.collectedAt.replace(' ', 'T')).getTime(),
    )

  const getPatient = (patientId: string) =>
    patients.find((p) => p.id === patientId)

  const formatDateTime = (value: string) => {
    const date = new Date(value.replace(' ', 'T'))
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const statusCounts = doctorExams.reduce(
    (acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc },
    {} as Record<string, number>,
  )

  if (!doctor) {
    return (
      <div className="page">
        <div className="page-header"><h1>Médico não encontrado</h1></div>
        <Link className="pill subtle" to="/app/doctors">← Voltar para equipe</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link className="pill subtle" to="/app/doctors" style={{ marginBottom: 'var(--space-2)', display: 'inline-block' }}>
            ← Voltar para equipe
          </Link>
          <p className="muted">Perfil profissional</p>
          <h1>{doctor.name}</h1>
          <p className="muted small">{doctor.specialty} · {doctor.shift}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <div className="topbar-avatar" style={{ width: '56px', height: '56px', fontSize: 'var(--font-size-xl)' }}>
            {doctor.name.replace('Dr. ', '').replace('Dra. ', '').charAt(0)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <section className="card stat">
          <p className="muted">Antibiogramas</p>
          <p className="stat-value">{doctorExams.length}</p>
          <p className="muted small">Total solicitados</p>
        </section>
        <section className="card stat">
          <p className="muted">Liberados</p>
          <p className="stat-value">{statusCounts['Liberado'] || 0}</p>
          <p className="muted small">Laudos prontos</p>
        </section>
        <section className="card stat">
          <p className="muted">Pendentes</p>
          <p className="stat-value">{(statusCounts['Pendente'] || 0) + (statusCounts['Em análise'] || 0)}</p>
          <p className="muted small">Aguardando resultado</p>
        </section>
      </div>

      {/* Exams list */}
      <section className="card">
        <div className="card-header">
          <h3>Antibiogramas solicitados</h3>
          <span className="pill subtle">{doctorExams.length} exame{doctorExams.length !== 1 ? 's' : ''}</span>
        </div>
        {doctorExams.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
              </svg>
            </span>
            <p className="empty-state-title">Nenhum antibiograma registrado</p>
            <p className="empty-state-description">Este médico ainda não possui exames associados.</p>
          </div>
        ) : (
          <ul className="list">
            {doctorExams.map((exam) => {
              const patient = getPatient(exam.patientId)
              return (
                <li key={exam.id} className="list-row">
                  <div>
                    <p className="list-title">{exam.organism}</p>
                    <p className="muted small">
                      {patient?.name ?? 'Paciente'} · {exam.specimen} · {exam.site}
                    </p>
                    <p className="muted small">Coletado: {formatDateTime(exam.collectedAt)}</p>
                  </div>
                  <div className="list-meta">
                    <span className={`pill status ${statusClass(exam.status)}`}>{exam.status}</span>
                    <span className="pill subtle">{exam.source}</span>
                    <Link className="pill subtle" to={`/app/exams/${exam.id}`}>
                      Ver antibiograma →
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
