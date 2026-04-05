# 🚀 BioLab — Roadmap para Produto Profissional

> Plano de ação baseado na análise de `ANALYSIS.md`. Cada fase é executável de forma independente e entrega valor visível ao usuário final.

---

## Critérios de priorização

| Símbolo | Significado |
|---|---|
| 🔴 | Bloqueador / impacto imediato na percepção profissional |
| 🟡 | UX relevante / diferencial competitivo |
| 🟢 | Qualidade técnica / escalabilidade futura |
| 🔵 | Feature nova de produto |

---

## FASE 1 — Fundação Visual (Design System)
> **Objetivo:** Eliminar a inconsistência visual que mais denuncia que a app é um protótipo. Tudo que vem depois depende disso.

### 1.1 — Tokens CSS globais 🔴
**Arquivo:** `src/index.css`  
**O que fazer:** Substituir todas as cores e espaçamentos hardcoded por `custom properties` no `:root`.

```
Tokens a criar:
--color-primary, --color-primary-dark, --color-primary-light
--color-bg, --color-bg-secondary, --color-surface
--color-text, --color-text-muted, --color-border
--color-status-ok, --color-status-warn, --color-status-pending, --color-status-alert
--space-xs, --space-sm, --space-md, --space-lg, --space-xl
--radius-sm, --radius-md, --radius-lg
--shadow-sm, --shadow-md, --shadow-lg
--font-size-xs, --font-size-sm, --font-size-base, --font-size-lg, --font-size-xl
```

**Critério de conclusão:** `App.css` não contém mais nenhuma cor hex hardcoded.

---

### 1.2 — Reorganizar App.css em seções 🔴
**Arquivo:** `src/App.css`  
**O que fazer:** Dividir o arquivo de 649 linhas em blocos documentados com comentários de seção.

```
/* === RESET / BASE === */
/* === LAYOUT (shell, sidebar, content) === */
/* === NAVIGATION === */
/* === CARDS === */
/* === TYPOGRAPHY === */
/* === PILLS & BADGES === */
/* === FORMS === */
/* === TABLES === */
/* === ANIMATIONS === */
/* === PAGES ESPECÍFICAS === */
/* === RESPONSIVE === */
```

**Critério de conclusão:** Qualquer desenvolvedor consegue localizar uma regra em < 30s.

---

### 1.3 — Eliminar inline styles das páginas 🔴
**Arquivos:** `ExamsPage.tsx`, `ExamDetailPage.tsx`, `AdminPage.tsx`, `PatientsPage.tsx`, `DoctorsPage.tsx`  
**O que fazer:** Mover todos os `style={{ }}` para classes CSS com nomes semânticos.

```
Classes a criar:
.filter-panel, .filter-row, .filter-label
.date-input, .search-input
.active-filters-bar
.pagination-controls
.file-grid, .file-card, .file-card--selected
.pipeline-steps, .pipeline-step
.gallery-grid, .gallery-slot
```

**Critério de conclusão:** Zero ocorrências de `style={{` nos arquivos de página.

---

### 1.4 — Tipografia consistente 🔴
**Arquivo:** `src/index.css`  
**O que fazer:** Importar Inter via Google Fonts (ou self-host), definir escala tipográfica e hierarquia visual clara.

```css
/* Escala a implementar */
--font-size-xs: 0.75rem;    /* labels, badges */
--font-size-sm: 0.875rem;   /* muted, metadados */
--font-size-base: 1rem;     /* corpo */
--font-size-lg: 1.125rem;   /* subtítulos */
--font-size-xl: 1.25rem;    /* h3 */
--font-size-2xl: 1.5rem;    /* h2 */
--font-size-3xl: 2rem;      /* h1 página */
```

**Critério de conclusão:** Todos os `font-size` e `font-weight` usam variáveis.

---

## FASE 2 — Polimento de UX (Feedback & Estados)
> **Objetivo:** A aplicação precisa "falar" com o usuário — confirmar ações, indicar carregamento, tratar erros.

### 2.1 — Sistema de Toast Notifications 🟡
**Arquivo novo:** `src/components/Toast.tsx` + `src/components/ToastContext.tsx`  
**O que fazer:** Context + hook `useToast()` com suporte a tipos `success | error | warning | info`.

```tsx
// Uso esperado em qualquer página:
const { toast } = useToast()
toast.success('Arquivo enviado com sucesso!')
toast.error('Falha ao conectar ao OneDrive')
```

**Onde aplicar após criar:**
- `AttachmentsPage` — após upload bem-sucedido
- `AdminPage` — após conectar/desconectar OneDrive, após importar arquivos
- `LoginPage` — após erro de credenciais

