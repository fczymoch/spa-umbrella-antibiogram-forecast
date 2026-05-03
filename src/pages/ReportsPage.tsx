import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exams, patients, doctors } from '../data/mockData.ts'
import { buildAntibiogramPDFBlob, generateAntibiogramPDF } from '../utils/generatePdf.ts'

/* ── Types ─────────────────────────────────────────────────── */
interface Report {
  id: string
  title: string
  patientName: string
  examId: string
  generatedAt: string
  status: 'ready' | 'generating' | 'error'
  url?: string // preenchido pelo backend futuramente
}

/* ── Mock reports (simulando docs já gerados) ──────────────── */
const MOCK_REPORTS: Report[] = exams.slice(0, 5).map((exam, i) => {
  const patient = patients.find((p) => p.id === exam.patientId)
  return {
    id: `report-${exam.id}`,
    title: `Relatório de Antibiograma — ${exam.organism}`,
    patientName: patient?.name ?? 'Paciente desconhecido',
    examId: exam.id,
    generatedAt: new Date(Date.now() - i * 86_400_000).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
    status: i === 4 ? 'error' : 'ready',
    // URL gerada agora para os mocks já prontos (exceto o de erro)
    url: i === 4 ? undefined : (() => {
      const doctor = doctors.find((d) => d.id === exam.doctorId)
      return buildAntibiogramPDFBlob(exam, patient, doctor)
    })(),
  }
})

/* ── Ícones ────────────────────────────────────────────────── */
const IconPDF = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M9 13h2a2 2 0 0 1 0 4H9v-4z"/>
    <path d="M15 13v4"/>
    <path d="M18 13v1a1 1 0 0 1-1 1h-1"/>
  </svg>
)
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconSpinner = () => (
  <svg className="report-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)
const IconError = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconGenerate = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M5 12l7 7 7-7"/>
  </svg>
)

/* ── Status badge ──────────────────────────────────────────── */
function StatusBadge({ status }: { status: Report['status'] }) {
  if (status === 'ready')
    return <span className="badge badge--ok">Pronto</span>
  if (status === 'generating')
    return <span className="badge badge--warn">Gerando…</span>
  return <span className="badge badge--alert">Erro</span>
}

/* ── Componente principal ──────────────────────────────────── */
export function ReportsPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS)
  const [selectedExamId, setSelectedExamId] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  /* Quando o backend estiver pronto, substituir por fetch real */
  const handleGenerate = async () => {
    if (!selectedExamId) return
    const exam = exams.find((e) => e.id === selectedExamId)
    const patient = patients.find((p) => p.id === exam?.patientId)
    const doctor = doctors.find((d) => d.id === exam?.doctorId)
    if (!exam) return

    const newReport: Report = {
      id: `report-${crypto.randomUUID()}`,
      title: `Relatório de Antibiograma — ${exam.organism}`,
      patientName: patient?.name ?? 'Paciente desconhecido',
      examId: exam.id,
      generatedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'generating',
    }

    setReports((prev) => [newReport, ...prev])
    setRequesting(true)
    setSelectedExamId('')

    // Gera o PDF localmente via jsPDF (mock do que o backend fará futuramente)
    // Quando o backend estiver pronto, substituir por:
    //   const res = await fetch('/api/reports/generate', { method: 'POST', body: JSON.stringify({ examId: exam.id }) })
    //   const data = await res.json()  // { url: '/output/report-xxx.pdf' }
    //   const blobUrl = data.url   ← URL do servidor
    await new Promise((res) => setTimeout(res, 800)) // simula latência
    const blobUrl = buildAntibiogramPDFBlob(exam, patient, doctor)

    setReports((prev) =>
      prev.map((r) =>
        r.id === newReport.id ? { ...r, status: 'ready', url: blobUrl } : r,
      ),
    )
    setRequesting(false)
    showToast('Relatório gerado com sucesso!')
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleDelete = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  const handleDownload = (report: Report) => {
    const exam = exams.find((e) => e.id === report.examId)
    const patient = patients.find((p) => p.id === exam?.patientId)
    const doctor = doctors.find((d) => d.id === exam?.doctorId)
    if (exam) generateAntibiogramPDF(exam, patient, doctor)
  }

  return (
    <div className="page-content">
      {/* Toast */}
      {toast && <div className="profile-toast">{toast}</div>}

      {/* ── Gerador ─────────────────────────────────────────── */}
      <section className="card report-generator">
        <div className="card__header">
          <h2 className="card__title">Gerar novo relatório</h2>
          <p className="card__subtitle">
            Selecione um antibiograma para gerar o documento PDF.
          </p>
        </div>

        <div className="report-generator__form">
          <select
            className="input"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            disabled={requesting}
          >
            <option value="">— Selecione um antibiograma —</option>
            {exams.map((exam) => {
              const pt = patients.find((p) => p.id === exam.patientId)
              return (
                <option key={exam.id} value={exam.id}>
                  {pt?.name ?? 'Paciente'} · {exam.organism} · {exam.collectedAt}
                </option>
              )
            })}
          </select>

          <button
            className="btn btn--primary"
            onClick={handleGenerate}
            disabled={!selectedExamId || requesting}
          >
            {requesting ? (
              <>
                <IconSpinner /> Gerando…
              </>
            ) : (
              <>
                <IconGenerate /> Gerar PDF
              </>
            )}
          </button>
        </div>

        <p className="report-generator__hint">
          💡 PDF gerado localmente via jsPDF. Quando o backend estiver pronto, será substituído pelo documento do servidor.
        </p>
      </section>

      {/* ── Lista de relatórios ─────────────────────────────── */}
      <section className="card" style={{ marginTop: 'var(--space-5)' }}>
        <div className="card__header">
          <h2 className="card__title">Relatórios gerados</h2>
          <span className="badge badge--info">{reports.length} documento{reports.length !== 1 ? 's' : ''}</span>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">📄</span>
            <p className="empty-state__title">Nenhum relatório ainda</p>
            <p className="empty-state__desc">Gere o primeiro relatório usando o formulário acima.</p>
          </div>
        ) : (
          <div className="report-list">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`report-item${report.status === 'generating' ? ' report-item--generating' : ''}`}
              >
                <div className="report-item__icon">
                  <IconPDF />
                </div>
                <div className="report-item__info">
                  <p className="report-item__title">{report.title}</p>
                  <p className="report-item__meta">
                    {report.patientName} · Gerado em {report.generatedAt}
                  </p>
                </div>
                <div className="report-item__status">
                  {report.status === 'generating' ? (
                    <IconSpinner />
                  ) : report.status === 'error' ? (
                    <span title="Erro na geração"><IconError /></span>
                  ) : (
                    <StatusBadge status={report.status} />
                  )}
                </div>
                <div className="report-item__actions">
                  {report.status === 'ready' && report.url && (
                    <>
                      <button
                        className="btn btn--ghost btn--sm"
                        title="Visualizar"
                        onClick={() => {
                          sessionStorage.setItem('biolab:pdf:url', report.url!)
                          navigate(`/pdf-viewer?title=${encodeURIComponent(report.title)}&filename=${encodeURIComponent(report.title + '.pdf')}`)
                        }}
                      >
                        <IconEye />
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        title="Baixar PDF"
                        onClick={() => handleDownload(report)}
                      >
                        <IconDownload />
                      </button>
                    </>
                  )}
                  {report.status !== 'generating' && (
                    <button
                      className="btn btn--ghost btn--sm report-item__delete"
                      title="Remover"
                      onClick={() => handleDelete(report.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
