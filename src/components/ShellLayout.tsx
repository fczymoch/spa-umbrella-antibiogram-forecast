import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { User } from '../types.ts'
import { useLocalStorage } from '../hooks/useLocalStorage.ts'

interface ShellLayoutProps {
  user: User | null
  onLogout: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/app': 'Início',
  '/app/exams': 'Antibiogramas',
  '/app/patients': 'Pacientes',
  '/app/doctors': 'Equipe Médica',
  '/app/attachments': 'Anexos',
  '/app/profile': 'Perfil',
  '/app/admin': 'Administrador',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/app/exams/')) return 'Detalhe do Antibiograma'
  if (pathname.startsWith('/app/patients/')) return 'Detalhe do Paciente'
  if (pathname.startsWith('/app/doctors/')) return 'Perfil do Médico'
  return PAGE_TITLES[pathname] ?? 'BioLab'
}

export function ShellLayout({ user, onLogout }: ShellLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('biolab:theme', 'light')
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const closeDrawer = () => setDrawerOpen(false)

  const navContent = (
    <>
      <nav className="side-nav">
        <NavLink to="/app" end className="nav-item" onClick={closeDrawer}>
          Início
        </NavLink>

        <details open className="nav-group">
          <summary>Antibiogramas</summary>
          <NavLink to={{ pathname: '/app/exams', search: '?view=all' }} className="nav-subitem" end onClick={closeDrawer}>
            Geral
          </NavLink>
          <NavLink to={{ pathname: '/app/exams', search: '?view=mine' }} className="nav-subitem" onClick={closeDrawer}>
            Meus antibiogramas
          </NavLink>
        </details>

        <NavLink to="/app/patients" className="nav-item" onClick={closeDrawer}>
          Pacientes
        </NavLink>
        <NavLink to="/app/doctors" className="nav-item" onClick={closeDrawer}>
          Equipe
        </NavLink>
        <NavLink to="/app/attachments" className="nav-item" onClick={closeDrawer}>
          Anexos
        </NavLink>
        <NavLink to="/app/profile" className="nav-item" onClick={closeDrawer}>
          Perfil
        </NavLink>
        <NavLink to="/app/admin" className="nav-item" onClick={closeDrawer}>
          Administrador
        </NavLink>
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-chip">
            <div>
              <p>{user.name}</p>
              <span>{user.role}</span>
            </div>
          </div>
          <button className="ghost full" onClick={onLogout}>
            Sair
          </button>
        </div>
      )}
    </>
  )

  return (
    <div className="shell">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BioLab</div>
          <div>
            <p className="brand-eyebrow">Monitoramento rápido</p>
            <p className="brand-title">Painel de Exames</p>
          </div>
        </div>
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="drawer-overlay"
          aria-hidden="true"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`drawer${drawerOpen ? ' drawer--open' : ''}`} aria-label="Menu de navegação">
        <div className="drawer-header">
          <div className="brand-mark" style={{ fontSize: 'var(--font-size-lg)' }}>BioLab</div>
          <button
            className="drawer-close"
            onClick={closeDrawer}
            aria-label="Fechar menu"
          >
            ×
          </button>
        </div>
        {navContent}
      </aside>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="topbar-hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu de navegação"
            aria-expanded={drawerOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <h2 className="topbar-title">{pageTitle}</h2>
          <button
            className="topbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user && (
            <div className="topbar-user">
              <div className="topbar-avatar" aria-label={user.name}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="topbar-user-name">{user.name}</span>
            </div>
          )}
        </header>

        <main className="content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
