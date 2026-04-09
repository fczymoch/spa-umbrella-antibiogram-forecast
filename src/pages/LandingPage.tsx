import { Link } from 'react-router-dom'

const features = [
  { title: 'Antibiogramas em tempo real', description: 'Acompanhe cada laudo desde a coleta até a liberação, com status atualizado automaticamente.' },
  { title: 'Perfil de resistência bacteriana', description: 'Visualize MIC e interpretações (S/I/R) para cada antibiótico em um único painel.' },
  { title: 'Gráficos de sensibilidade', description: 'Gráficos de barras interativos para comparação rápida entre antibióticos testados.' },
  { title: 'Gestão por paciente', description: 'Histórico completo de exames por paciente, com localização de leito e risco clínico.' },
  { title: 'Escala médica integrada', description: 'Veja quais médicos estão de plantão e quantos exames cada um solicitou.' },
  { title: 'Integração OneDrive', description: 'Importe imagens de antibiogramas direto da nuvem com seleção e preview antes de importar.' },
]

const steps = [
  { num: '01', title: 'Faça login', description: 'Acesse com seu e-mail institucional. Sem downloads, sem configuração.' },
  { num: '02', title: 'Monitore os exames', description: 'Filtre por status, data, médico ou paciente e acesse o detalhe completo do antibiograma.' },
  { num: '03', title: 'Tome decisões mais rápidas', description: 'Com MIC e interpretações na tela, a escolha do antibiótico certo fica a um clique.' },
]

export function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav__brand">
          <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
            <rect width="28" height="28" rx="7" fill="url(#ln)"/>
            <path d="M9 6h10M11 6v5l-4 8a1.6 1.6 0 001.4 2.3h9.6A1.6 1.6 0 0019 19l-4-8V6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="15" r=".8" fill="#bfdbfe"/>
            <circle cx="15.5" cy="17" r="1.2" fill="#bfdbfe"/>
            <defs><linearGradient id="ln" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#2563eb"/><stop offset="1" stopColor="#0ea5e9"/></linearGradient></defs>
          </svg>
          <span>BioLab</span>
        </div>
        <Link to="/login" className="landing-nav__cta">
          Acessar plataforma →
        </Link>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <p className="landing-eyebrow">Plataforma clínica · Microbiologia</p>
          <h1 className="landing-hero__title">
            Antibiogramas em um<br />
            <span className="landing-hero__title-accent">painel inteligente</span>
          </h1>
          <p className="landing-hero__subtitle">
            BioLab centraliza laudos microbiológicos, perfis de resistência e MIC de todos os pacientes da UTI e clínica em uma interface rápida e segura.
          </p>
          <div className="landing-hero__actions">
            <Link to="/login" className="landing-btn-primary">
              Começar agora — é grátis
            </Link>
            <a href="#como-funciona" className="landing-btn-ghost">
              Ver como funciona ↓
            </a>
          </div>
          <div className="landing-hero__trust">
            <span>Sem instalação</span>
            <span>Acesso via navegador</span>
            <span>Dados fictícios para demonstração</span>
          </div>
        </div>
        <div className="landing-hero__visual" aria-hidden="true">
          <div className="landing-mockup">
            <div className="landing-mockup__bar">
              <span /><span /><span />
            </div>
            <div className="landing-mockup__content">
              <div className="landing-mockup__sidebar">
                {['Início', 'Antibiogramas', 'Pacientes', 'Equipe', 'Anexos'].map((item) => (
                  <div key={item} className="landing-mockup__nav-item">{item}</div>
                ))}
              </div>
              <div className="landing-mockup__main">
                <div className="landing-mockup__stat-row">
                  {['18 Exames', '6 Médicos', '12 Pacientes'].map((s) => (
                    <div key={s} className="landing-mockup__stat">{s}</div>
                  ))}
                </div>
                {[
                  { org: 'Klebsiella pneumoniae', status: 'Em análise',            color: '#fbbf24' },
                  { org: 'E. coli ESBL',          status: 'Pendente',               color: '#6366f1' },
                  { org: 'S. aureus MRSA',         status: 'Pendente de avaliação',  color: '#3b82f6' },
                  { org: 'A. baumannii MDR',       status: 'Finalizado',             color: '#22c55e' },
                ].map((row) => (
                  <div key={row.org} className="landing-mockup__row">
                    <span className="landing-mockup__org">{row.org}</span>
                    <span className="landing-mockup__badge" style={{ color: row.color }}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="landing-section landing-problem">
        <div className="landing-container">
          <div className="landing-problem__grid">
            <div>
              <p className="landing-eyebrow" style={{ color: 'var(--color-alert-text)' }}>O problema</p>
              <h2>Laudos espalhados, decisões lentas</h2>
              <ul className="landing-problem__list">
                <li>Resultados perdidos em pastas de rede ou e-mails</li>
                <li>Médico precisa ligar para o lab para saber o status</li>
                <li>Interpretação S/I/R manuscrita e sujeita a erro</li>
                <li>Sem visão consolidada do perfil de resistência da ala</li>
              </ul>
            </div>
            <div>
              <p className="landing-eyebrow" style={{ color: 'var(--color-ok-text)' }}>A solução</p>
              <h2>Tudo em um painel, em tempo real</h2>
              <ul className="landing-problem__list">
                <li>Status do exame visível para toda a equipe</li>
                <li>MIC e interpretação exibidos automaticamente</li>
                <li>Filtros por paciente, médico, data e organismo</li>
                <li>Gráfico de barras para comparar sensibilidade</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="landing-container">
          <div className="landing-section__header">
            <p className="landing-eyebrow">Funcionalidades</p>
            <h2>Tudo que a equipe clínica precisa</h2>
            <p className="muted">Projetado com médicos infectologistas e intensivistas para cobrir o fluxo real de um laboratório hospitalar.</p>
          </div>
          <div className="landing-features">
            {features.map((f) => (
              <div key={f.title} className="landing-feature-card">
                <h3>{f.title}</h3>
                <p className="muted small">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section" id="como-funciona">
        <div className="landing-container">
          <div className="landing-section__header">
            <p className="landing-eyebrow">Como funciona</p>
            <h2>Três passos para a decisão certa</h2>
          </div>
          <div className="landing-steps">
            {steps.map((s) => (
              <div key={s.num} className="landing-step">
                <div className="landing-step__num" aria-hidden="true">{s.num}</div>
                <h3>{s.title}</h3>
                <p className="muted">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="landing-cta">
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <h2>Pronto para centralizar seus antibiogramas?</h2>
          <p className="muted" style={{ marginBottom: 'var(--space-8)' }}>
            Acesse agora com os dados de demonstração e explore todas as funcionalidades.
          </p>
          <Link to="/login" className="landing-btn-primary" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--space-4) var(--space-10)' }}>
            Acessar o BioLab
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer__inner">
            <div className="landing-nav__brand">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
                <rect width="24" height="24" rx="6" fill="#2563eb"/>
                <path d="M8 5h8M10 5v4l-3 6a1.3 1.3 0 001.2 2h7.6A1.3 1.3 0 0017 15l-3-6V5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>BioLab</span>
            </div>
            <p className="muted small">Plataforma de demonstração — dados fictícios · 2026</p>
            <p className="muted small">Desenvolvido como projeto acadêmico · 7º Semestre</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
