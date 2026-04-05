import type { User } from '../types.ts'

interface ProfilePageProps {
  user: User | null
}

export function ProfilePage({ user }: ProfilePageProps) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Dados pessoais</p>
          <h1>Perfil</h1>
        </div>
      </div>

      <section className="card">
        {user ? (
          <div className="grid">
            <div>
              <p className="muted">Nome</p>
              <p className="list-title">{user.name}</p>
            </div>
            <div>
              <p className="muted">E-mail</p>
              <p className="list-title">{user.email}</p>
            </div>
            <div>
              <p className="muted">Função</p>
              <p className="list-title">{user.role}</p>
            </div>
            <div>
              <p className="muted">Turno</p>
              <p className="list-title">{user.shift}</p>
            </div>
          </div>
        ) : (
          <p className="muted">Faça login para ver os dados do perfil.</p>
        )}
      </section>
    </div>
  )
}
