import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { changePassword, getMe, updateMe } from '../api/users.ts'
import { useAuth } from '../hooks/useAuth.ts'
import { useToast } from '../contexts/useToast.ts'
import { Spinner } from '../components/Spinner.tsx'
import { extractErrorMessage } from '../api/client.ts'
import type { User } from '../types.ts'

const ROLES    = ['Coordenador Clínico', 'Infectologista', 'Intensivista', 'Microbiologista', 'Enfermeiro(a)', 'Residente']
const SHIFTS   = ['07h – 19h', '12h – 20h', '19h – 07h', 'Plantão hoje • 12h', '08h – 16h']

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function ProfilePage() {
  const { updateUser } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()

  // Sempre busca a versão "fresh" do servidor — mais confiável que o user
  // do AuthContext (que pode estar desatualizado se o backend mudou algo).
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  })

  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState<User | null>(null)
  const [pwOpen, setPwOpen]     = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  // Sincroniza o formulário com a resposta do servidor
  useEffect(() => {
    if (meQuery.data) setForm(meQuery.data)
  }, [meQuery.data])

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<User>) => updateMe({
      name:  payload.name,
      email: payload.email,
      role:  payload.role,
      shift: payload.shift,
    }),
    onSuccess: (data) => {
      toast('Perfil atualizado com sucesso.', 'success')
      queryClient.setQueryData(['me'], data)
      updateUser(data)
      setEditing(false)
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao atualizar perfil'), 'error')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: () => changePassword({ currentPassword: currentPw, newPassword: newPw }),
    onSuccess: () => {
      toast('Senha alterada com sucesso.', 'success')
      setPwOpen(false); setCurrentPw(''); setNewPw(''); setConfirmPw('')
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao alterar senha'), 'error')
    },
  })

  const handleSave = () => {
    if (!form) return
    updateMutation.mutate(form)
  }

  const handleCancel = () => {
    if (meQuery.data) setForm(meQuery.data)
    setEditing(false)
  }

  const handleChangePassword = () => {
    if (!currentPw || !newPw) {
      toast('Preencha senha atual e nova.', 'warning')
      return
    }
    if (newPw.length < 6) {
      toast('A nova senha deve ter no mínimo 6 caracteres.', 'warning')
      return
    }
    if (newPw !== confirmPw) {
      toast('Confirmação da nova senha não confere.', 'warning')
      return
    }
    passwordMutation.mutate()
  }

  if (meQuery.isLoading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <div className="page">
        <div className="page-header"><div><h1>Perfil</h1></div></div>
        <section className="card">
          <p className="muted">Não foi possível carregar o perfil. {extractErrorMessage(meQuery.error)}</p>
          <button className="btn btn--primary" onClick={() => meQuery.refetch()} style={{ marginTop: 'var(--space-3)' }}>
            Tentar novamente
          </button>
        </section>
      </div>
    )
  }

  const user = meQuery.data
  const current = (editing && form) ? form : user

  const field = (key: keyof User) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => (prev ? { ...prev, [key]: e.target.value } : prev))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Configurações pessoais</p>
          <h1>Perfil</h1>
        </div>
        {!editing && (
          <button type="button" className="btn btn--primary" onClick={() => { setForm(user); setEditing(true) }}>
            Editar perfil
          </button>
        )}
      </div>

      {/* Avatar + identidade */}
      <section className="card profile-hero">
        <div className="profile-avatar">{initials(user.name)}</div>
        <div className="profile-hero__info">
          <h2 className="profile-hero__name">{user.name}</h2>
          <p className="profile-hero__role">{user.role}</p>
          <p className="muted small">{user.email}</p>
        </div>
        <div className="profile-hero__badges">
          <span className="pill status ok">{user.shift}</span>
          {user.doctorId && <span className="pill subtle">ID: {user.doctorId}</span>}
        </div>
      </section>

      {/* Dados do perfil */}
      <section className="card">
        <div className="card-header">
          <h3>{editing ? 'Editando dados' : 'Dados cadastrais'}</h3>
          {editing && <span className="pill status warn">Modo edição</span>}
        </div>

        <div className="profile-fields">
          {/* Nome */}
          <div className="profile-field">
            <label className="profile-field__label">Nome completo</label>
            {editing
              ? <input className="profile-field__input" value={current.name} onChange={field('name')} />
              : <p className="profile-field__value">{current.name}</p>
            }
          </div>

          {/* E-mail */}
          <div className="profile-field">
            <label className="profile-field__label">E-mail institucional</label>
            {editing
              ? <input className="profile-field__input" type="email" value={current.email} onChange={field('email')} />
              : <p className="profile-field__value">{current.email}</p>
            }
          </div>

          {/* Função */}
          <div className="profile-field">
            <label className="profile-field__label">Função</label>
            {editing
              ? (
                <select className="profile-field__input" value={current.role} onChange={field('role')}>
                  {!ROLES.includes(current.role) && <option value={current.role}>{current.role}</option>}
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              )
              : <p className="profile-field__value">{current.role}</p>
            }
          </div>

          {/* Turno */}
          <div className="profile-field">
            <label className="profile-field__label">Turno</label>
            {editing
              ? (
                <select className="profile-field__input" value={current.shift} onChange={field('shift')}>
                  {!SHIFTS.includes(current.shift) && <option value={current.shift}>{current.shift}</option>}
                  {SHIFTS.map(s => <option key={s}>{s}</option>)}
                </select>
              )
              : <p className="profile-field__value">{current.shift}</p>
            }
          </div>
        </div>

        {editing && (
          <div className="profile-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Salvando…' : 'Salvar alterações'}
            </button>
            <button type="button" className="ghost" onClick={handleCancel} disabled={updateMutation.isPending}>
              Cancelar
            </button>
          </div>
        )}
      </section>

      {/* Acesso e segurança */}
      <section className="card">
        <div className="card-header">
          <h3>Acesso e segurança</h3>
        </div>
        <div className="profile-fields">
          <div className="profile-field">
            <label className="profile-field__label">Status</label>
            <p className="profile-field__value">
              {user.status ?? 'Ativo'}
              <span className="pill status ok" style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>JWT</span>
            </p>
          </div>
          <div className="profile-field">
            <label className="profile-field__label">Senha</label>
            {!pwOpen ? (
              <button type="button" className="ghost small" onClick={() => setPwOpen(true)}>
                Alterar senha
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <input
                  type="password"
                  className="profile-field__input"
                  placeholder="Senha atual"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                />
                <input
                  type="password"
                  className="profile-field__input"
                  placeholder="Nova senha (mín. 6 caracteres)"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  className="profile-field__input"
                  placeholder="Confirme a nova senha"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                />
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleChangePassword}
                    disabled={passwordMutation.isPending}
                  >
                    {passwordMutation.isPending ? 'Alterando…' : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      setPwOpen(false); setCurrentPw(''); setNewPw(''); setConfirmPw('')
                    }}
                    disabled={passwordMutation.isPending}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="profile-field">
            <label className="profile-field__label">2FA</label>
            <p className="profile-field__value muted">Não configurado <span className="pill subtle" style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>Recomendado</span></p>
          </div>
        </div>
      </section>
    </div>
  )
}