**Critério de conclusão:** Nenhuma chamada a `alert()` ou `console.error()` visível ao usuário.

---

### 2.2 — Skeleton Loaders 🟡
**Arquivo novo:** `src/components/Skeleton.tsx`  
**O que fazer:** Componente de placeholder animado (pulse animation) para:

```
<SkeletonCard />       → substitui .card enquanto carrega
<SkeletonList n={5} /> → substitui .list com N linhas
<SkeletonText />       → substitui um parágrafo de texto
```

**Onde aplicar:** `HomePage`, `ExamsPage`, `PatientsPage` (simular um delay de 800ms no mock para demonstrar).

**Critério de conclusão:** Ao recarregar a página, há 800ms de skeleton antes dos dados aparecerem.

---

### 2.3 — Empty States 🟡
**Arquivo novo:** `src/components/EmptyState.tsx`  
**O que fazer:** Componente padronizado para listas vazias.

```tsx
<EmptyState
  icon="🔬"
  title="Nenhum antibiograma encontrado"
  description="Tente ajustar os filtros ou adicionar novos exames."
  action={<button>Limpar filtros</button>}
/>
```

**Onde aplicar:**
- `ExamsPage` — quando filtros não retornam resultados
- `AttachmentsPage` — quando não há anexos
- `PatientsPage` — quando não há pacientes
- `PatientDetailPage` — quando paciente não tem exames

**Critério de conclusão:** Nenhuma lista exibe estado vazio sem feedback visual.

---

### 2.4 — Error Boundary Global 🔴
**Arquivo novo:** `src/components/ErrorBoundary.tsx`  
**O que fazer:** Class component React que captura erros de render e exibe tela amigável.

```tsx
// Em main.tsx
<ErrorBoundary>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ErrorBoundary>
```

**Tela de fallback deve mostrar:**
- Mensagem amigável ("Algo deu errado")
- Botão "Recarregar página"
- (opcional) detalhes técnicos colapsáveis

**Critério de conclusão:** Um erro de runtime não deixa a tela em branco.

---

### 2.5 — Loading states nos botões 🟡
**O que fazer:** Botões que disparam ações assíncronas devem ter estado de loading.

```tsx
<button disabled={isLoading}>
  {isLoading ? <Spinner size="sm" /> : 'Salvar e compartilhar'}
</button>
```

**Arquivo novo:** `src/components/Spinner.tsx`

**Onde aplicar:** `AttachmentsPage` (upload), `AdminPage` (conectar OneDrive), `LoginPage` (submit).

---

## FASE 3 — Layout & Navegação Profissional
> **Objetivo:** A estrutura da interface precisa transmitir confiança e orientar o usuário com clareza.

### 3.1 — Topbar / Header por página 🟡
**Arquivo:** `src/components/ShellLayout.tsx`  
**O que fazer:** Adicionar uma barra superior horizontal com:
- Título dinâmico da página atual
- Breadcrumb contextual (ex: `Antibiogramas > Klebsiella pneumoniae`)
- Avatar do usuário com menu dropdown (Perfil / Sair)
- (opcional) campo de busca global

```
┌─────────────────────────────────────────────────────────┐
│  Antibiogramas > Klebsiella pneumoniae    [👤 Dr. João ▾]│
└─────────────────────────────────────────────────────────┘
```

**Critério de conclusão:** Usuário sempre sabe onde está e acessa perfil/logout com um clique.

---

### 3.2 — Sidebar mobile com hamburguer 🔴
**Arquivos:** `src/components/ShellLayout.tsx`, `src/App.css`  
**O que fazer:** Em telas < 768px, a sidebar deve:
- Ficar oculta por padrão
- Aparecer como drawer lateral ao clicar no botão hamburguer
- Fechar ao clicar em um link ou fora do drawer
- Overlay escuro atrás do drawer

**Estado atual:** A sidebar simplesmente vira `flex-direction: row` em mobile — inutilizável.

**Critério de conclusão:** A app é 100% navegável em smartphone (375px).

---

### 3.3 — LandingPage profissional 🟡
**Arquivo:** `src/pages/LandingPage.tsx`  
**O que fazer:** Reformular a landing com estrutura de produto SaaS médico:

```
Seções:
1. Hero — headline forte + CTA primário + screenshot/mockup da app
2. Problema/Solução — "Por que usar BioLab?"
3. Features — 6 cards com ícone, título e descrição
4. Como funciona — 3 passos numerados
5. CTA final — botão de acesso
6. Footer — versão + copyright
```

