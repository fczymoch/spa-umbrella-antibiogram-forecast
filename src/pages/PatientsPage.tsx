import { Link } from 'react-router-dom'
import type { Exam, Patient } from '../types.ts'
import { statusClass } from '../utils/status.ts'

interface PatientsPageProps {
  patients: Patient[]
  exams: Exam[]
}

export function PatientsPage({ patients, exams }: PatientsPageProps) {
  const countByPatient = (patientId: string) => exams.filter((ex) => ex.patientId === patientId).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Risco assistencial</p>
          <h1>Pacientes (antibiogramas)</h1>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <h3>Pacientes monitorados</h3>
          <span className="pill subtle">{patients.length} ativos</span>
        </div>
        <ul className="list">
          {patients.map((patient) => (
            <li key={patient.id} className="list-row">
              <div>
                <p className="list-title">{patient.name}</p>
                <p className="muted small">
                  {patient.age} anos • {patient.bed}
                </p>
              </div>
              <div className="list-meta">
                <span className={`pill status ${statusClass(patient.risk)}`}>{patient.risk}</span>
                <span className="muted small">{countByPatient(patient.id)} antibiogramas</span>
                <Link className="pill subtle" to={`/app/patients/${patient.id}`}>
                  Ver detalhes
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
