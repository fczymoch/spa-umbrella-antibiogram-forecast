import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listPatients, type ListPatientsParams } from '../api/patients.ts'
import { listExams } from '../api/exams.ts'
import { Spinner } from '../components/Spinner.tsx'
import { extractErrorMessage } from '../api/client.ts'
import { statusClass } from '../utils/status.ts'
import type { PatientRisk } from '../types.ts'

const RISKS: PatientRisk[] = ['Verde', 'Amarelo', 'Vermelho']
const ITEMS_PER_PAGE = 20

export function PatientsPage() {
  const [search, setSearch] = useState('')
  const [risk, setRisk] = useState<PatientRisk | ''>('')
  const [page, setPage] = useState(1)

  const params = useMemo<ListPatientsParams>(() => ({
    search: search.trim() || undefined,
    risk: risk || undefined,
    page,
    limit: ITEMS_PER_PAGE,
  }), [search, risk, page])

  const patientsQuery = useQuery({
    queryKey: ['patients', params],
    queryFn: () => listPatients(params),
    placeholderData: keepPreviousData,
  })

  // Para a contagem "X antibiogramas" por paciente, fazemos uma busca
  // simples nos exames carregados (limitada — apenas para a página atual).
  // Quando há muitos exames, o backend deveria retornar essa contagem.
  const examsQuery = useQuery({
    queryKey: ['exams', { all: true }],
    queryFn: () => listExams({ page: 1, limit: 200 }),
  })

  const patients = patientsQuery.data?.data ?? []
  const total    = patientsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  const examsByPatient = useMemo(() => {
    const map: Record<string, number> = {}
    for (const ex of examsQuery.data?.data ?? []) {
      map[ex.patientId] = (map[ex.patientId] || 0) + 1
    }
    return map
  }, [examsQuery.data])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Risco assistencial</p>
          <h1>Pacientes (antibiogramas)</h1>
        </div>
      </div>

      <div className="card filter-panel">
        <div className="filter-row">
          <span className="filter-label">Risco:</span>
          <div className="filter-status-buttons">
            <button
              type="button"
              className={`filter-status-btn${risk === '' ? ' active' : ''}`}
              onClick={() => { setRisk(''); setPage(1) }}
            >
              Todos
            </button>
            {RISKS.map((r) => (
              <button
                key={r}
                type="button"
                className={`filter-status-btn${risk === r ? ' active' : ''}`}
                onClick={() => { setRisk(r); setPage(1) }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-search-grid">
          <div>
            <label className="filter-label" htmlFor="search-patient">Buscar:</label>
            <input
              id="search-patient"
              type="text"
              className="filter-search-input"
              placeholder="Nome ou leito..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <h3>Pacientes monitorados</h3>
          <span className="pill subtle">{total} ativos</span>
        </div>

        {patientsQuery.isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <Spinner size="lg" />
          </div>
        ) : patientsQuery.isError ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p className="muted">Erro ao carregar pacientes: {extractErrorMessage(patientsQuery.error)}</p>
            <button className="btn btn--primary" onClick={() => patientsQuery.refetch()} style={{ marginTop: 'var(--space-3)' }}>
              Tentar novamente
            </button>
          </div>
        ) : patients.length === 0 ? (
          <p className="muted" style={{ padding: 'var(--space-4)' }}>
            Nenhum paciente encontrado.
          </p>
        ) : (
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
                  <span className="muted small">{examsByPatient[patient.id] ?? 0} antibiogramas</span>
                  <Link className="pill subtle" to={`/app/patients/${patient.id}`}>
                    Ver detalhes
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Paginação de resultados">
            <button
              className="pill subtle pagination-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Anterior
            </button>
            <span className="muted small">Página {page} de {totalPages}</span>
            <button
              className="pill subtle pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Próxima →
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}