**Critério de conclusão:** A LandingPage convence um médico a fazer login.

---

### 3.4 — Melhorar LoginPage 🟡
**Arquivo:** `src/pages/LoginPage.tsx`  
**O que fazer:**
- Adicionar logo/brand no topo do card
- Adicionar mensagem de erro quando e-mail está vazio ou inválido
- Adicionar link "Esqueci minha senha" (placeholder)
- Adicionar indicador de campo obrigatório
- Melhorar visual do background (usar o gradiente da landing)

---

### 3.5 — Página de Detalhe de Médico 🔵
**Arquivo novo:** `src/pages/DoctorDetailPage.tsx`  
**O que fazer:** Criar rota `/app/doctors/:id` com:
- Dados do médico (especialidade, turno, contato)
- Lista de antibiogramas associados
- Link para cada antibiograma

**Critério de conclusão:** `DoctorsPage` tem link "Ver perfil" funcionando.

---

## FASE 4 — Dados & Persistência
> **Objetivo:** A app não pode perder dados ao recarregar a página. Isso é expectativa mínima do usuário.

### 4.1 — Persistência com localStorage 🟡
**Arquivo novo:** `src/hooks/useLocalStorage.ts`  
**O que fazer:** Hook genérico para sincronizar estado com localStorage.

```ts
const [attachments, setAttachments] = useLocalStorage<Attachment[]>(
  'biolab:attachments',
  initialAttachments
)
```

**Onde aplicar:** `attachments` em `AppNew.tsx` (estado principal de uploads).

**Critério de conclusão:** Upload de arquivo persiste após F5.

---

### 4.2 — Expandir dados mock 🟡
**Arquivo:** `src/data/mockData.ts`  
**O que fazer:** Expandir para simular um volume realista:

```
Pacientes: 3 → 12
Médicos:   3 → 6
Exames:    3 → 18 (cobrir todos os pacientes e médicos cruzados)
Consultas: 3 → 8
Anexos:    2 → 8
```

**Por que:** Com 3 itens, filtros e paginação nunca são testados visualmente. A app parece vazia.

---

### 4.3 — Serviço de dados abstraído 🟢
**Arquivo novo:** `src/services/dataService.ts`  
**O que fazer:** Extrair o acesso aos dados mock para um serviço com interface assíncrona (retorna Promises), preparando a substituição futura por API real.

```ts
export const dataService = {
  getExams: () => Promise.resolve(exams),
  getPatients: () => Promise.resolve(patients),
  getDoctors: () => Promise.resolve(doctors),
  getAttachments: () => Promise.resolve(attachments),
}
```

**Critério de conclusão:** `AppNew.tsx` busca dados via `dataService`, não importa os arrays diretamente.

---

## FASE 5 — Identidade e Detalhes Finais
> **Objetivo:** Os "detalhes" que separam protótipo de produto.

### 5.1 — Meta e identidade do browser 🔴
**Arquivo:** `index.html`  
**O que fazer:**
```html
<title>BioLab — Painel de Antibiogramas</title>
<meta name="description" content="Plataforma de monitoramento de antibiogramas e laudos microbiológicos." />
<meta name="theme-color" content="#2563eb" />
<link rel="icon" href="/biolab-icon.svg" /> <!-- criar ícone SVG personalizado -->
```

**Estado atual:** título `pi_7sem`, favicon padrão do Vite.

---

### 5.2 — Favicon e ícone SVG 🔴
**Arquivo novo:** `public/biolab-icon.svg`  
**O que fazer:** Criar ícone vetorial simples com as iniciais "BL" ou um símbolo de microscópio/molécula.

---

### 5.3 — Remover App.tsx morto 🟢
**Arquivo:** `src/App.tsx`  
**O que fazer:** Deletar ou renomear `AppNew.tsx → App.tsx` e atualizar o import em `main.tsx`.

---

### 5.4 — Modo Escuro 🟢
**Arquivo:** `src/index.css` + `src/components/ShellLayout.tsx`  
**O que fazer:** Usar `prefers-color-scheme` + toggle manual com `data-theme="dark"` no `<html>`.

```css
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-text: #e2e8f0;
  /* ... */
}
```

---

### 5.5 — Acessibilidade básica 🟢
**O que fazer:**
- Adicionar `aria-label` em todos os botões sem texto visível
- Garantir `alt` em todas as imagens
- `<label>` associado a todos os inputs via `htmlFor`
- Testar navegação completa por teclado (Tab order lógico)
- Verificar contraste de cor (mínimo WCAG AA: 4.5:1)

---

