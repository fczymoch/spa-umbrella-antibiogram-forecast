import { BiolabLogo } from './BiolabLogo.tsx'

const FEATURES = [
  'Antibiogramas com alertas de MDR',
  'Laudos microbiológicos integrados',
  'Gestão de pacientes e equipe médica',
  'Acesso seguro por instituição',
]

const STATS = [
  { value: '18+', label: 'Organismos monitorados' },
  { value: '<2h', label: 'Tempo médio de liberação' },
]

// SVGs dos pilares
const IconStethoscope = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 6.5a5 5 0 0 0 10 0V4a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v2.5z"/>
    <path d="M9.5 11.5v3a5 5 0 0 0 10 0v-1"/>
    <circle cx="19.5" cy="13.5" r="1.5"/>
  </svg>
)

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const IconBrain = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66z"/>
  </svg>
)

const IconLockBadge = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const PILLARS = [
  {
    Icon: IconStethoscope,
    title: 'Ferramenta assistencial de diagnóstico',
    desc: 'Suporte clínico integrado para equipes médicas e laboratoriais.',
  },
  {
    Icon: IconBell,
    title: 'Detecção precoce de resultados críticos',
    desc: 'Alertas automáticos para achados relevantes antes da liberação do laudo.',
  },
  {
    Icon: IconBrain,
    title: 'IA aplicada à análise microbiológica',
    desc: 'Modelos inteligentes que auxiliam na interpretação de padrões de resistência.',
  },
]

export function AuthBrandPanel() {
  return (
    <div className="auth-panel-brand">
      {/* Bolhas decorativas */}
      <div className="auth-blob auth-blob--1" aria-hidden="true" />
      <div className="auth-blob auth-blob--2" aria-hidden="true" />
      <div className="auth-blob auth-blob--3" aria-hidden="true" />

      {/* Topo: logo + tagline + features */}
      <div className="auth-panel-brand__top">
        <div className="auth-panel-brand__logo">
          <BiolabLogo size={42} variant="white" />
          <span className="auth-panel-brand__name">BioLab</span>
        </div>

        <p className="auth-panel-brand__tagline">
          Monitoramento de <em>resistência bacteriana</em> em tempo real para equipes de saúde.
        </p>

        <ul className="auth-panel-brand__features" aria-label="Funcionalidades">
          {FEATURES.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </div>

      {/* Meio: pilares do produto */}
        <div className="auth-pillars" aria-hidden="true">
        {PILLARS.map((p) => (
          <div key={p.title} className="auth-pillar">
            <span className="auth-pillar__icon"><p.Icon /></span>
            <div className="auth-pillar__text">
              <strong className="auth-pillar__title">{p.title}</strong>
              <span className="auth-pillar__desc">{p.desc}</span>
            </div>
          </div>
        ))}
      </div>      {/* Baixo: 2 stats + rodapé */}
      <div className="auth-panel-brand__bottom">
        <div className="auth-panel-brand__stats" aria-label="Números da plataforma">
          {STATS.map((s) => (
            <div key={s.label} className="auth-stat">
              <div className="auth-stat__value">{s.value}</div>
              <div className="auth-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="auth-panel-brand__footer">
          <div className="auth-panel-brand__badge" aria-hidden="true">
            <IconLockBadge />
            <span>Acesso restrito a profissionais</span>
          </div>
          <span className="auth-panel-brand__copy">© 2026 BioLab</span>
        </div>
      </div>
    </div>
  )
}
