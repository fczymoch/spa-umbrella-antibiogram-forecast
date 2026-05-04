import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listExams, getExam } from '../api/exams.ts'
import {
  deleteReport,
  generateReport,
  getReport,
  listReports,
} from '../api/reports.ts'
import { listPatients } from '../api/patients.ts'
import { listDoctors } from '../api/doctors.ts'
import {
  buildAntibiogramPDFBlob,
  generateAntibiogramPDF,
} from '../utils/generatePdf.ts'
import { Spinner } from '../components/Spinner.tsx'
import { useToast } from '../contexts/useToast.ts'
import { extractErrorMessage } from '../api/client.ts'

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

function StatusBadge({ status }: { status: 'ready' | 'generating' | 'pending' | 'error' }) {
  if (status === 'ready')      return <span className="badge badge--ok">Pronto</span>
  if (status === 'generating' || status === 'pending') return <span className="badge badge--warn">Gerando…</span>
  return <span className="badge badge--alert">Erro</span>
}

export function ReportsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [selectedExamId, setSelectedExamId] = useState('')

  const reportsQuery = useQuery({
    queryKey: ['reports', { page: 1, limit: 50 }],
    queryFn: () => listReports({ page: 1, limit: 50 }),
    refetchInterval: (query) => {
      // Se há relatórios "generating", refetch em 3s
      const data = query.state.data
      const hasPending = data?.data.some((r) => r.status === 'generating' || r.status === 'pending')
      return hasPending ? 3000 : false
    },
  })

  const examsQuery = useQuery({
    queryKey: ['exams', { page: 1, limit: 100 }],
    queryFn: () => listExams({ page: 1, limit: 100 }),
  })

  const generateMutation = useMutation({
    mutationFn: (examId: string) => generateReport(examId),
    onSuccess: async (response) => {
      toast('Relatório em geração…', 'info')
      setSelectedExamId('')
      // Otimização: invalida a lista para puxar o novo registro com status="generating"
      queryClient.invalidateQueries({ queryKey: ['reports'] })

      // Faz polling até ficar "ready" (max 60s)
      const start = Date.now()
      const pollDelay = 2000
      while (Date.now() - start < 60_000) {
        await new Promise((r) => setTimeout(r, pollDelay))
        try {
          const fresh = await getReport(response.reportId)
          if (fresh.status === 'ready') {
            toast('Relatório gerado com sucesso!', 'success')
            queryClient.invalidateQueries({ queryKey: ['reports'] })
            return
          }
          if (fresh.status === 'error') {
            toast('Falha ao gerar relatório.', 'error')
            queryClient.invalidateQueries({ queryKey: ['reports'] })
            return
          }
        } catch {
          // continua polling
        }
      }
      // Timeout — apenas dispara refetch para refletir o estado atual
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao solicitar geração de relatório'), 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReport(id),
    onSuccess: () => {
      toast('Relatório removido.', 'success')
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao remover relatório'), 'error')
    },
  })

  const handleGenerate = () => {
    if (!selectedExamId) return
    generateMutation.mutate(selectedExamId)
  }

  const handleDelete = (id: string) => {
    if (confirm('Remover este relatório?')) deleteMutation.mutate(id)
  }

  /**
   * Visualiza o PDF.
   * - Se o backend já tem `storageUrl`, redireciona o viewer para essa URL.
   * - Caso contrário, gera um PDF local com jsPDF como fallback (útil enquanto
   *   o storage não está configurado).
   */
  const handleView = async (examId: string, title: string, storageUrl?: string) => {
    if (storageUrl) {
      sessionStorage.setItem('biolab:pdf:url', storageUrl)
    } else {
      try {
        const exam = await getExam(examId)
        // Para o fallback local, busca paciente/doutor pela primeira página
        const [patientsPage, doctorsPage] = await Promise.all([
          listPatients({ limit: 200 }),
          listDoctors({ limit: 200 }),
        ])
        const patient = patientsPage.data.find((p) => p.id === exam.patientId)
        const doctor  = doctorsPage.data.find((d) => d.id === exam.doctorId)
        const blobUrl = buildAntibiogramPDFBlob(exam, patient, doctor)
        sessionStorage.setItem('biolab:pdf:url', blobUrl)
      } catch (error) {
        toast(extractErrorMessage(error, 'Falha ao gerar visualização do PDF'), 'error')
        return
      }
    }
    navigate(
      `/pdf-viewer?title=${encodeURIComponent(title)}&filename=${encodeURIComponent(title + '.pdf')}`,
    )
  }

  const handleDownload = async (examId: string, storageUrl?: string) => {
    if (storageUrl) {
      const a = document.createElement('a')
      a.href = storageUrl
      a.download = ''
      a.click()
      return
    }
    // Fallback: baixa via jsPDF
    try {
      const exam = await getExam(examId)
      const [patientsPage, doctorsPage] = await Promise.all([
        listPatients({ limit: 200 }),
        listDoctors({ limit: 200 }),
      ])
      const patient = patientsPage.data.find((p) => p.id === exam.patientId)
      const doctor  = doctorsPage.data.find((d) => d.id === exam.doctorId)
      generateAntibiogramPDF(exam, patient, doctor)
    } catch (error) {
      toast(extractErrorMessage(error, 'Falha ao baixar PDF'), 'error')
    }
  }

  const reports = reportsQuery.data?.data ?? []
  const exams = examsQuery.data?.data ?? []

  return (
    <div className="page-content">
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
            disabled={generateMutation.isPending || examsQuery.isLoading}
          >
            <option value="">— Selecione um antibiograma —</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {(exam.patientName ?? 'Paciente')} · {exam.organism} · {exam.collectedAt}
              </option>
            ))}
          </select>

          <button
            className="btn btn--primary"
            onClick={handleGenerate}
            disabled={!selectedExamId || generateMutation.isPending}
          >
            {generateMutation.isPending ? (
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
          💡 O backend processa o PDF em background. Quando ficar pronto, ele aparece como "Pronto" abaixo.
        </p>
      </section>

      {/* ── Lista de relatórios ─────────────────────────────── */}
      <section className="card" style={{ marginTop: 'var(--space-5)' }}>
        <div className="card__header">
          <h2 className="card__title">Relatórios gerados</h2>
          <span className="badge badge--info">{reports.length} documento{reports.length !== 1 ? 's' : ''}</span>
        </div>

        {reportsQuery.isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <Spinner size="lg" />
          </div>
        ) : reportsQuery.isError ? (
          <div style={{ padding: 'var(--space-4)' }}>
            <p className="muted">Erro ao carregar relatórios: {extractErrorMessage(reportsQuery.error)}</p>
            <button className="btn btn--primary" onClick={() => reportsQuery.refetch()} style={{ marginTop: 'var(--space-3)' }}>
              Tentar novamente
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">📄</span>
            <p className="empty-state__title">Nenhum relatório ainda</p>
            <p className="empty-state__desc">Gere o primeiro relatório usando o formulário acima.</p>
          </div>
        ) : (
          <div className="report-list">
            {reports.map((report) => {
              const isPending = report.status === 'generating' || report.status === 'pending'
              return (
                <div
                  key={report.id}
                  className={`report-item${isPending ? ' report-item--generating' : ''}`}
                >
                  <div className="report-item__icon">
                    <IconPDF />
                  </div>
                  <div className="report-item__info">
                    <p className="report-item__title">{report.title}</p>
                    <p className="report-item__meta">
                      {report.patientName ?? 'Paciente'} · {report.generatedAt
                        ? `Gerado em ${new Date(report.generatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`
                        : 'Aguardando geração'}
                    </p>
                  </div>
                  <div className="report-item__status">
                    {isPending ? (
                      <IconSpinner />
                    ) : report.status === 'error' ? (
                      <span title="Erro na geração"><IconError /></span>
                    ) : (
                      <StatusBadge status={report.status} />
                    )}
                  </div>
                  <div className="report-item__actions">
                    {report.status === 'ready' && (
                      <>
                        <button
                          className="btn btn--ghost btn--sm"
                          title="Visualizar"
                          onClick={() => handleView(report.examId, report.title, report.storageUrl)}
                        >
                          <IconEye />
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          title="Baixar PDF"
                          onClick={() => handleDownload(report.examId, report.storageUrl)}
                        >
                          <IconDownload />
                        </button>
                      </>
                    )}
                    {!isPending && (
                      <button
                        className="btn btn--ghost btn--sm report-item__delete"
                        title="Remover"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(report.id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
