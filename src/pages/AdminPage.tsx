import { useState } from 'react'
import { doctors, exams, patients } from '../data/mockData.ts'

type AdminTab = 'overview' | 'users' | 'onedrive' | 'system'

interface MockUser {
  id: string; name: string; email: string; role: string; shift: string; status: 'Ativo' | 'Inativo'
}

const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'Dr. Carlos Martins',  email: 'carlos.martins@biolab.com',  role: 'Infectologista',     shift: '07h – 19h', status: 'Ativo'  },
  { id: 'u2', name: 'Dra. Helena Rocha',   email: 'helena.rocha@biolab.com',    role: 'Clínica Geral',      shift: '12h – 20h', status: 'Ativo'  },
  { id: 'u3', name: 'Dr. Eduardo Lopes',   email: 'eduardo.lopes@biolab.com',   role: 'Intensivista',       shift: 'Noite',      status: 'Ativo'  },
  { id: 'u4', name: 'Dra. Patrícia Nunes', email: 'patricia.nunes@biolab.com',  role: 'Microbiologia',      shift: '08h – 16h', status: 'Ativo'  },
  { id: 'u5', name: 'Dr. Rafael Moura',    email: 'rafael.moura@biolab.com',    role: 'Pneumologia',        shift: '07h – 15h', status: 'Inativo' },
  { id: 'u6', name: 'Dra. Camila Dias',    email: 'camila.dias@biolab.com',     role: 'Cardiologia',        shift: '10h – 18h', status: 'Ativo'  },
]

const SCRIPT_OPTIONS = [
  'GerarGrafico2D_DetectarHalo_v2.py',
  'GerarGrafico2D_DetectarHalo_v3_azul.py',
]

