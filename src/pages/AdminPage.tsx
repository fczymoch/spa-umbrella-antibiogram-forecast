import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSettings, getStats, updateSettings } from '../api/admin.ts'
import { listExams } from '../api/exams.ts'
import {
  createUser,
  listUsers,
  updateUserStatus,
} from '../api/users.ts'
import {
  connectOneDrive,
  disconnectOneDrive,
  getOneDriveStatus,
  syncOneDrive,
} from '../api/onedrive.ts'
import { Spinner } from '../components/Spinner.tsx'
import { useToast } from '../contexts/useToast.ts'
import { extractErrorMessage } from '../api/client.ts'
import type { UserStatus } from '../types.ts'

type AdminTab = 'overview' | 'users' | 'onedrive' | 'system'

const SCRIPT_OPTIONS = [
  'GerarGrafico2D_DetectarHalo_v2.py',
  'GerarGrafico2D_DetectarHalo_v3_azul.py',
]

const ROLES = ['Coordenador Clínico', 'Infectologista', 'Intensivista', 'Microbiologista', 'Enfermeiro(a)', 'Residente']
const SHIFTS = ['07h – 19h', '12h – 20h', '19h – 07h', 'Plantão hoje • 12h', '08h – 16h', 'Noite']

export function AdminPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<AdminTab>('overview')

  // ── Queries ──────────────────────────────────────────────
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getStats,
  })

  const settingsQuery = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: getSettings,
  })

  const usersQuery = useQuery({
    queryKey: ['users', { page: 1, limit: 100 }],
    queryFn: () => listUsers({ page: 1, limit: 100 }),
  })

  const recentExamsQuery = useQuery({
    queryKey: ['exams', { page: 1, limit: 6 }],
    queryFn: () => listExams({ page: 1, limit: 6 }),
  })

  const oneDriveQuery = useQuery({
    queryKey: ['onedrive', 'status'],
    queryFn: getOneDriveStatus,
  })

  // ── Mutations ────────────────────────────────────────────
  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      toast('Configurações salvas com sucesso.', 'success')
      queryClient.setQueryData(['admin', 'settings'], data)
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao salvar configurações'), 'error')
    },
  })

  const toggleUserMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => updateUserStatus(id, status),
    onSuccess: () => {
      toast('Status do usuário atualizado.', 'success')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao atualizar status do usuário'), 'error')
    },
  })

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast('Usuário criado com sucesso.', 'success')
      setNewUserOpen(false)
      setNewUser({ name: '', email: '', password: '', role: ROLES[0], shift: SHIFTS[0] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao criar usuário'), 'error')
    },
  })

  const connectMutation = useMutation({
    mutationFn: connectOneDrive,
    onSuccess: (data) => {
      // Backend retorna a authUrl OAuth — redireciona o navegador.
      window.location.href = data.authUrl
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao iniciar conexão OneDrive'), 'error')
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: disconnectOneDrive,
    onSuccess: () => {
      toast('OneDrive desconectado.', 'success')
      queryClient.invalidateQueries({ queryKey: ['onedrive'] })
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao desconectar OneDrive'), 'error')
    },
  })

  const syncMutation = useMutation({
    mutationFn: syncOneDrive,
    onSuccess: (data) => {
      toast(`Sincronização OK · ${data.synced} arquivos · ${data.errors} erros`, 'success')
      queryClient.invalidateQueries({ queryKey: ['onedrive'] })
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao sincronizar OneDrive'), 'error')
    },
  })

  // ── Local state para o formulário de Sistema ─────────────
  const [scriptName, setScriptName] = useState('')
  const [serverPort, setServerPort] = useState('')

  useEffect(() => {
    if (settingsQuery.data) {
      setScriptName(settingsQuery.data.scriptName)
      setServerPort(settingsQuery.data.serverPort)
    }
  }, [settingsQuery.data])

  // ── Local state para criação de usuário ──────────────────
  const [newUserOpen, setNewUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES[0],
    shift: SHIFTS[0],
  })

  const stats = statsQuery.data
  const users = usersQuery.data?.data ?? []
  const recentExams = recentExamsQuery.data?.data ?? []
  const onedrive = oneDriveQuery.data

  const totalExams = stats?.exams.total ?? 0
  const pendingExams = stats?.exams.pendente ?? 0
  const inAnalysis = stats?.exams.emAnalise ?? 0
  const pendingReview = stats?.exams.pendenteAvaliacao ?? 0
  const finalized = stats?.exams.finalizado ?? 0
  const activeUsers = stats?.users.active ?? users.filter((u) => u.status === 'Ativo').length

  const TABS: { key: AdminTab; label: string }[] = [
    { key: 'overview', label: 'Visão geral' },
    { key: 'users',    label: 'Usuários'    },
    { key: 'onedrive', label: 'OneDrive'    },
    { key: 'system',   label: 'Sistema'     },
  ]

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({ scriptName, serverPort })
  }

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast('Preencha nome, e-mail e senha.', 'warning')
      return
    }
    if (newUser.password.length < 6) {
      toast('Senha deve ter no mínimo 6 caracteres.', 'warning')
      return
    }
    createUserMutation.mutate(newUser)
  }

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
          {statsQuery.isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
              <Spinner size="lg" />
            </div>
          ) : statsQuery.isError ? (
            <section className="card">
              <p className="muted">Erro ao carregar estatísticas: {extractErrorMessage(statsQuery.error)}</p>
              <button className="btn btn--primary" onClick={() => statsQuery.refetch()} style={{ marginTop: 'var(--space-3)' }}>
                Tentar novamente
              </button>
            </section>
          ) : (
            <>
              <div className="admin-stats">
                <div className="admin-stat">
                  <p className="admin-stat__num">{totalExams}</p>
                  <p className="admin-stat__label">Total de exames</p>
                </div>
                <div className="admin-stat">
                  <p className="admin-stat__num">{stats?.patients.total ?? 0}</p>
                  <p className="admin-stat__label">Pacientes</p>
                </div>
                <div className="admin-stat">
                  <p className="admin-stat__num">{stats?.doctors.total ?? 0}</p>
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
                    { label: 'Pendente',              count: pendingExams,   cls: 'pending' },
                    { label: 'Em análise',            count: inAnalysis,     cls: 'warn'    },
                    { label: 'Pendente de avaliação', count: pendingReview,  cls: 'info'    },
                    { label: 'Finalizado',            count: finalized,      cls: 'ok'      },
                  ].map(s => (
                    <div key={s.label} className="admin-bar-row">
                      <span className="admin-bar-label">{s.label}</span>
                      <div className="admin-bar-track">
                        <div
                          className={`admin-bar-fill admin-bar-fill--${s.cls}`}
                          style={{ width: totalExams > 0 ? `${(s.count / totalExams) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="admin-bar-count">{s.count}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card">
                <div className="card-header"><h3>Atividade recente</h3></div>
                {recentExamsQuery.isLoading ? (
                  <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}><Spinner /></div>
                ) : recentExams.length === 0 ? (
                  <p className="muted small" style={{ padding: 'var(--space-4)' }}>Nenhum exame recente.</p>
                ) : (
                  <ul className="admin-activity-list">
                    {recentExams.map(e => (
                      <li key={e.id} className="admin-activity-item">
                        <span className={`pill status ${e.status === 'Finalizado' ? 'ok' : e.status === 'Pendente' ? 'pending' : e.status === 'Em análise' ? 'warn' : 'info'}`} style={{ minWidth: '160px', justifyContent: 'center' }}>
                          {e.status}
                        </span>
                        <span className="admin-activity-label">{e.organism}</span>
                        <span className="muted small">{e.collectedAt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </>
      )}

      {/* ── Usuários ── */}
      {tab === 'users' && (
        <>
          <section className="card">
            <div className="card-header">
              <h3>Gerenciamento de usuários</h3>
              <div className="chips">
                <span className="pill subtle">{users.length} usuários</span>
                <span className="pill status ok">{activeUsers} ativos</span>
                <button className="btn btn--primary" onClick={() => setNewUserOpen((v) => !v)}>
                  {newUserOpen ? 'Cancelar' : '+ Novo usuário'}
                </button>
              </div>
            </div>

            {newUserOpen && (
              <div className="profile-fields" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="profile-field">
                  <label className="profile-field__label">Nome</label>
                  <input className="profile-field__input" value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">E-mail</label>
                  <input className="profile-field__input" type="email" value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Senha temporária (mín. 6)</label>
                  <input className="profile-field__input" type="password" value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Função</label>
                  <select className="profile-field__input" value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Turno</label>
                  <select className="profile-field__input" value={newUser.shift}
                    onChange={(e) => setNewUser({ ...newUser, shift: e.target.value })}>
                    {SHIFTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="profile-actions">
                  <button className="btn btn--primary" onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? 'Criando…' : 'Criar usuário'}
                  </button>
                </div>
              </div>
            )}

            {usersQuery.isLoading ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}><Spinner /></div>
            ) : usersQuery.isError ? (
              <p className="muted">Erro ao carregar usuários: {extractErrorMessage(usersQuery.error)}</p>
            ) : (
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
                            {u.status ?? 'Ativo'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="ghost small"
                            disabled={toggleUserMutation.isPending || !u.id}
                            onClick={() => u.id && toggleUserMutation.mutate({
                              id: u.id,
                              status: u.status === 'Ativo' ? 'Inativo' : 'Ativo',
                            })}
                          >
                            {u.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── OneDrive ── */}
      {tab === 'onedrive' && (
        <>
          <section className="card">
            <div className="card-header">
              <h3>Conexão OneDrive</h3>
              <span className="pill subtle">Microsoft Graph API</span>
            </div>

            {oneDriveQuery.isLoading ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}><Spinner /></div>
            ) : oneDriveQuery.isError ? (
              <div style={{ padding: 'var(--space-4)' }}>
                <p className="muted">Erro ao carregar status: {extractErrorMessage(oneDriveQuery.error)}</p>
              </div>
            ) : !onedrive?.connected ? (
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
                <button className="btn btn--primary" onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending}>
                  {connectMutation.isPending ? 'Conectando…' : 'Conectar ao OneDrive'}
                </button>
              </div>
            ) : (
              <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <p className="muted small">Conta conectada: <strong>{onedrive.accountEmail || '—'}</strong></p>
                  <p className="muted small">Pasta: <strong>{onedrive.syncFolder}</strong></p>
                  {onedrive.lastSync && <p className="muted small">Última sincronização: {onedrive.lastSync}</p>}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn--primary" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                    {syncMutation.isPending ? 'Sincronizando…' : 'Sincronizar agora'}
                  </button>
                  <button className="ghost" onClick={() => disconnectMutation.mutate()} disabled={disconnectMutation.isPending}>
                    {disconnectMutation.isPending ? 'Desconectando…' : 'Desconectar'}
                  </button>
                </div>
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
            </div>
          </section>
        </>
      )}

      {/* ── Sistema ── */}
      {tab === 'system' && (
        <>
          <section className="card">
            <div className="card-header"><h3>Script de análise</h3></div>
            {settingsQuery.isLoading ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}><Spinner /></div>
            ) : settingsQuery.isError ? (
              <p className="muted" style={{ padding: 'var(--space-4)' }}>
                Erro ao carregar configurações: {extractErrorMessage(settingsQuery.error)}
              </p>
            ) : (
              <>
                <div className="profile-fields">
                  <div className="profile-field">
                    <label className="profile-field__label">Script ativo</label>
                    <select className="profile-field__input" value={scriptName} onChange={e => setScriptName(e.target.value)}>
                      {!SCRIPT_OPTIONS.includes(scriptName) && scriptName && (
                        <option value={scriptName}>{scriptName}</option>
                      )}
                      {SCRIPT_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Porta do servidor local</label>
                    <input className="profile-field__input" value={serverPort} onChange={e => setServerPort(e.target.value)} />
                  </div>
                </div>
                <div className="profile-actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleSaveSettings}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? 'Salvando…' : 'Salvar configurações'}
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="card">
            <div className="card-header"><h3>Informações do sistema</h3></div>
            <div className="admin-info-grid">
              <div className="admin-info-block">
                <h4>Versão</h4>
                <p className="muted small">BioLab SPA v0.1.0</p>
              </div>
              <div className="admin-info-block">
                <h4>API</h4>
                <p className="muted small">Spring Boot · {import.meta.env.VITE_API_URL ?? 'http://localhost:8080/v1'}</p>
              </div>
              <div className="admin-info-block">
                <h4>Servidor de scripts</h4>
                <p className="muted small">Express local · porta {serverPort || '3333'}</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
