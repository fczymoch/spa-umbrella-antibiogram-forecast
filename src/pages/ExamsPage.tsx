import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Doctor, Exam, Patient, User } from '../types.ts'
import { statusClass } from '../utils/status.ts'
interface ExamsPageProps {
  exams: Exam[]
  patients: Patient[]
  doctors: Doctor[]
  user: User | null
}

export function ExamsPage({ exams, patients, doctors, user }: ExamsPageProps) {
  const [searchParams] = useSearchParams()
  const viewParam = searchParams.get('view') === 'mine' ? 'mine' : 'all'
  const [patientSearch, setPatientSearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getPatient = useCallback(
    (id: string) => patients.find((p) => p.id === id)?.name || 'Paciente',
    [patients],
  )
  const getDoctor = useCallback(
    (id: string) => doctors.find((d) => d.id === id)?.name || 'Médico',
    [doctors],
  )

  const parseCollectedAt = useCallback((value: string) => {
    const normalized = value.replace(' ', 'T')
    const date = new Date(normalized)
    return Number.isNaN(date.getTime()) ? null : date
  }, [])

  const formatDateTime = useCallback(
    (value: string) => {
      const date = parseCollectedAt(value)
      if (!date) return value
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    [parseCollectedAt],
  )

  const formatDateOnly = useCallback((value: string) => {
    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('pt-BR')
  }, [])

  const availableStatuses = useMemo<string[]>(
    () => Array.from(new Set(exams.map((exam) => exam.status))).sort(),
    [exams],
  )

  const filteredExams = useMemo(() => {
    let data = [...exams]
    if (viewParam === 'mine' && user?.doctorId) {
      data = data.filter((exam) => exam.doctorId === user.doctorId)
    }
    if (statusFilter.length) {
      data = data.filter((exam) => statusFilter.includes(exam.status))
    }
    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`)
      data = data.filter((exam) => {
        const collected = parseCollectedAt(exam.collectedAt)
        return collected && collected >= from
      })
    }
    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59.999`)
      data = data.filter((exam) => {
        const collected = parseCollectedAt(exam.collectedAt)
        return collected && collected <= to
      })
    }
    if (patientSearch.trim()) {
      const term = patientSearch.toLowerCase()
      data = data.filter((exam) => getPatient(exam.patientId).toLowerCase().includes(term))
    }
    if (doctorSearch.trim()) {
      const term = doctorSearch.toLowerCase()
      data = data.filter((exam) => getDoctor(exam.doctorId).toLowerCase().includes(term))
    }
    return data.sort((a, b) => {
      const da = parseCollectedAt(a.collectedAt)
      const db = parseCollectedAt(b.collectedAt)
      if (!da || !db) return 0
      return db.getTime() - da.getTime()
    })
  }, [dateFrom, dateTo, doctorSearch, exams, getDoctor, getPatient, parseCollectedAt, patientSearch, statusFilter, user, viewParam])

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedExams = filteredExams.slice(startIndex, startIndex + itemsPerPage)

  const resetPage = () => setCurrentPage(1)
  const hasActiveFilters = statusFilter.length > 0 || dateFrom || dateTo || patientSearch || doctorSearch

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Monitoramento de laudos</p>
          <h1>Antibiogramas</h1>
        </div>
        <Link to="/app/exams/new" className="btn btn--primary btn--cta">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo antibiograma
        </Link>
      </div>

      <div className="card filter-panel">
        <h3>Filtros</h3>

        <div className="filter-row">
          <span className="filter-label">Status:</span>
          <div className="filter-status-buttons">
            {availableStatuses.map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-status-btn${statusFilter.includes(status) ? ' active' : ''}`}
                aria-pressed={statusFilter.includes(status)}
                onClick={() => {
                  setStatusFilter((prev) =>
                    prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
                  )
                  resetPage()
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-date-grid">
          <div>
            <label className="filter-label" htmlFor="date-from">Data inicial:</label>
            <input
              id="date-from"
              type="date"
              className="filter-date-input"
              inputMode="none"
              onKeyDown={(e) => e.preventDefault()}
              onClick={(e) => e.currentTarget.showPicker?.()}
              lang="pt-BR"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); resetPage() }}
            />
          </div>
          <div>
            <label className="filter-label" htmlFor="date-to">Data final:</label>
            <input
              id="date-to"
              type="date"
              className="filter-date-input"
              inputMode="none"
              onKeyDown={(e) => e.preventDefault()}
              onClick={(e) => e.currentTarget.showPicker?.()}
              lang="pt-BR"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); resetPage() }}
            />
          </div>
        </div>

        <div className="filter-search-grid">
          <div>
            <label className="filter-label" htmlFor="search-patient">Buscar paciente:</label>
            <input
              id="search-patient"
              type="text"
              className="filter-search-input"
              placeholder="Digite o nome do paciente"
              value={patientSearch}
              onChange={(e) => { setPatientSearch(e.target.value); resetPage() }}
            />
          </div>
          <div>
            <label className="filter-label" htmlFor="search-doctor">Buscar médico:</label>
            <input
              id="search-doctor"
              type="text"
              className="filter-search-input"
              placeholder="Digite o nome do médico"
              value={doctorSearch}
              onChange={(e) => { setDoctorSearch(e.target.value); resetPage() }}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="active-filters-bar">
            <span className="active-filters-label">Filtros ativos:</span>
            {statusFilter.map((status) => (
              <span key={status} className="pill subtle">Status: {status}</span>
            ))}
            {dateFrom && <span className="pill subtle">De: {formatDateOnly(dateFrom)}</span>}
            {dateTo && <span className="pill subtle">Até: {formatDateOnly(dateTo)}</span>}
            {patientSearch && <span className="pill subtle">Paciente: {patientSearch}</span>}
            {doctorSearch && <span className="pill subtle">Médico: {doctorSearch}</span>}
            <button
              className="ghost"
              type="button"
              style={{ marginLeft: 'auto' }}
              onClick={() => {
                setStatusFilter([])
                setDateFrom('')
                setDateTo('')
                setPatientSearch('')
                setDoctorSearch('')
                resetPage()
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      <section className="card" aria-label="Lista de antibiogramas">
        <div className="card-header">
          <h3>Lista de antibiogramas</h3>
          <div className="chips">
            <span className="pill subtle" role="status" aria-live="polite">{filteredExams.length} registros</span>
            {totalPages > 1 && (
              <span className="muted small">Página {currentPage} de {totalPages}</span>
            )}
          </div>
        </div>

        {paginatedExams.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p className="muted">Nenhum antibiograma encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <ul className="list">
            {paginatedExams.map((exam) => (
              <li key={exam.id} className="list-row">
                <div>
                  <p className="list-title">{exam.organism}</p>
                  <p className="muted small">{exam.specimen} • {exam.site}</p>
                  <p className="muted small">
                    Paciente: {getPatient(exam.patientId)} • Médico: {getDoctor(exam.doctorId)}
                  </p>
                </div>
                <div className="list-meta">
                  <span className={`pill status ${statusClass(exam.status)}`}>{exam.status}</span>
                  <span className="muted small">{formatDateTime(exam.collectedAt)}</span>
                  <Link className="pill subtle" to={`/app/exams/${exam.id}`}>Ver detalhe →</Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Paginação de resultados">
            <button
              className="pill subtle pagination-btn"
              disabled={currentPage === 1}
              aria-label="Página anterior"
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Anterior
            </button>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-page${page === currentPage ? ' active' : ''}`}
                  aria-label={`Ir para página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="pill subtle pagination-btn"
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Próxima →
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}