export function AdminPage() {
  const [tab, setTab]                 = useState<AdminTab>('overview')
  const [users, setUsers]             = useState<MockUser[]>(MOCK_USERS)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [scriptName, setScriptName]   = useState(SCRIPT_OPTIONS[1])
  const [serverPort, setServerPort]   = useState('3333')
  const [scriptSaved, setScriptSaved] = useState(false)

  const pendingExams    = exams.filter(e => e.status === 'Pendente').length
  const inAnalysis      = exams.filter(e => e.status === 'Em análise').length
  const pendingReview   = exams.filter(e => e.status === 'Pendente de avaliação').length
  const finalized       = exams.filter(e => e.status === 'Finalizado').length
  const activeUsers     = users.filter(u => u.status === 'Ativo').length

  const toggleUserStatus = (id: string) =>
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' }
      : u
    ))

  const connectOneDrive = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setIsConnected(true)
    setLoading(false)
  }

  const saveSystemSettings = () => {
    setScriptSaved(true)
    setTimeout(() => setScriptSaved(false), 2500)
  }

  const TABS: { key: AdminTab; label: string }[] = [
    { key: 'overview', label: 'Visão geral' },
    { key: 'users',    label: 'Usuários'    },
    { key: 'onedrive', label: 'OneDrive'    },
    { key: 'system',   label: 'Sistema'     },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Configurações avançadas</p>
          <h1>Administrador</h1>
        </div>
        <span className="pill status ok">Admin</span>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t.key} type="button"
            className={`admin-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Visão Geral ── */}
      {tab === 'overview' && (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <p className="admin-stat__num">{exams.length}</p>
              <p className="admin-stat__label">Total de exames</p>
            </div>
            <div className="admin-stat">
              <p className="admin-stat__num">{patients.length}</p>
              <p className="admin-stat__label">Pacientes</p>
            </div>
            <div className="admin-stat">
              <p className="admin-stat__num">{doctors.length}</p>
              <p className="admin-stat__label">Médicos</p>
            </div>
            <div className="admin-stat">
              <p className="admin-stat__num">{activeUsers}</p>
              <p className="admin-stat__label">Usuários ativos</p>
            </div>
          </div>

          <section className="card">
            <div className="card-header"><h3>Distribuição de status</h3></div>
            <div className="admin-status-bars">
              {[
                { label: 'Pendente',              count: pendingExams,  cls: 'pending', total: exams.length },
                { label: 'Em análise',            count: inAnalysis,    cls: 'warn',    total: exams.length },
                { label: 'Pendente de avaliação', count: pendingReview, cls: 'info',    total: exams.length },
                { label: 'Finalizado',            count: finalized,     cls: 'ok',      total: exams.length },
              ].map(s => (
                <div key={s.label} className="admin-bar-row">
                  <span className="admin-bar-label">{s.label}</span>
                  <div className="admin-bar-track">
                    <div
                      className={`admin-bar-fill admin-bar-fill--${s.cls}`}
                      style={{ width: `${(s.count / s.total) * 100}%` }}
                    />
                  </div>
                  <span className="admin-bar-count">{s.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-header"><h3>Atividade recente</h3></div>
            <ul className="admin-activity-list">
              {exams.slice(0, 6).map(e => (
                <li key={e.id} className="admin-activity-item">
                  <span className={`pill status ${e.status === 'Finalizado' ? 'ok' : e.status === 'Pendente' ? 'pending' : e.status === 'Em análise' ? 'warn' : 'info'}`} style={{ minWidth: '160px', justifyContent: 'center' }}>
                    {e.status}
                  </span>
                  <span className="admin-activity-label">{e.organism}</span>
                  <span className="muted small">{e.collectedAt}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* ── Usuários ── */}
      {tab === 'users' && (
        <section className="card">
          <div className="card-header">
            <h3>Gerenciamento de usuários</h3>
            <div className="chips">
              <span className="pill subtle">{users.length} usuários</span>
              <span className="pill status ok">{activeUsers} ativos</span>
            </div>
          </div>

          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Função</th>
                  <th>Turno</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={u.status === 'Inativo' ? 'user-table__row--inactive' : ''}>
                    <td className="user-table__name">{u.name}</td>
                    <td className="muted small">{u.email}</td>
                    <td>{u.role}</td>
                    <td className="muted small">{u.shift}</td>
                    <td>
                      <span className={`pill status ${u.status === 'Ativo' ? 'ok' : 'pending'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="ghost small"
                        onClick={() => toggleUserStatus(u.id)}>
                        {u.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── OneDrive ── */}
      {tab === 'onedrive' && (
        <>
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
                <div className="admin-info-box">
                  <p className="muted small"><strong>Como funciona:</strong></p>
                  <ul className="muted small">
                    <li>Autentica via OAuth 2.0 com Microsoft</li>
                    <li>Acessa arquivos da pasta configurada</li>
                    <li>Suporta imagens (JPG, PNG, TIFF)</li>
                  </ul>
                </div>
                <button className="btn btn--primary" onClick={connectOneDrive} disabled={loading}>
                  {loading ? 'Conectando…' : 'Conectar ao OneDrive'}
                </button>
              </div>
            ) : (
              <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="muted small">Conta conectada com sucesso</p>
                  <p className="muted small">Pasta: <strong>/Antibiogramas/Imagens</strong></p>
                </div>
                <button className="ghost" onClick={() => setIsConnected(false)}>Desconectar</button>
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-header"><h3>Informações de integração</h3></div>
            <div className="admin-info-grid">
              <div className="admin-info-block">
                <h4>🔐 Autenticação</h4>
                <p className="muted small">OAuth 2.0 da Microsoft. Credenciais não armazenadas localmente.</p>
              </div>
              <div className="admin-info-block">
                <h4>📂 Formatos suportados</h4>
                <p className="muted small">JPG, JPEG, PNG, TIFF, PDF</p>
              </div>
              <div className="admin-info-block" style={{ gridColumn: '1 / -1' }}>
                <h4>⚙️ Variáveis de ambiente</h4>
                <pre className="code-block">{`VITE_ONEDRIVE_CLIENT_ID=seu-client-id\nVITE_ONEDRIVE_REDIRECT_URI=https://seu-app.com/auth/callback\nVITE_ONEDRIVE_SCOPE=Files.Read.All`}</pre>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Sistema ── */}
      {tab === 'system' && (
        <>
          {scriptSaved && <div className="profile-toast">✓ Configurações salvas.</div>}

          <section className="card">
            <div className="card-header"><h3>Script de análise</h3></div>
            <div className="profile-fields">
              <div className="profile-field">
                <label className="profile-field__label">Script ativo</label>
                <select className="profile-field__input" value={scriptName} onChange={e => setScriptName(e.target.value)}>
                  {SCRIPT_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="profile-field">
                <label className="profile-field__label">Porta do servidor local</label>
                <input className="profile-field__input" value={serverPort} onChange={e => setServerPort(e.target.value)} />
              </div>
            </div>
            <div className="profile-actions">
              <button type="button" className="btn btn--primary" onClick={saveSystemSettings}>Salvar configurações</button>
            </div>
          </section>

          <section className="card">
            <div className="card-header"><h3>Informações do sistema</h3></div>
            <div className="admin-info-grid">
              <div className="admin-info-block">
                <h4>Versão</h4>
                <p className="muted small">BioLab SPA v0.1.0</p>
              </div>
              <div className="admin-info-block">
                <h4>Ambiente</h4>
                <p className="muted small">Desenvolvimento local</p>
              </div>
              <div className="admin-info-block">
                <h4>Backend</h4>
                <p className="muted small">Express • localhost:{serverPort}</p>
              </div>
              <div className="admin-info-block">
                <h4>Diretório de saída</h4>
                <p className="muted small">graficos_2d_halo_v2/</p>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header"><h3>Zona de perigo</h3><span className="pill status alert">Irreversível</span></div>
            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p className="muted small">As ações abaixo afetam dados de produção e não podem ser desfeitas.</p>
              <button type="button" className="btn-danger" onClick={() => alert('Funcionalidade disponível apenas em produção.')}>
                Limpar cache de imagens
              </button>
              <button type="button" className="btn-danger" onClick={() => alert('Funcionalidade disponível apenas em produção.')}>
                Redefinir configurações padrão
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
