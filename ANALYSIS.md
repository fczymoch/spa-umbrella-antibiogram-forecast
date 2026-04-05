# 📋 BioLab — Análise Completa do Estado Atual

> Documento de referência gerado em 04/04/2026 para embasar o plano de evolução do produto.

---

## 1. Visão Geral do Projeto

| Campo | Valor |
|---|---|
| **Nome do produto** | BioLab — Painel de Antibiogramas |
| **Domínio** | Saúde hospitalar / Infectologia clínica |
| **Stack** | React 19 + TypeScript + Vite 7 + React Router 7 |
| **Charting** | Chart.js 4 + react-chartjs-2 5 |
| **Estilização** | CSS puro (App.css + index.css), sem framework UI |
| **Dados** | 100% mock (não há backend) |
| **Autenticação** | Simulada — qualquer e-mail válido faz login |
| **Idioma** | Português Brasileiro |

---

## 2. Estrutura de Arquivos

```
src/
├── main.tsx              → Entry point; usa BrowserRouter + AppNew.tsx
├── App.tsx               → Versão antiga (não usada, pode ser removida)
├── AppNew.tsx            → Roteamento principal ativo
├── App.css               → Todo o sistema de design (649 linhas)
├── index.css             → Reset global + variáveis de fonte
├── types.ts              → Contratos TypeScript de domínio
├── assets/               → (vazio / vite.svg padrão)
├── data/
│   └── mockData.ts       → Dados fictícios hardcoded
├── utils/
│   └── status.ts         → Funções de cor/classe por status
├── components/
│   └── ShellLayout.tsx   → Sidebar + Outlet (layout autenticado)
└── pages/
    ├── index.ts           → Re-exports de todas as páginas
    ├── LandingPage.tsx    → Página pública de apresentação
    ├── LoginPage.tsx      → Formulário de login (sem validação real)
    ├── HomePage.tsx       → Dashboard principal
    ├── ExamsPage.tsx      → Lista de antibiogramas + filtros + paginação
    ├── ExamDetailPage.tsx → Detalhe completo de um antibiograma
    ├── PatientsPage.tsx   → Lista de pacientes com risco
    ├── PatientDetailPage.tsx → Histórico de exames por paciente
    ├── DoctorsPage.tsx    → Lista da equipe médica
    ├── AttachmentsPage.tsx → Upload e listagem de documentos
    ├── ProfilePage.tsx    → Dados do usuário logado
    └── AdminPage.tsx      → Integração simulada com OneDrive
```

---

## 3. Modelo de Dados (types.ts)

### `User`
| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string | Nome exibido (gerado a partir do e-mail) |
| `email` | string | E-mail institucional |
| `role` | string | Cargo fixo: "Coordenador Clínico" |
| `shift` | string | Turno fixo: "Plantão hoje • 12h" |
| `doctorId?` | string | Referência ao doctor (vinculado ao `doctors[0]` no login) |

### `Exam` (Antibiograma)
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | UUID |
| `patientId` | string | FK → Patient |
| `doctorId` | string | FK → Doctor |
| `organism` | string | Ex: "Klebsiella pneumoniae" |
| `specimen` | string | Ex: "Hemocultura" |
| `collectedAt` | string | Datetime como string "YYYY-MM-DD HH:MM" |
| `status` | enum | `'Pendente' \| 'Em análise' \| 'Liberado'` |
| `source` | enum | `'OneDrive' \| 'Bucket'` |
| `previewUrl` | string | URL externa (Unsplash) |
| `site` | string | Local clínico |
| `notes?` | string | Observações clínicas |
| `antibiogram` | `AntibiogramEntry[]` | Lista de antibióticos testados |

### `AntibiogramEntry`
| Campo | Tipo | Descrição |
|---|---|---|
| `antibiotic` | string | Nome do antibiótico |
| `mic` | string | Concentração Inibitória Mínima |
| `interpretation` | `'S' \| 'I' \| 'R'` | Sensível / Intermediário / Resistente |

### `Patient`
| Campo | Tipo |
|---|---|
| `id` | string |
| `name` | string |
| `age` | number |
| `bed` | string |
| `risk` | `'Verde' \| 'Amarelo' \| 'Vermelho'` |

### `Doctor`
| Campo | Tipo |
|---|---|
| `id` | string |
| `name` | string |
| `specialty` | string |
| `shift` | string |

### `Attachment`
| Campo | Tipo |
|---|---|
| `id` | string |
| `fileName` | string |
| `type` | string |
| `size` | string |
| `uploadedAt` | string |
| `notes?` | string |

### `Appointment`
| Campo | Tipo |
|---|---|
| `id` | string |
| `patient` | string |
| `schedule` | string |
| `location` | string |
| `type` | string |

---

## 4. Rotas

