import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import type { Doctor, Exam, Patient } from '../types.ts'
import { colorFromInterpretation, mapInterpretation, statusClass } from '../utils/status.ts'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ExamDetailPageProps {
  exams: Exam[]
  patients: Patient[]
  doctors: Doctor[]
}

export function ExamDetailPage({ exams, patients, doctors }: ExamDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const exam = exams.find((item) => item.id === id)
  const patient = exam ? patients.find((p) => p.id === exam.patientId) : undefined
  const doctor = exam ? doctors.find((d) => d.id === exam.doctorId) : undefined

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

  const statusSteps = ['Pendente', 'Em análise', 'Liberado']
  const currentStatusIndex = exam ? statusSteps.indexOf(exam.status) : -1

  const chartData = useMemo(() => {
    if (!exam) return null
    return {
      labels: exam.antibiogram.map((entry) => entry.antibiotic),
      datasets: [
        {
          label: 'Índice de eficácia',
          data: exam.antibiogram.map((entry) =>
            entry.interpretation === 'S' ? 90 : entry.interpretation === 'I' ? 50 : 15,
          ),
          backgroundColor: exam.antibiogram.map((entry) =>
            colorFromInterpretation(entry.interpretation, 0.7),
          ),
        },
      ],
    }
  }, [exam])

  if (!exam) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Antibiograma não encontrado</h1>
        </div>
        <Link className="pill subtle" to="/app/exams">← Voltar para antibiogramas</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link className="pill subtle" to="/app/exams" style={{ marginBottom: 'var(--space-2)', display: 'inline-block' }}>
            ← Voltar para antibiogramas
          </Link>
          <p className="muted">Antibiograma — detalhe completo</p>
          <h1>{exam.organism}</h1>
          <p className="muted">{exam.specimen} • {exam.site}</p>
        </div>
        <div className="chips">
          <span className={`pill status ${statusClass(exam.status)}`}>{exam.status}</span>
          <span className="pill subtle">Origem: {exam.source}</span>
        </div>
      </div>

      {/* Pipeline de status */}
      <section className="card">
        <div className="card-header">
          <h3>Pipeline de status</h3>
          <span className="pill subtle">Acompanhamento</span>
        </div>
        <div className="pipeline-steps">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentStatusIndex
            const isCurrent = index === currentStatusIndex
            return (
              <div
                key={step}
                className={`pipeline-step${!isActive ? ' inactive' : ''}`}
              >
                <div className={`pipeline-thumb${isCurrent ? ' current' : ''}`}>
                  {isActive && exam.previewUrl ? (
                    <img src={exam.previewUrl} alt={step} />
                  ) : (
                    <span className="muted small">Aguardando</span>
                  )}
                </div>
                <span className={`pill ${isCurrent ? 'status ok' : 'subtle'}`}>{step}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Galeria de imagens */}
      <section className="card">
        <div className="card-header">
          <h3>Galeria de imagens</h3>
          <span className="pill subtle">3 slots</span>
        </div>
        <div className="gallery-grid">
          {[0, 1, 2].map((index) => (
            <div key={index} className="gallery-slot">
              {exam.previewUrl && index === 0 ? (
                <img src={exam.previewUrl} alt={`Foto ${index + 1}`} />
              ) : (
                <div className="gallery-slot-empty">
                  <p className="muted small">Foto {index + 1}</p>
                  <p className="muted small">Sem imagem</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid">
        <section className="card">
          <div className="card-header">
            <h3>Dados clínicos</h3>
            <span className="pill subtle">Coletado em {formatDateTime(exam.collectedAt)}</span>
          </div>
          <p className="muted">Paciente: <strong>{patient?.name || 'Paciente'}</strong></p>
          <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Médico: <strong>{doctor?.name || 'Equipe'}</strong></p>
          {exam.notes && (
            <p className="muted" style={{ marginTop: 'var(--space-2)' }}>
              Observações: {exam.notes}
            </p>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h3>Interpretação</h3>
            <span className="pill subtle">MIC</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Antibiótico</th>
                <th>MIC</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {exam.antibiogram.map((entry) => (
                <tr key={entry.antibiotic}>
                  <td>{entry.antibiotic}</td>
                  <td>{entry.mic}</td>
                  <td>
                    <span className={`pill status ${statusClass(mapInterpretation(entry.interpretation))}`}>
                      {mapInterpretation(entry.interpretation)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {chartData && (
        <section className="card">
          <div className="card-header">
            <h3>Perfil de sensibilidade</h3>
          </div>
          <Bar data={chartData} options={{ plugins: { legend: { display: false } } }} />
        </section>
      )}
    </div>
  )
}
