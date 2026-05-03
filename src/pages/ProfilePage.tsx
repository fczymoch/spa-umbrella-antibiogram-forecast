import { useState } from 'react'
import type { User } from '../types.ts'

interface ProfilePageProps {
  user: User | null
  onUpdateUser?: (updated: User) => void
}

const ROLES    = ['Coordenador Clínico', 'Infectologista', 'Intensivista', 'Microbiologista', 'Enfermeiro(a)', 'Residente']
const SHIFTS   = ['07h – 19h', '12h – 20h', '19h – 07h', 'Plantão hoje • 12h', '08h – 16h']

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function ProfilePage({ user, onUpdateUser }: ProfilePageProps) {
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState<User | null>(user)
  const [saved, setSaved]       = useState(false)

  if (!user) return (
    <div className="page">
      <div className="page-header"><div><h1>Perfil</h1></div></div>
      <section className="card"><p className="muted">Faça login para ver o perfil.</p></section>
    </div>
  )

  const field = (key: keyof User) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => prev ? { ...prev, [key]: e.target.value } : prev)

  const handleSave = () => {
    if (!form || !onUpdateUser) return
    onUpdateUser(form)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleCancel = () => {
    setForm(user)
    setEditing(false)
  }

  const current = editing ? form! : user

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

      {saved && (
        <div className="profile-toast">
          ✓ Perfil atualizado com sucesso.
        </div>
      )}

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
                  {SHIFTS.map(s => <option key={s}>{s}</option>)}
                </select>
              )
              : <p className="profile-field__value">{current.shift}</p>
            }
          </div>
        </div>

        {editing && (
          <div className="profile-actions">
            <button type="button" className="btn btn--primary" onClick={handleSave}>Salvar alterações</button>
            <button type="button" className="ghost" onClick={handleCancel}>Cancelar</button>
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
            <label className="profile-field__label">Último acesso</label>
            <p className="profile-field__value">Hoje • {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="profile-field">
            <label className="profile-field__label">Autenticação</label>
            <p className="profile-field__value">E-mail + senha <span className="pill status ok" style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>Ativo</span></p>
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