| Path | Componente | Proteção |
|---|---|---|
| `/` | `LandingPage` | Pública |
| `/login` | `LoginPage` | Pública |
| `/app` | `HomePage` | Autenticada |
| `/app/exams` | `ExamsPage` | Autenticada |
| `/app/exams/:id` | `ExamDetailPage` | Autenticada |
| `/app/patients` | `PatientsPage` | Autenticada |
| `/app/patients/:id` | `PatientDetailPage` | Autenticada |
| `/app/doctors` | `DoctorsPage` | Autenticada |
| `/app/attachments` | `AttachmentsPage` | Autenticada |
| `/app/profile` | `ProfilePage` | Autenticada |
| `/app/admin` | `AdminPage` | Autenticada |
| `*` | Redirect | — |

---

## 5. Inventário de Funcionalidades Implementadas

### ✅ Funcionando
- [x] Login simulado (e-mail + senha, sem validação real)
- [x] Rotas protegidas com redirect para `/login`
- [x] Layout shell com sidebar azul gradiente + logout
- [x] Dashboard com gráfico Doughnut (status dos exames)
- [x] Resumo rápido: total de exames, anexos e consultas
- [x] Lista de antibiogramas recentes na home
- [x] Agenda de consultas na home
- [x] Lista de últimos uploads na home
- [x] Página de antibiogramas com filtros por status, data, paciente e médico
- [x] Paginação na lista de antibiogramas (10 por página)
- [x] Chips de filtros ativos com botão "limpar todos"
- [x] Detalhe do antibiograma: pipeline de status visual
- [x] Detalhe do antibiograma: galeria de imagens (3 slots)
- [x] Detalhe do antibiograma: tabela MIC + interpretação colorida
- [x] Detalhe do antibiograma: gráfico de barras "Perfil de sensibilidade"
- [x] Lista de pacientes com nível de risco colorido
- [x] Página de detalhe do paciente com histórico de exames
- [x] Lista da equipe médica com especialidade e turno
- [x] Upload de arquivos com notas clínicas
- [x] Listagem de anexos enviados
- [x] Página de perfil com dados do usuário logado
- [x] AdminPage com integração OneDrive simulada (mock)
- [x] Responsividade básica (media queries para mobile)
- [x] Modo de visualização "Meus antibiogramas" vs "Geral"
- [x] Navegação ativa (NavLink com classe `.active`)

### ⚠️ Parcialmente implementado
- [ ] `PatientDetailPage` — o link "Ver detalhes" aponta para `/app/patients/:id` mas a rota existe
- [ ] `LandingPage` — existe mas não foi analisada em detalhes (não integrada ao login de forma fluida)
- [ ] Modo "Meus antibiogramas" — depende de `user.doctorId` que é atribuído ao `doctors[0]` fixo
- [ ] Upload — funciona na sessão mas não persiste (estado em memória)
- [ ] Senha — aceita qualquer valor, não há validação

### ❌ Não implementado
- [ ] Backend / API real
- [ ] Persistência (localStorage, banco, etc.)
- [ ] Autenticação real (JWT, OAuth)
- [ ] Onboarding / tour do produto
- [ ] Modo escuro
- [ ] Internacionalização (i18n)
- [ ] Testes automatizados (unitários / e2e)
- [ ] CI/CD
- [ ] Notificações / alertas em tempo real
- [ ] Impressão / exportação de laudos
- [ ] Busca global
- [ ] Acessibilidade WCAG formal (aria-labels, keyboard nav)
- [ ] SEO / meta tags
- [ ] Error boundaries
- [ ] Loading skeletons

---

## 6. Sistema de Design Atual

### Paleta de cores
| Token | Valor | Uso |
|---|---|---|
| Sidebar | `#0ea5e9 → #2563eb → #0b5ea8` | Gradiente azul da barra lateral |
| Background | `#f5f7fb` | Fundo global |
| Card | `#ffffff → #f3f6ff → #eef2ff` | Gradiente dos cards |
| Text | `#0f172a` | Texto principal |
| Muted | `#64748b` | Texto secundário |
| Border | `#e2e8f0` | Bordas |
| OK (verde) | `#ecfdf3 / #15803d` | Status "Liberado" / "Sensível" |
| Warn (laranja) | `#fffbeb / #c2410c` | Status "Em análise" |
| Pending (índigo) | `#eef2ff / #4338ca` | Status "Pendente" |
| Alert (vermelho) | `#fef2f2 / #b91c1c` | Status "Resistente" / risco vermelho |
| Mid (amarelo) | `#fef9c3 / #854d0e` | Status "Intermediário" |

