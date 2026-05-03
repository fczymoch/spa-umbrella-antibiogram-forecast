# BioLab — Plano Faseado de Integração Frontend → Backend

> Documento de referência para substituição progressiva dos dados mock pelo backend real.  
> Versão: 1.0 · Data: 2026-04-27

---

## Sumário

- [Fase 0 — Infraestrutura Base](#fase-0--infraestrutura-base)
- [Fase 1 — Autenticação Real](#fase-1--autenticação-real)
- [Fase 2 — Dashboard](#fase-2--dashboard-homepage)
- [Fase 3 — Pacientes e Médicos](#fase-3--pacientes-e-médicos)
- [Fase 4 — Exames](#fase-4--exames-examspage--examdetailpage)
- [Fase 5 — Anexos](#fase-5--anexos)
- [Fase 6 — Relatórios PDF](#fase-6--relatórios-pdf)
- [Fase 7 — Admin e Configurações](#fase-7--admin--configurações)
- [Fase 8 — SSE Script Python](#fase-8--sse-script-python)
- [Ordem de Execução](#ordem-de-execução-sugerida)

---

## 🔵 Fase 0 — Infraestrutura Base

> Pré-requisito para todas as fases. Nenhum código de negócio aqui.

- [x] Instalar dependências: `axios` + `@tanstack/react-query`
- [x] Criar `src/api/client.ts`
  - Instância Axios com `baseURL` via `import.meta.env.VITE_API_URL`
  - Interceptor de requisição: injeta `Authorization: Bearer <token>`
  - Interceptor de resposta: captura `401` e dispara logout
- [x] Criar `src/api/auth.ts` — funções `login()`, `logout()`, `refreshToken()`
- [x] Criar `src/contexts/AuthContext.tsx`
  - Substitui o estado de `user` em `App.tsx`
  - Persiste token em `localStorage`
  - Expõe: `user`, `token`, `login()`, `logout()`, `isLoading`
- [x] Criar `src/hooks/useAuth.ts` — wrapper do contexto
- [x] Configurar `<QueryClientProvider>` em `main.tsx`
- [x] Criar `.env.local` com `VITE_API_URL=http://localhost:3333/v1`

---

## 🟢 Fase 1 — Autenticação Real

> LoginPage passa a bater no backend de verdade.

- [ ] `LoginPage.tsx` — substituir mock por `useMutation` → `POST /auth/login`
- [ ] Salvar JWT + dados do usuário no `AuthContext` após login
- [ ] `ProtectedRoute` passa a ler token do `AuthContext`
- [ ] `ProfilePage.tsx` — botão Salvar chama `PATCH /users/me`
- [ ] `ProfilePage.tsx` — campo de senha chama `PATCH /users/me/password`
- [ ] Logout chama `POST /auth/logout` antes de limpar o contexto

---

## 🟡 Fase 2 — Dashboard (HomePage)

> Uma única chamada substitui todos os mocks da home.

- [ ] Criar `src/api/dashboard.ts` — `GET /dashboard`
- [ ] `HomePage.tsx` — substituir dados de `mockData` por `useQuery(['dashboard'])`
- [ ] Adicionar skeleton/spinner nos cards e listas enquanto carrega
- [ ] Tratar erro com `<EmptyState>` já existente no projeto

---

## 🟠 Fase 3 — Pacientes e Médicos

> Telas de listagem e detalhe.

- [ ] Criar `src/api/patients.ts`
  - `getPatients(params)` → `GET /patients`
  - `getPatient(id)` → `GET /patients/:id`
  - `createPatient(data)` → `POST /patients`
  - `updatePatient(id, data)` → `PUT /patients/:id`
- [ ] `PatientsPage.tsx` — busca + filtro de risco via query params reais
- [ ] `PatientDetailPage.tsx` — `GET /patients/:id`
- [ ] Criar `src/api/doctors.ts`
  - `getDoctors(params)` → `GET /doctors`
  - `getDoctor(id)` → `GET /doctors/:id` (inclui `recentExams`)
- [ ] `DoctorsPage.tsx` + `DoctorDetailPage.tsx`

---

## 🔴 Fase 4 — Exames (ExamsPage + ExamDetailPage)

> Parte mais complexa — 6 filtros, paginação, antibiograma.

- [ ] Criar `src/api/exams.ts`
  - `getExams(params)` → `GET /exams` (com todos os filtros)
  - `getExam(id)` → `GET /exams/:id`
  - `createExam(data)` → `POST /exams`
  - `updateExam(id, data)` → `PUT /exams/:id`
  - `patchExamStatus(id, status)` → `PATCH /exams/:id/status`
- [ ] `ExamsPage.tsx` — mapear os 6 filtros para query params:

  | Filtro UI | Query param |
  |---|---|
  | Toggle Meus/Todos | `view=mine` / `view=all` |
  | Campo paciente | `patientName=...` |
  | Campo médico | `doctorName=...` |
  | Checkbox status | `status=Pendente&status=Em+análise` |
  | Data início | `dateFrom=YYYY-MM-DD` |
  | Data fim | `dateTo=YYYY-MM-DD` |

- [ ] `ExamDetailPage.tsx` — `GET /exams/:id` com antibiograma real
- [ ] Botões de mudança de status → `PATCH /exams/:id/status`
- [ ] Formulário de criação/edição → `POST` / `PUT /exams/:id`

> ⚠️ Lembrar: `collectedAt` vem como `"YYYY-MM-DD HH:mm"` — usar `new Date(value.replace(' ', 'T'))` para parsear.

---

## 🟣 Fase 5 — Anexos

> Upload real para o storage.

- [ ] Criar `src/api/attachments.ts`
  - `getAttachments(params)` → `GET /attachments`
  - `uploadAttachments(formData)` → `POST /attachments` (multipart/form-data)
  - `deleteAttachment(id)` → `DELETE /attachments/:id`
- [ ] `AttachmentsPage.tsx` — substituir mock por queries reais
- [ ] Exibir barra de progresso de upload (Axios `onUploadProgress`)
- [ ] Confirmação antes do `DELETE`

---

## ⚫ Fase 6 — Relatórios PDF

> jsPDF local → PDF gerado e armazenado no backend.

- [ ] Criar `src/api/reports.ts`
  - `getReports(params)` → `GET /reports`
  - `generateReport(examId)` → `POST /reports/generate`
  - `getReport(id)` → `GET /reports/:id`
  - `deleteReport(id)` → `DELETE /reports/:id`
- [ ] `ReportsPage.tsx` — substituir mock + `useMutation` para gerar
- [ ] Implementar **polling**: enquanto `status === 'generating'`, chamar `GET /reports/:id` a cada 2s
- [ ] `PdfViewerPage.tsx` — abrir `storageUrl` do backend diretamente no `<iframe>` (substitui blob URL do sessionStorage)
- [ ] Manter jsPDF como **fallback** se `storageUrl` vier nulo

---

## 🔶 Fase 7 — Admin e Configurações

> Somente após JWT com roles funcionando corretamente.

- [ ] Criar `src/api/admin.ts`
  - `getAdminStats()` → `GET /admin/stats`
  - `getSettings()` → `GET /admin/settings`
  - `updateSettings(data)` → `PUT /admin/settings`
- [ ] Criar (ou expandir) `src/api/users.ts`
  - `getUsers(params)` → `GET /users`
  - `createUser(data)` → `POST /users`
  - `patchUserStatus(id, status)` → `PATCH /users/:id/status`
- [ ] `AdminPage.tsx` aba *Overview* → `GET /admin/stats`
- [ ] `AdminPage.tsx` aba *Users* → lista + toggle ativo/inativo reais
- [ ] `AdminPage.tsx` aba *System* → `GET|PUT /admin/settings`
- [ ] `AdminPage.tsx` aba *OneDrive* → endpoints de integração:
  - `GET /integrations/onedrive/status`
  - `POST /integrations/onedrive/connect` (redirecionar para `authUrl`)
  - `DELETE /integrations/onedrive/disconnect`
  - `POST /integrations/onedrive/sync`

---

## ⬜ Fase 8 — SSE Script Python

> Última fase — infraestrutura mais específica de ambiente.

- [ ] Mover URL do SSE para `import.meta.env.VITE_SSE_URL` (hoje hardcoded em `localhost:3333`)
- [ ] `NewExamPage` — `EventSource` apontando para `VITE_SSE_URL/api/run`
- [ ] `GET /api/images` — galeria pós-execução usando URL do backend real
- [ ] Testar em produção com variáveis de ambiente corretas

---

## Ordem de Execução Sugerida

```
Fase 0  →  Fase 1  →  Fase 2  →  Fase 3  →  Fase 4  →  Fase 5  →  Fase 6  →  Fase 7  →  Fase 8
 Base      Auth      Dashboard   Pac/Med    Exames     Anexos     PDF        Admin       SSE
```

### Critérios de conclusão por fase

| Fase | Critério |
|---|---|
| 0 | `client.ts` funcionando, token sendo injetado nos headers |
| 1 | Login/logout real, ProfilePage salvando no backend |
| 2 | HomePage sem nenhum dado de `mockData` |
| 3 | PatientsPage e DoctorsPage paginando dados reais |
| 4 | ExamsPage com todos os 6 filtros funcionando via API |
| 5 | Upload de arquivo chegando no storage, URL real retornada |
| 6 | PDF gerado no servidor abrindo no PdfViewerPage |
| 7 | AdminPage sem nenhum mock, roles respeitadas |
| 8 | SSE funcionando via backend principal, sem depender do `server/index.cjs` local |

---

> Referência: `CONTRACT.md` — contém todos os shapes de request/response esperados pelo frontend.
