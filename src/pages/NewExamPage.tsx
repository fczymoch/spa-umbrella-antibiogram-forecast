import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Patient } from '../types.ts'

interface NewExamPageProps { patients: Patient[] }
type Step = 'select' | 'running' | 'done'
interface TerminalLine { text: string; type: string }
interface ImageItem    { label: string; url: string }
interface ImageGroup   { name: string; images: ImageItem[] }
interface ImagesResult { groups: ImageGroup[]; flat: ImageItem[] }

const SERVER_URL = 'http://localhost:3333'
const is75px = (img: ImageItem) => img.label.includes('75px') || img.url.includes('75px')
const riskClass = (risk: string) =>
  risk === 'Vermelho' ? 'alert' : risk === 'Amarelo' ? 'warn' : 'ok'

export function NewExamPage({ patients }: NewExamPageProps) {
  const navigate = useNavigate()
  const [step, setStep]         = useState<Step>('select')
  const [query, setQuery]       = useState('')
  const [patient, setPatient]   = useState<Patient | null>(null)
  const [lines, setLines]       = useState<TerminalLine[]>([])
  const [images, setImages]     = useState<ImagesResult | null>(null)
  const [logOpen, setLogOpen]   = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const terminalRef             = useRef<HTMLDivElement>(null)
  const esRef                   = useRef<EventSource | null>(null)

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.bed.toLowerCase().includes(query.toLowerCase())
  )

  const pushLine = (line: TerminalLine) => {
    setLines(prev => [...prev, line])
    requestAnimationFrame(() => {
      if (terminalRef.current)
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    })
  }

  const reset = () => {
    esRef.current?.close()
    setStep('select'); setPatient(null); setQuery('')
    setLines([]); setImages(null); setLogOpen(false)
  }

  const startExam = (p: Patient) => {
    setPatient(p); setLines([]); setImages(null)
    esRef.current?.close()
    const es = new EventSource(`${SERVER_URL}/api/run`)
    esRef.current = es
    setStep('running')

    es.onmessage = (e) => {
      const data = JSON.parse(e.data) as { type: string; text: string }
      if (data.type === 'exit') {
        es.close()
        fetch(`${SERVER_URL}/api/images`)
          .then(r => r.json())
          .then((res: ImagesResult) => { setImages(res); setStep('done') })
          .catch(() => setStep('done'))
        return
      }
      pushLine(data)
    }

    es.onerror = () => {
      pushLine({ type: 'error', text: '[ERRO] Não foi possível conectar ao servidor. Verifique se "npm run server" está rodando.' })
      es.close(); setStep('done')
    }
  }

  const lineClass = (type: string) => {
    if (type === 'cmd' || type === 'info')    return 'terminal-line terminal-line--cmd'
    if (type === 'error' || type === 'err')   return 'terminal-line terminal-line--err'
    if (type === 'stderr' || type === 'warn') return 'terminal-line terminal-line--warn'
    if (type === 'ok')                        return 'terminal-line terminal-line--ok'
    return 'terminal-line'
  }

  const galleryGroups = images
    ? images.groups
        .map(g => ({ ...g, images: g.images.filter(is75px) }))
        .filter(g => g.images.length > 0)
    : []

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <Link className="pill subtle" to="/app/exams"
            style={{ marginBottom: 'var(--space-2)', display: 'inline-block' }}>
            ← Voltar
          </Link>
          <p className="eyebrow">Novo antibiograma</p>
          <h1>Criar análise</h1>
        </div>
      </div>

      <div className="new-exam-steps">
        <div className={`new-exam-step ${step === 'select' ? 'active' : 'done'}`}>
          <span className="new-exam-step__num">1</span>
          <span className="new-exam-step__label">Paciente</span>
        </div>
        <div className="new-exam-step__connector" />
        <div className={`new-exam-step ${step === 'select' ? '' : step === 'running' ? 'active' : 'done'}`}>
          <span className="new-exam-step__num">2</span>
          <span className="new-exam-step__label">Executando</span>
        </div>
        <div className="new-exam-step__connector" />
        <div className={`new-exam-step ${step === 'done' ? 'done active' : ''}`}>
          <span className="new-exam-step__num">3</span>
          <span className="new-exam-step__label">Resultados</span>
        </div>
      </div>

      {/* Step 1 */}
      {step === 'select' && (
        <section className="card">
          <div className="card-header">
            <h3>Buscar paciente</h3>
            <span className="pill subtle">{patients.length} pacientes</span>
          </div>

          <div className="new-exam-search-wrap">
            <span className="new-exam-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input autoFocus type="text" className="new-exam-search-input"
              placeholder="Nome ou leito..." value={query}
              onChange={e => setQuery(e.target.value)} />
          </div>

          {query.trim() && filtered.length === 0 && (
            <p className="muted small" style={{ marginTop: 'var(--space-3)' }}>
              Nenhum resultado para "{query}".
            </p>
          )}

          <ul className="new-exam-patient-list">
            {(query.trim() ? filtered : patients).map(p => (
              <li key={p.id}>
                <button type="button" className="new-exam-patient-btn" onClick={() => startExam(p)}>
                  <span className="new-exam-patient-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </span>
                  <span className="new-exam-patient-info">
                    <span className="new-exam-patient-name">{p.name}</span>
                    <span className="new-exam-patient-meta">Leito: {p.bed} · {p.age} anos</span>
                  </span>
                  <span className={`pill status ${riskClass(p.risk)}`}>{p.risk}</span>
                  <span className="new-exam-patient-arrow">→</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Steps 2 e 3 */}
      {(step === 'running' || step === 'done') && patient && (
        <>
          <div className="new-exam-selected-patient">
            <span className="new-exam-selected-patient__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3h6M9 3v7l-4.5 8A2 2 0 0 0 6.31 21h11.38a2 2 0 0 0 1.81-3L15 10V3M9 3H6M15 3h3" />
              </svg>
            </span>
            <div>
              <p className="list-title">{patient.name}</p>
              <p className="muted small">Leito: {patient.bed} · {patient.age} anos</p>
            </div>
            <span className={`pill status ${riskClass(patient.risk)}`}>{patient.risk}</span>
          </div>

          {/* Terminal */}
          <section className="card">
            <div className="card-header">
              <h3>Log de execução</h3>
              <div className="chips">
                <span className="terminal-dot terminal-dot--red" />
                <span className="terminal-dot terminal-dot--yellow" />
                <span className="terminal-dot terminal-dot--green" />
                {step === 'running'
                  ? <span className="pill status warn" style={{ marginLeft: 'var(--space-2)' }}>Em execução…</span>
                  : <span className="pill status ok"   style={{ marginLeft: 'var(--space-2)' }}>Concluído</span>
                }
                {step === 'done' && (
                  <button type="button" className="ghost small"
                    style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}
                    onClick={() => setLogOpen(v => !v)}>
                    {logOpen ? '▲ Recolher' : '▼ Ver log'}
                  </button>
                )}
              </div>
            </div>
            <div className="terminal-window" ref={terminalRef}
              style={step === 'done' && !logOpen ? { maxHeight: '120px', overflow: 'hidden' } : undefined}>
              {lines.length === 0 && step === 'running' && (
                <div className="terminal-line terminal-line--cmd">Aguardando saída…</div>
              )}
              {lines.map((l, i) => (
                <div key={i} className={lineClass(l.type)}>{l.text}</div>
              ))}
              {step === 'running' && (
                <div className="terminal-line"><span className="terminal-cursor__blink">█</span></div>
              )}
            </div>
          </section>

          {/* Galeria 75px */}
          {step === 'done' && galleryGroups.length > 0 && (
            <section className="card">
              <div className="card-header">
                <h3>Resultados</h3>
                <span className="pill subtle">{galleryGroups.length} discos</span>
              </div>
              {galleryGroups.map(group => (
                <div key={group.name} className="results-section">
                  <p className="results-section__title">{group.name}</p>
                  <div className="results-gallery">
                    {group.images.map(img => (
                      <button key={img.url} type="button" className="results-gallery__item"
                        onClick={() => setLightbox(`${SERVER_URL}${img.url}`)} title={img.label}>
                        <img src={`${SERVER_URL}${img.url}`} alt={img.label} className="results-gallery__img" />
                        <span className="results-gallery__label">{img.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {step === 'done' && (
            <div className="new-exam-done__actions" style={{ paddingBottom: 'var(--space-8)' }}>
              <button type="button" className="btn btn--primary" onClick={() => navigate('/app/exams')}>
                Ver antibiogramas
              </button>
              <button type="button" className="ghost" onClick={reset}>
                Nova análise
              </button>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}
          role="dialog" aria-modal="true" aria-label="Imagem ampliada">
          <img src={lightbox} alt="Resultado" className="lightbox-img" />
          <button type="button" className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  )
}