### Componentes CSS reutilizáveis
- `.card` — container principal com gradiente e sombra
- `.pill` — badges inline (variantes: `subtle`, `status ok/warn/pending/alert/mid`)
- `.list` + `.list-row` — listas uniformes com divisor
- `.grid` — grid responsivo com `auto-fit`
- `.stats-grid` — grid de métricas
- `.page` + `.page-header` — estrutura padrão de página
- `.form` — layout de formulário vertical
- `.badge` — badge de destaque no header
- `.ghost` — botão transparente
- `.button.primary` — botão primário azul gradiente

### Tipografia
- Fonte: Inter (system-ui fallback)
- Não há escala tipográfica definida explicitamente no CSS
- Sem variáveis CSS para font-sizes

### Gaps identificados no design system
- Sem CSS custom properties (`--var`) para tokens — cores hardcoded
- Sem escala de espaçamento consistente
- Sem dark mode tokens
- Inline styles espalhados nas páginas (70+ ocorrências de `style={{ }}`)
- `App.css` com 649 linhas sem organização em seções claras

---

## 7. Qualidade de Código

### Pontos positivos
- TypeScript com tipagem forte nos props
- `useMemo` / `useCallback` em filtros pesados
- Separação clara de concerns (pages / components / utils / data)
- Rotas protegidas com padrão `ProtectedRoute + Outlet`

### Débitos técnicos
- `App.tsx` não está sendo usado (main.tsx importa `AppNew.tsx`) — arquivo morto
- Sem Error Boundaries — erros de runtime quebram a app silenciosamente
- Inline styles massivos em `ExamsPage`, `ExamDetailPage`, `AdminPage`
- `LandingPage.tsx` não foi verificada em detalhes
- Dados mock sem tipagem de erro (IDs de paciente/médico podem não existir)
- `collectedAt` como string com parsing manual (frágil)
- Sem variáveis de ambiente documentadas além do `AdminPage`
- `App.css` mistura componentes, utilitários e páginas específicas

---

## 8. Mock Data Atual

| Entidade | Quantidade |
|---|---|
| Pacientes | 3 |
| Médicos | 3 |
| Exames/Antibiogramas | 3 |
| Consultas (Appointments) | 3 |
| Anexos iniciais | 2 |

---

## 9. Dependências

### Produção
| Pacote | Versão | Uso |
|---|---|---|
| `react` | 19.2.0 | Framework UI |
| `react-dom` | 19.2.0 | Renderização DOM |
| `react-router-dom` | 7.13.1 | Roteamento SPA |
| `chart.js` | 4.5.1 | Engine de gráficos |
| `react-chartjs-2` | 5.3.1 | Wrapper React para Chart.js |

### Dev
| Pacote | Versão |
|---|---|
| `vite` | 7.3.1 |
| `typescript` | 5.9.3 |
| `eslint` | 9.39.1 |
| `@vitejs/plugin-react` | 5.1.1 |

> **Nota:** Nenhuma biblioteca de UI components (ex: shadcn/ui, Ant Design, MUI), nenhum gerenciador de estado global (Zustand, Redux), nenhuma lib de formulário (react-hook-form) e nenhum utilitário CSS (Tailwind, styled-components) estão presentes.

---

## 10. Pontos Críticos para Evolução

### 🔴 Alta prioridade (impacto visual / profissional imediato)
1. **Design system com tokens CSS** — substituir cores e espaçamentos hardcoded por variáveis
2. **Eliminar inline styles** — mover para classes CSS organizadas
3. **Sidebar mobile** — comportamento de hamburguer/drawer para telas pequenas
4. **Loading states** — skeleton loaders nos cards e listas
5. **Empty states** — telas vazias com ilustração quando não há dados
6. **Error Boundary** — captura global de erros com fallback amigável
7. **Título da aba do browser** — `index.html` ainda tem `pi_7sem` como título

### 🟡 Média prioridade (UX e completude)
8. **Página de detalhes do médico** — `DoctorsPage` não tem detalhe por ID
9. **Busca global** — header com campo de busca unificado
10. **Notificações toast** — feedback de ações (upload concluído, erro, etc.)
11. **Modo escuro** — toggle dark/light com CSS variables
12. **Breadcrumbs** — orientação de navegação nas páginas de detalhe
13. **LandingPage polida** — hero section profissional com CTA claro
14. **Header/topbar** — barra superior com título da página + ações contextuais

### 🟢 Baixa prioridade (robustez e futuro)
15. **Persistência com localStorage** — manter sessão e uploads entre reloads
16. **Testes unitários** — Vitest + Testing Library
17. **Acessibilidade** — aria-labels, focus trap, contraste verificado
18. **Exportação PDF** — impressão de antibiograma individual
19. **Mais dados mock** — 10-15 exames, 8-10 pacientes para simular volume real
20. **Documentação de componentes** — Storybook ou README técnico

---

*Arquivo gerado automaticamente como base de contexto para o plano de melhorias do produto BioLab.*
