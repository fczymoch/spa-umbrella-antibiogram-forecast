import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Legend, Tooltip } from 'chart.js'
import type { Appointment, Attachment, Exam, User } from '../types.ts'
import { statusClass } from '../utils/status.ts'

ChartJS.register(ArcElement, Tooltip, Legend)

interface HomePageProps {
  user: User
  attachments: Attachment[]
  appointments: Appointment[]
  exams: Exam[]
}

export function HomePage({ user, attachments, appointments, exams }: HomePageProps) {
  const statusSummary = useMemo(() => {
    return exams.reduce(
      (acc, exam) => {
        acc[exam.status] = (acc[exam.status] || 0) + 1
        return acc
      },
      {} as Record<Exam['status'], number>,
    )
  }, [exams])

  const chartData = useMemo(() => {
    const labels: Exam['status'][] = ['Liberado', 'Em análise', 'Pendente']
    const values = labels.map((label) => statusSummary[label] || 0)
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#22c55e', '#fbbf24', '#6366f1'],
          borderWidth: 0,
        },
      ],
    }
  }, [statusSummary])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Bem-vindo(a), {user.name}</p>
          <h1>Painel de Antibiogramas</h1>
          <p className="muted">Turno: {user.shift}</p>
        </div>
        <div className="badge">Monitoramento focado em resistência bacteriana</div>
      </div>

      <div className="grid">
        <section className="card">
          <div className="card-header">
            <h3>Sobre a aplicação</h3>
            <span className="pill subtle">Como usar</span>
          </div>
          <p className="muted">
            Esta aplicação foi desenhada para acompanhamento rápido de <strong>antibiogramas</strong> em contextos de UTI e clínica.
            Use o menu lateral para navegar entre a visão geral, filtragens por paciente ou médico, e detalhes completos do laudo.
          </p>
          <div className="chips">
            <span className="pill subtle">Navegue por antibiogramas</span>
            <span className="pill subtle">Visualize MIC e interpretações</span>
            <span className="pill subtle">Anexe laudos e imagens</span>
          </div>
          <ul className="list" style={{ marginTop: 'var(--space-2)' }}>
            <li className="list-row">
              <div>
                <p className="list-title">1. Visão geral</p>
                <p className="muted small">Acompanhe status (Liberado, Em análise, Pendente) e quantidade por fonte (OneDrive/Bucket).</p>
              </div>
            </li>
            <li className="list-row">
              <div>
                <p className="list-title">2. Filtro por paciente ou médico</p>
                <p className="muted small">Acesse o submenu Antibiogramas para mudar o modo de busca.</p>
              </div>
            </li>
            <li className="list-row">
              <div>
                <p className="list-title">3. Detalhe completo</p>
                <p className="muted small">Clique em "Ver detalhe" para abrir MIC, interpretação e perfil de sensibilidade em gráfico.</p>
              </div>
            </li>
            <li className="list-row">
              <div>
                <p className="list-title">4. Anexos</p>
                <p className="muted small">Suba PDFs ou imagens de laudos com contexto clínico.</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="card">
          <div className="card-header">
            <h3>Resumo rápido</h3>
            <span className="pill subtle">Antibiogramas</span>
          </div>
          <div className="stats-grid">
            <div className="card stat">
              <p className="muted">Antibiogramas</p>
              <p className="stat-value">{exams.length}</p>
              <p className="muted small">Últimas coletas monitoradas</p>
            </div>
            <div className="card stat">
              <p className="muted">Anexos</p>
              <p className="stat-value">{attachments.length}</p>
              <p className="muted small">Laudos e imagens enviados</p>
            </div>
            <div className="card stat">
              <p className="muted">Consultas</p>
              <p className="stat-value">{appointments.length}</p>
              <p className="muted small">Próximas 24h</p>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Doughnut data={chartData} />
          </div>
        </section>
      </div>

      <div className="grid">
        <section className="card">
          <div className="card-header">
            <h3>Antibiogramas recentes</h3>
            <span className="pill subtle">Monitoramento</span>
          </div>
          <ul className="list">
            {exams.slice(0, 4).map((exam) => (
              <li key={exam.id} className="list-row">
                <div>
                  <p className="list-title">{exam.organism}</p>
                  <p className="muted small">{exam.specimen} • {exam.site}</p>
                  <p className="muted small">Fonte: {exam.source}</p>
                </div>
                <div className="list-meta">
                  <span className={`pill status ${statusClass(exam.status)}`}>{exam.status}</span>
                  <span className="muted small">Coleta: {exam.collectedAt}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card-header">
            <h3>Agenda</h3>
            <span className="pill subtle">Próximos atendimentos</span>
          </div>
          <ul className="list">
            {appointments.map((item) => (
              <li key={item.id} className="list-row">
                <div>
                  <p className="list-title">{item.patient}</p>
                  <p className="muted small">{item.type}</p>
                </div>
                <div className="list-meta">
                  <span className="muted">{item.schedule}</span>
                  <span className="pill subtle">{item.location}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card-header">
            <h3>Anexos</h3>
            <span className="pill subtle">Últimos uploads</span>
          </div>
          <ul className="list">
            {attachments.slice(0, 5).map((item) => (
              <li key={item.id} className="list-row">
                <div>
                  <p className="list-title">{item.fileName}</p>
                  <p className="muted small">{item.notes || item.type}</p>
                </div>
                <div className="list-meta">
                  <span className="muted">{item.uploadedAt}</span>
                  <span className="pill subtle">{item.size}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
