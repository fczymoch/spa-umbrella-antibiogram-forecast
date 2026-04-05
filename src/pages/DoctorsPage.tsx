import { Link } from 'react-router-dom'
import type { Doctor, Exam } from '../types.ts'

interface DoctorsPageProps {
  doctors: Doctor[]
  exams: Exam[]
}

export function DoctorsPage({ doctors, exams }: DoctorsPageProps) {
  const examsByDoctor = (id: string) => exams.filter((exam) => exam.doctorId === id).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Escala e atuação</p>
          <h1>Equipe médica</h1>
          <p className="muted small">{doctors.length} profissionais ativos</p>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <h3>Plantonistas</h3>
          <span className="pill subtle">{doctors.length} profissionais</span>
        </div>
        <ul className="list">
          {doctors.map((doctor) => (
            <li key={doctor.id} className="list-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div className="topbar-avatar" style={{ width: '40px', height: '40px', fontSize: 'var(--font-size-base)', flexShrink: 0 }}>
                  {doctor.name.replace('Dr. ', '').replace('Dra. ', '').charAt(0)}
                </div>
                <div>
                  <p className="list-title">{doctor.name}</p>
                  <p className="muted small">{doctor.specialty}</p>
                </div>
              </div>
              <div className="list-meta">
                <span className="pill subtle">{doctor.shift}</span>
                <span className="muted small">{examsByDoctor(doctor.id)} antibiograma{examsByDoctor(doctor.id) !== 1 ? 's' : ''}</span>
                <Link className="pill subtle" to={`/app/doctors/${doctor.id}`}>
                  Ver perfil →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
