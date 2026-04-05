import { useState } from 'react'

interface OneDriveFile {
  id: string
  name: string
  webUrl: string
  thumbnailUrl?: string
  size: number
  lastModified: string
}

export function AdminPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [files, setFiles] = useState<OneDriveFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectOneDrive = async () => {
    setLoading(true)
    setError(null)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const mockFiles: OneDriveFile[] = [
      {
        id: '1',
        name: 'antibiograma_klebsiella_001.jpg',
        webUrl: 'https://onedrive.com/file1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300',
        size: 2048576,
        lastModified: '2026-02-28T10:30:00Z',
      },
      {
        id: '2',
        name: 'cultura_ecoli_lab23.png',
        webUrl: 'https://onedrive.com/file2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300',
        size: 1536000,
        lastModified: '2026-03-01T08:15:00Z',
      },
      {
        id: '3',
        name: 'mrsa_swab_paciente_204.jpg',
        webUrl: 'https://onedrive.com/file3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300',
        size: 3072000,
        lastModified: '2026-03-01T14:45:00Z',
      },
      {
        id: '4',
        name: 'resultado_hemocultura_uti03.jpg',
        webUrl: 'https://onedrive.com/file4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=300',
        size: 1800000,
        lastModified: '2026-02-29T16:20:00Z',
      },
    ]
    setFiles(mockFiles)
    setIsConnected(true)
    setLoading(false)
  }

  const disconnectOneDrive = () => {
    setIsConnected(false)
    setFiles([])
    setSelectedFiles([])
    setError(null)
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId],
    )
  }

  const importSelected = () => {
    if (selectedFiles.length === 0) {
      setError('Selecione pelo menos um arquivo para importar')
      return
    }
    const selectedFileNames = files
      .filter((f) => selectedFiles.includes(f.id))
      .map((f) => f.name)
      .join(', ')
    alert(`${selectedFiles.length} arquivo(s) importado(s):\n${selectedFileNames}\n\nOs antibiogramas foram atualizados com as novas imagens.`)
    setSelectedFiles([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Configurações avançadas</p>
          <h1>Administrador</h1>
          <p className="muted small">Integração OneDrive e gestão de arquivos</p>
        </div>
        <div>
          {isConnected ? (
            <span className="pill status ok">Conectado ao OneDrive</span>
          ) : (
            <span className="pill subtle">Desconectado</span>
          )}
        </div>
      </div>

      {/* Connection Card */}
      <section className="card">
        <div className="card-header">
          <h3>Conexão OneDrive</h3>
          <span className="pill subtle">Microsoft Graph API</span>
        </div>

        {!isConnected ? (
          <div style={{ padding: 'var(--space-4)' }}>
            <p className="muted" style={{ marginBottom: 'var(--space-4)' }}>
              Conecte-se ao OneDrive para importar imagens de antibiogramas diretamente da nuvem.
            </p>
            <div className="onedrive-info-box">
              <p className="muted small"><strong>Como funciona:</strong></p>
              <ul className="muted small">
                <li>Autentica via OAuth 2.0 com Microsoft</li>
                <li>Acessa arquivos da pasta configurada</li>
                <li>Suporta imagens (JPG, PNG, TIFF)</li>
                <li>Preview antes de importar</li>
              </ul>
            </div>
            <button
              className="pill status ok"
              onClick={connectOneDrive}
              disabled={loading}
              style={{ padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--font-size-base)' }}
            >
              {loading ? 'Conectando...' : 'Conectar ao OneDrive'}
            </button>
          </div>
        ) : (
          <div className="onedrive-status-row" style={{ padding: 'var(--space-4)' }}>
            <div>
              <p className="muted small">Conta conectada com sucesso</p>
              <p className="muted small">Pasta: <strong>/Antibiogramas/Imagens</strong></p>
            </div>
            <button className="pill subtle" onClick={disconnectOneDrive}>
              Desconectar
            </button>
          </div>
        )}
      </section>

      {/* Files Grid */}
      {isConnected && (
        <section className="card">
          <div className="card-header">
            <h3>Arquivos disponíveis</h3>
            <div className="chips">
              <span className="pill subtle">{files.length} arquivos</span>
              {selectedFiles.length > 0 && (
                <span className="pill status ok">{selectedFiles.length} selecionados</span>
              )}
            </div>
          </div>

          {error && <div className="admin-error-box">{error}</div>}

          <div className="file-grid">
            {files.map((file) => {
              const isSelected = selectedFiles.includes(file.id)
              return (
                <div
                  key={file.id}
                  className={`file-card${isSelected ? ' selected' : ''}`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  <div className="file-card-thumb">
                    {file.thumbnailUrl ? (
                      <img src={file.thumbnailUrl} alt={file.name} />
                    ) : (
                      <span className="muted">📄</span>
                    )}
                  </div>
                  <div className="file-card-info">
                    <p className="file-card-name">{file.name}</p>
                    <div className="file-card-meta">
                      <p>{formatFileSize(file.size)}</p>
                      <p>{formatDate(file.lastModified)}</p>
                    </div>
                    {isSelected && (
                      <span className="pill status ok" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                        Selecionado
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedFiles.length > 0 && (
            <div className="import-actions">
              <button
                className="pill status ok"
                onClick={importSelected}
                style={{ padding: 'var(--space-3) var(--space-8)', fontSize: 'var(--font-size-base)' }}
              >
                📥 Importar {selectedFiles.length} arquivo(s)
              </button>
            </div>
          )}
        </section>
      )}

      {/* Integration Info */}
      <section className="card">
        <div className="card-header">
          <h3>Informações de integração</h3>
        </div>
        <div className="integration-section">
          <div className="integration-block">
            <h4>🔐 Autenticação</h4>
            <p className="muted small">
              A integração usa OAuth 2.0 da Microsoft. Suas credenciais não são armazenadas localmente.
            </p>
          </div>
          <div className="integration-block">
            <h4>📂 Formatos suportados</h4>
            <p className="muted small">JPG, JPEG, PNG, TIFF, PDF (páginas de imagem)</p>
          </div>
          <div className="integration-block">
            <h4>⚙️ Configuração em produção</h4>
            <p className="muted small">Para ativar em ambiente real, configure:</p>
            <pre className="code-block">{`VITE_ONEDRIVE_CLIENT_ID=seu-client-id
VITE_ONEDRIVE_REDIRECT_URI=https://seu-app.com/auth/callback
VITE_ONEDRIVE_SCOPE=Files.Read.All`}</pre>
          </div>
        </div>
      </section>
    </div>
  )
}
