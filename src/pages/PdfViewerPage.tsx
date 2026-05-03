import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const IconOpenNew = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

export function PdfViewerPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Inicializa diretamente do sessionStorage — sem efeito cascata
  const [url] = useState<string | null>(() => sessionStorage.getItem('biolab:pdf:url'))
  const title = params.get('title') ?? 'Relatório PDF'
  const filename = params.get('filename') ?? 'relatorio.pdf'

  const handleDownload = () => {
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  return (
    <div className="pdf-viewer-shell">
      {/* ── Topbar ──────────────────────────────────────────── */}
      <header className="pdf-viewer-topbar">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
          <IconArrowLeft /> Voltar
        </button>

        <div className="pdf-viewer-topbar__title">
          <span className="pdf-viewer-topbar__label">📄</span>
          <span>{title}</span>
        </div>

        <div className="pdf-viewer-topbar__actions">
          {url && (
            <>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost btn--sm"
                title="Abrir em nova aba"
              >
                <IconOpenNew /> Abrir em nova aba
              </a>
              <button className="btn btn--primary btn--sm" onClick={handleDownload}>
                <IconDownload /> Baixar PDF
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── Viewer ──────────────────────────────────────────── */}
      <main className="pdf-viewer-body">
        {url ? (
          <iframe
            src={url}
            title={title}
            className="pdf-viewer-iframe"
          />
        ) : (
          <div className="pdf-viewer-empty">
            <span style={{ fontSize: '3rem' }}>📄</span>
            <p>Nenhum documento disponível.</p>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
              ← Voltar para Relatórios
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