## FASE 6 — Qualidade & Confiabilidade
> **Objetivo:** Código que não quebra e que pode ser entregue a outros desenvolvedores.

### 6.1 — Testes unitários com Vitest 🟢
**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

**Testes prioritários:**
- `statusClass()` → todas as entradas possíveis
- `mapInterpretation()` → S, I, R
- Filtros de `ExamsPage` → combinações de filtro retornam resultados corretos
- `ProtectedRoute` → redireciona quando `user === null`

---

### 6.2 — Lint rigoroso 🟢
**Arquivo:** `eslint.config.js`  
**O que fazer:** Adicionar regras:
- `no-console` (warn) — remover console.logs esquecidos
- `react/prop-types` desativado (TypeScript cuida disso)
- `@typescript-eslint/no-explicit-any` (error)
- `react-hooks/exhaustive-deps` (error)

---

### 6.3 — README técnico completo 🟢
**Arquivo:** `README.md`  
**O que fazer:** Documentar:
- Como rodar o projeto (`npm install`, `npm run dev`)
- Estrutura de pastas
- Como adicionar novos dados mock
- Como criar uma nova página
- Variáveis de ambiente disponíveis

---

## Resumo das Fases

| Fase | Nome | Effort | Impacto Profissional |
|---|---|---|---|
| **1** | Fundação Visual (Design System) | 🕐🕐🕐 Alto | ⭐⭐⭐⭐⭐ Crítico |
| **2** | Polimento de UX | 🕐🕐 Médio | ⭐⭐⭐⭐ Alto |
| **3** | Layout & Navegação | 🕐🕐🕐 Alto | ⭐⭐⭐⭐⭐ Crítico |
| **4** | Dados & Persistência | 🕐 Baixo | ⭐⭐⭐ Médio |
| **5** | Identidade e Detalhes | 🕐 Baixo | ⭐⭐⭐⭐ Alto |
| **6** | Qualidade & Confiabilidade | 🕐🕐 Médio | ⭐⭐ Baixo (interno) |

---

## Sequência recomendada de execução

```
Fase 5.1 → 5.2 → 5.3   (quick wins: 30min — muda a percepção imediata)
    ↓
Fase 1.1 → 1.2 → 1.4   (tokens CSS — base para tudo)
    ↓
Fase 1.3                (eliminar inline styles — depende de 1.1)
    ↓
Fase 2.4 → 2.1 → 2.5   (error boundary + toasts + loading)
    ↓
Fase 3.2 → 3.1          (mobile sidebar + topbar)
    ↓
Fase 4.2 → 4.1          (mais dados + persistência localStorage)
    ↓
Fase 2.2 → 2.3          (skeletons + empty states)
    ↓
Fase 3.3 → 3.4 → 3.5   (landing, login, detalhe médico)
    ↓
Fase 4.3                (service layer)
    ↓
Fase 5.4 → 5.5          (dark mode + a11y)
    ↓
Fase 6.1 → 6.2 → 6.3   (testes, lint, docs)
```

---

## Checklist de execução

### Fase 1 — Design System
- [ ] 1.1 Tokens CSS no `:root`
- [ ] 1.2 App.css organizado em seções
- [ ] 1.3 Inline styles removidos
- [ ] 1.4 Escala tipográfica com variáveis

### Fase 2 — Feedback & Estados
- [ ] 2.1 Toast notifications
- [ ] 2.2 Skeleton loaders
- [ ] 2.3 Empty states
- [ ] 2.4 Error boundary
- [ ] 2.5 Loading states nos botões

### Fase 3 — Layout & Navegação
- [ ] 3.1 Topbar com breadcrumb e avatar
- [ ] 3.2 Sidebar mobile (drawer/hamburguer)
- [ ] 3.3 LandingPage profissional
- [ ] 3.4 LoginPage melhorada
- [ ] 3.5 Página de detalhe do médico

### Fase 4 — Dados & Persistência
- [ ] 4.1 useLocalStorage hook
- [ ] 4.2 Mock data expandido (12 pacientes, 18 exames)
- [ ] 4.3 dataService layer

### Fase 5 — Identidade
- [ ] 5.1 Meta tags e título do browser
- [ ] 5.2 Favicon SVG personalizado
- [ ] 5.3 Remover App.tsx morto
- [ ] 5.4 Modo escuro
- [ ] 5.5 Acessibilidade básica

### Fase 6 — Qualidade
- [ ] 6.1 Testes unitários (Vitest)
- [ ] 6.2 ESLint rigoroso
- [ ] 6.3 README técnico

---

*Roadmap criado em 04/04/2026 — BioLab v1.0 → v2.0*
