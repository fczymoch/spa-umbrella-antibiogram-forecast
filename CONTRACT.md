# BioLab — Contrato de API e Banco de Dados

> Documento gerado a partir da varredura completa do frontend.  
> Versão: 1.0 · Data: 2026-04-27  
> Stack sugerida: **Node.js + Express + PostgreSQL** (ou equivalente)

---

## Sumário

1. [Convenções Gerais](#1-convenções-gerais)
2. [Banco de Dados — Esquema](#2-banco-de-dados--esquema)
3. [Autenticação](#3-autenticação)
4. [Endpoints — Usuários e Perfil](#4-endpoints--usuários-e-perfil)
5. [Endpoints — Pacientes](#5-endpoints--pacientes)
6. [Endpoints — Médicos](#6-endpoints--médicos)
7. [Endpoints — Antibiogramas (Exames)](#7-endpoints--antibiogramas-exames)
8. [Endpoints — Anexos](#8-endpoints--anexos)
9. [Endpoints — Relatórios PDF](#9-endpoints--relatórios-pdf)
10. [Endpoints — Execução de Script (SSE)](#10-endpoints--execução-de-script-sse)
11. [Endpoints — OneDrive](#11-endpoints--onedrive)
12. [Endpoints — Admin / Sistema](#12-endpoints--admin--sistema)
13. [Enumerações e Tipos Compartilhados](#13-enumerações-e-tipos-compartilhados)
14. [Estrutura de Erros](#14-estrutura-de-erros)
15. [Notas de Implementação](#15-notas-de-implementação)

---

## 1. Convenções Gerais

| Item | Valor |
|---|---|
| Base URL | `https://api.biolab.local/v1` |
| Formato | JSON (`Content-Type: application/json`) |
| Autenticação | Bearer JWT no header `Authorization` |
| Datas | ISO 8601 — `"2026-03-01T09:40:00Z"` |
| IDs | UUID v4 |
| Paginação | Query params `?page=1&limit=20` — resposta com `{ data, total, page, limit }` |
| Upload de arquivos | `multipart/form-data` |

---

## 2. Banco de Dados — Esquema

### 2.1 Tabela `users`

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150)  NOT NULL,
  email       VARCHAR(255)  UNIQUE NOT NULL,
  password    VARCHAR(255)  NOT NULL,                     -- bcrypt hash
  role        VARCHAR(100)  NOT NULL,                     -- ex: 'Coordenador Clínico', 'Infectologista'
  shift       VARCHAR(100),                               -- ex: '07h – 19h'
  status      VARCHAR(10)   NOT NULL DEFAULT 'Ativo'      CHECK (status IN ('Ativo','Inativo')),
  doctor_id   UUID          REFERENCES doctors(id),       -- vínculo opcional com tabela doctors
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 2.2 Tabela `patients`

```sql
CREATE TABLE patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150)  NOT NULL,
  age         SMALLINT      NOT NULL CHECK (age > 0),
  bed         VARCHAR(80)   NOT NULL,                     -- ex: 'UTI 03', 'Enf 204'
  risk        VARCHAR(10)   NOT NULL CHECK (risk IN ('Verde','Amarelo','Vermelho')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 2.3 Tabela `doctors`

```sql
CREATE TABLE doctors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150)  NOT NULL,
  specialty   VARCHAR(100)  NOT NULL,                     -- ex: 'Infectologia'
  shift       VARCHAR(80),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 2.4 Tabela `exams`

```sql
CREATE TABLE exams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID          NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id     UUID          NOT NULL REFERENCES doctors(id)  ON DELETE RESTRICT,
  organism      VARCHAR(200)  NOT NULL,                        -- ex: 'Klebsiella pneumoniae'
  specimen      VARCHAR(100)  NOT NULL,                        -- ex: 'Hemocultura', 'Urina'
  site          VARCHAR(150),                                  -- ex: 'UTI - Leito 03'
  collected_at  TIMESTAMPTZ   NOT NULL,
  status        VARCHAR(30)   NOT NULL DEFAULT 'Pendente'
                CHECK (status IN ('Pendente','Em análise','Pendente de avaliação','Finalizado')),
  source        VARCHAR(20)   NOT NULL DEFAULT 'Bucket'
                CHECK (source IN ('OneDrive','Bucket')),
  preview_url   TEXT,                                          -- URL pública da imagem de preview
  notes         TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 2.5 Tabela `antibiogram_entries`

```sql
CREATE TABLE antibiogram_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         UUID          NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  antibiotic      VARCHAR(150)  NOT NULL,
  mic             VARCHAR(30)   NOT NULL,                      -- ex: '≤0.25', '≥64'
  interpretation  CHAR(1)       NOT NULL CHECK (interpretation IN ('S','I','R')),
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 2.6 Tabela `attachments`

```sql
CREATE TABLE attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name    VARCHAR(255)  NOT NULL,
  file_type    VARCHAR(100),                                   -- ex: 'Laboratório', 'Imagem'
  file_size    BIGINT        NOT NULL,                        -- bytes
  storage_url  TEXT          NOT NULL,                        -- URL no bucket/storage
  notes        TEXT,
  uploaded_by  UUID          REFERENCES users(id),
  uploaded_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 2.7 Tabela `reports`

```sql
CREATE TABLE reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id      UUID          NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  title        VARCHAR(300)  NOT NULL,
  storage_url  TEXT,                                           -- URL do PDF gerado no storage
  status       VARCHAR(15)   NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','generating','ready','error')),
  generated_at TIMESTAMPTZ,
  generated_by UUID          REFERENCES users(id),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 2.8 Tabela `appointments`

```sql
CREATE TABLE appointments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID          REFERENCES patients(id),
  patient_name VARCHAR(150),                                   -- fallback se sem FK
  scheduled_at TIMESTAMPTZ  NOT NULL,
  location    VARCHAR(150),
  type        VARCHAR(150),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 2.9 Tabela `system_settings` *(para painel Admin)*

```sql
CREATE TABLE system_settings (
  key         VARCHAR(100) PRIMARY KEY,
  value       TEXT         NOT NULL,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
-- exemplos de chaves: 'script_name', 'server_port', 'onedrive_connected'
```

---

## 3. Autenticação

### `POST /auth/login`

**Request:**
```json
{
  "email": "carlos.martins@biolab.com",
  "password": "senha123"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "expiresIn": 86400,
  "user": {
    "id": "uuid",
    "name": "Dr. Carlos Martins",
    "email": "carlos.martins@biolab.com",
    "role": "Infectologista",
    "shift": "07h – 19h",
    "doctorId": "uuid-do-doctor",
    "status": "Ativo"
  }
}
```

**Response `401`:**
```json
{ "error": "Credenciais inválidas" }
```

---

### `POST /auth/logout`

Invalida o token no servidor (blacklist ou refresh token revogado).

**Response `204`** — sem body.

---

### `POST /auth/refresh`

**Request:**
```json
{ "refreshToken": "<token>" }
```

**Response `200`:**
```json
{ "token": "<novo-jwt>", "expiresIn": 86400 }
```

---

## 4. Endpoints — Usuários e Perfil

### `GET /users/me`
Retorna o perfil do usuário autenticado.

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "Dr. Carlos Martins",
  "email": "carlos.martins@biolab.com",
  "role": "Infectologista",
  "shift": "07h – 19h",
  "status": "Ativo",
  "doctorId": "uuid",
  "createdAt": "2026-01-10T08:00:00Z"
}
```

---

### `PATCH /users/me`
Atualiza nome, email, role, shift do usuário autenticado.

**Request:**
```json
{
  "name": "Dr. Carlos A. Martins",
  "email": "carlos.martins@biolab.com",
  "role": "Infectologista",
  "shift": "07h – 19h"
}
```

**Response `200`:** objeto `User` atualizado.

---

### `PATCH /users/me/password`

**Request:**
```json
{
  "currentPassword": "antiga",
  "newPassword": "nova123"
}
```

**Response `204`** — sem body.

---

### `GET /users` *(Admin only)*
Lista todos os usuários do sistema.

**Query params:** `?page=1&limit=20&status=Ativo`

**Response `200`:**
```json
{
  "data": [ { "id": "uuid", "name": "...", "email": "...", "role": "...", "shift": "...", "status": "Ativo" } ],
  "total": 6,
  "page": 1,
  "limit": 20
}
```

---

### `PATCH /users/:id/status` *(Admin only)*
Ativa ou desativa um usuário.

**Request:**
```json
{ "status": "Inativo" }
```

**Response `200`:** objeto `User` atualizado.

---

### `POST /users` *(Admin only)*
Cria um novo usuário.

**Request:**
```json
{
  "name": "Novo Médico",
  "email": "novo@biolab.com",
  "password": "temporaria123",
  "role": "Clínica Geral",
  "shift": "08h – 16h"
}
```

**Response `201`:** objeto `User` criado.

---

## 5. Endpoints — Pacientes

### `GET /patients`

**Query params:** `?page=1&limit=20&risk=Vermelho&search=pedro`

**Response `200`:**
```json
{
  "data": [
    { "id": "uuid", "name": "Pedro Lima", "age": 51, "bed": "UTI 03", "risk": "Vermelho" }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

---

### `GET /patients/:id`

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "Pedro Lima",
  "age": 51,
  "bed": "UTI 03",
  "risk": "Vermelho",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-03-01T08:00:00Z"
}
```

---

### `POST /patients`

**Request:**
```json
{ "name": "João Silva", "age": 45, "bed": "Enf 301", "risk": "Verde" }
```

**Response `201`:** objeto `Patient` criado.

---

### `PUT /patients/:id`

**Request:** todos os campos editáveis.

**Response `200`:** objeto atualizado.

---

## 6. Endpoints — Médicos

### `GET /doctors`

**Query params:** `?page=1&limit=20&specialty=Infectologia`

**Response `200`:**
```json
{
  "data": [
    { "id": "uuid", "name": "Dr. Carlos Martins", "specialty": "Infectologia", "shift": "07h – 19h" }
  ],
  "total": 6,
  "page": 1,
  "limit": 20
}
```

---

### `GET /doctors/:id`

Retorna médico com lista de seus exames recentes.

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "Dr. Carlos Martins",
  "specialty": "Infectologia",
  "shift": "07h – 19h",
  "recentExams": [ { "id": "uuid", "organism": "...", "status": "..." } ]
}
```

---

## 7. Endpoints — Antibiogramas (Exames)

### `GET /exams`

**Query params:** `?page=1&limit=20&status=Pendente&doctorId=uuid&patientId=uuid`

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "patientName": "Pedro Lima",
      "doctorId": "uuid",
      "doctorName": "Dr. Carlos Martins",
      "organism": "Klebsiella pneumoniae",
      "specimen": "Hemocultura",
      "site": "UTI - Leito 03",
      "collectedAt": "2026-02-29T22:15:00Z",
      "status": "Em análise",
      "source": "OneDrive",
      "previewUrl": "https://storage.biolab.local/previews/ex1.jpg"
    }
  ],
  "total": 18,
  "page": 1,
  "limit": 20
}
```

---

### `GET /exams/:id`

Retorna o exame com o antibiograma completo.

**Response `200`:**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "patientName": "Pedro Lima",
  "doctorId": "uuid",
  "doctorName": "Dr. Carlos Martins",
  "organism": "Klebsiella pneumoniae",
  "specimen": "Hemocultura",
  "site": "UTI - Leito 03",
  "collectedAt": "2026-02-29T22:15:00Z",
  "status": "Em análise",
  "source": "OneDrive",
  "previewUrl": "https://storage.biolab.local/previews/ex1.jpg",
  "notes": "Paciente em ventilação; avaliar carbapenêmicos.",
  "antibiogram": [
    { "id": "uuid", "antibiotic": "Meropenem", "mic": "≤0.25", "interpretation": "S", "sortOrder": 0 }
  ],
  "createdAt": "2026-02-29T22:30:00Z",
  "updatedAt": "2026-03-01T08:00:00Z"
}
```

---

### `POST /exams`

**Request:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "organism": "Klebsiella pneumoniae",
  "specimen": "Hemocultura",
  "site": "UTI - Leito 03",
  "collectedAt": "2026-02-29T22:15:00Z",
  "source": "Bucket",
  "notes": "Opcional",
  "antibiogram": [
    { "antibiotic": "Meropenem", "mic": "≤0.25", "interpretation": "S" }
  ]
}
```

**Response `201`:** objeto `Exam` completo.

---

### `PATCH /exams/:id/status`

**Request:**
```json
{ "status": "Finalizado" }
```

**Response `200`:** objeto `Exam` atualizado.

---

### `PUT /exams/:id`

Atualiza todos os campos editáveis do exame + antibiograma.

**Response `200`:** objeto `Exam` completo.

---

## 8. Endpoints — Anexos

### `GET /attachments`

**Query params:** `?page=1&limit=20`

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "fileName": "Hemograma - Pedro Lima.pdf",
      "fileType": "Laboratório",
      "fileSize": 1258291,
      "storageUrl": "https://storage.biolab.local/attachments/uuid.pdf",
      "notes": "Pré-cirúrgico",
      "uploadedBy": "uuid",
      "uploadedAt": "2026-02-28T09:10:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20
}
```

---

### `POST /attachments`

Upload de arquivos. Aceita `multipart/form-data`.

**Form fields:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| `files` | `File[]` | ✅ |
| `notes` | `string` | ❌ |

**Response `201`:**
```json
{
  "uploaded": [
    { "id": "uuid", "fileName": "...", "fileSize": 123456, "storageUrl": "...", "uploadedAt": "..." }
  ]
}
```

---

### `DELETE /attachments/:id`

**Response `204`** — sem body.

---

## 9. Endpoints — Relatórios PDF

### `GET /reports`

**Query params:** `?page=1&limit=20&examId=uuid`

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "examId": "uuid",
      "title": "Relatório de Antibiograma — Klebsiella pneumoniae",
      "patientName": "Pedro Lima",
      "status": "ready",
      "storageUrl": "https://storage.biolab.local/reports/uuid.pdf",
      "generatedAt": "2026-04-23T14:30:00Z",
      "generatedBy": "uuid"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

---

### `POST /reports/generate`

Solicita a geração assíncrona de um relatório PDF para um exame.

**Request:**
```json
{ "examId": "uuid" }
```

**Response `202`:**
```json
{
  "reportId": "uuid",
  "status": "generating",
  "message": "Relatório em processamento. Consulte GET /reports/:id para acompanhar."
}
```

---

### `GET /reports/:id`

**Response `200`:**
```json
{
  "id": "uuid",
  "examId": "uuid",
  "title": "Relatório de Antibiograma — Klebsiella pneumoniae",
  "status": "ready",
  "storageUrl": "https://storage.biolab.local/reports/uuid.pdf",
  "generatedAt": "2026-04-23T14:32:00Z"
}
```

---

### `DELETE /reports/:id`

**Response `204`** — sem body.

---

## 10. Endpoints — Execução de Script (SSE)

> Esses endpoints já existem no servidor Express local (`server/index.cjs`). Documentados aqui para integração futura no backend principal.

### `GET /api/run`

Executa o script Python de análise e transmite o output em tempo real via **Server-Sent Events**.

**Headers de resposta:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Eventos SSE:**
```
data: {"type": "stdout", "text": "Processando disco 1..."}
data: {"type": "stderr", "text": "Aviso: imagem com baixo contraste"}
data: {"type": "exit",   "text": "0"}
```

| `type` | Significado |
|---|---|
| `stdout` | Saída normal do script |
| `stderr` | Erros/avisos do script |
| `exit` | Script encerrou; `text` = código de saída (`"0"` = sucesso) |

---

### `GET /api/images`

Retorna as imagens geradas pelo script após a execução.

**Response `200`:**
```json
{
  "groups": [
    {
      "name": "disco1",
      "images": [
        { "label": "analise_75px", "url": "http://localhost:3333/output/disco1/analise_75px.png" }
      ]
    }
  ],
  "flat": [
    { "label": "analise_75px", "url": "http://localhost:3333/output/disco1/analise_75px.png" }
  ]
}
```

---

### `GET /api/health`

**Response `200`:**
```json
{ "status": "ok", "uptime": 3600 }
```

---

## 11. Endpoints — OneDrive

### `GET /integrations/onedrive/status`

**Response `200`:**
```json
{
  "connected": true,
  "accountEmail": "lab@hospital.com",
  "syncFolder": "/BioLab/Antibiogramas",
  "lastSync": "2026-04-23T10:00:00Z"
}
```

---

### `POST /integrations/onedrive/connect`

Inicia fluxo OAuth 2.0 com a Microsoft.

**Response `200`:**
```json
{ "authUrl": "https://login.microsoftonline.com/..." }
```

*(Frontend redireciona o usuário para `authUrl`)*

---

### `GET /integrations/onedrive/callback`

Recebe o `code` OAuth da Microsoft e finaliza a conexão.

**Query params:** `?code=...&state=...`

**Response `302`** — Redireciona para `/app/admin?tab=onedrive&connected=true`.

---

### `DELETE /integrations/onedrive/disconnect`

**Response `204`** — sem body.

---

### `POST /integrations/onedrive/sync`

Força a sincronização imediata.

**Response `200`:**
```json
{ "synced": 3, "errors": 0, "lastSync": "2026-04-27T15:00:00Z" }
```

---

## 12. Endpoints — Admin / Sistema

### `GET /admin/stats`

Retorna estatísticas do painel administrativo.

**Response `200`:**
```json
{
  "exams": {
    "total": 18,
    "pendente": 5,
    "emAnalise": 5,
    "pendenteAvaliacao": 4,
    "finalizado": 4
  },
  "patients": { "total": 12 },
  "doctors": { "total": 6 },
  "users": { "total": 6, "active": 5 }
}
```

---

### `GET /admin/settings`

**Response `200`:**
```json
{
  "scriptName": "GerarGrafico2D_DetectarHalo_v3_azul.py",
  "serverPort": "3333"
}
```

---

### `PUT /admin/settings`

**Request:**
```json
{
  "scriptName": "GerarGrafico2D_DetectarHalo_v3_azul.py",
  "serverPort": "3333"
}
```

**Response `200`:** configurações atualizadas.

---

## 13. Enumerações e Tipos Compartilhados

```typescript
// Status de exame
type ExamStatus = 'Pendente' | 'Em análise' | 'Pendente de avaliação' | 'Finalizado'

// Fonte do exame
type ExamSource = 'OneDrive' | 'Bucket'

// Interpretação do antibiograma (CLSI/EUCAST)
type Interpretation = 'S' | 'I' | 'R'
// S = Sensível | I = Intermediário | R = Resistente

// Nível de risco do paciente
type PatientRisk = 'Verde' | 'Amarelo' | 'Vermelho'

// Status do usuário
type UserStatus = 'Ativo' | 'Inativo'

// Status do relatório
type ReportStatus = 'pending' | 'generating' | 'ready' | 'error'
```

---

## 14. Estrutura de Erros

Todos os endpoints retornam erros neste formato:

```json
{
  "error": "Mensagem legível por humanos",
  "code": "EXAM_NOT_FOUND",
  "details": {}
}
```

| HTTP Status | Situação |
|---|---|
| `400` | Payload inválido / campos faltando |
| `401` | Token ausente ou expirado |
| `403` | Sem permissão (ex: não-admin acessando `/admin/*`) |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: email já cadastrado) |
| `422` | Entidade não processável (ex: status inválido) |
| `500` | Erro interno do servidor |

---

## 15. Filtros e Paginação — Detalhamento por Tela

### Tela ExamsPage (`GET /exams`)

O frontend envia os seguintes query params:

| Param | Tipo | Exemplo | Descrição |
|---|---|---|---|
| `view` | `'all' \| 'mine'` | `?view=mine` | `mine` filtra pelo `doctorId` do usuário logado |
| `patientName` | `string` | `?patientName=Pedro` | Busca por nome do paciente (ilike) |
| `doctorName` | `string` | `?doctorName=Carlos` | Busca por nome do médico (ilike) |
| `status` | `string[]` | `?status=Pendente&status=Em+análise` | Filtro multi-status |
| `dateFrom` | `YYYY-MM-DD` | `?dateFrom=2026-03-01` | collected_at >= dateFrom |
| `dateTo` | `YYYY-MM-DD` | `?dateTo=2026-03-05` | collected_at <= dateTo 23:59:59 |
| `page` | `number` | `?page=2` | Padrão: 1 |
| `limit` | `number` | `?limit=10` | Padrão: 10 |

**Response esperada pela tela** (campos inline obrigatórios):
```json
{
  "data": [{
    "id": "uuid",
    "patientId": "uuid",
    "patientName": "Pedro Lima",
    "doctorId": "uuid",
    "doctorName": "Dr. Carlos Martins",
    "organism": "Klebsiella pneumoniae",
    "specimen": "Hemocultura",
    "site": "UTI - Leito 03",
    "collectedAt": "2026-02-29 22:15",
    "status": "Em análise",
    "source": "OneDrive",
    "previewUrl": "https://..."
  }],
  "total": 18,
  "page": 1,
  "limit": 10
}
```

> ⚠️ `collectedAt` deve ser retornado no formato `"YYYY-MM-DD HH:mm"` (sem timezone) — o frontend usa `new Date(value.replace(' ', 'T'))` para parsear.

---

### Tela PatientsPage (`GET /patients`)

| Param | Tipo | Descrição |
|---|---|---|
| `search` | `string` | Busca por nome ou leito (ilike) |
| `risk` | `'Verde' \| 'Amarelo' \| 'Vermelho'` | Filtro de risco |
| `page` / `limit` | `number` | Paginação |

---

### Tela DoctorsPage (`GET /doctors`)

| Param | Tipo | Descrição |
|---|---|---|
| `search` | `string` | Busca por nome ou especialidade |
| `page` / `limit` | `number` | Paginação |

---

### Tela HomePage — Endpoint de Dashboard

O `HomePage` consome:
1. `GET /exams` — contagem por status (Doughnut chart) e lista dos últimos Finalizados
2. `GET /attachments` — contagem e lista dos uploads recentes
3. `GET /appointments` — agenda do dia/semana

Recomenda-se um endpoint agregado para evitar 3 chamadas paralelas:

### `GET /dashboard`

**Response `200`:**
```json
{
  "exams": {
    "total": 18,
    "byStatus": {
      "Pendente": 5,
      "Em análise": 5,
      "Pendente de avaliação": 4,
      "Finalizado": 4
    },
    "recentFinalized": [
      {
        "id": "uuid",
        "patientName": "Ana Júlia",
        "organism": "Staphylococcus aureus (MRSA)",
        "collectedAt": "2026-03-01 08:05",
        "status": "Finalizado",
        "previewUrl": "https://..."
      }
    ]
  },
  "attachments": {
    "total": 8,
    "recent": [
      { "id": "uuid", "fileName": "Hemograma - Pedro Lima.pdf", "uploadedAt": "2026-02-28 09:10" }
    ]
  },
  "appointments": [
    {
      "id": "uuid",
      "patientName": "Ana Júlia",
      "scheduledAt": "2026-04-27T14:00:00Z",
      "location": "Sala 02 - Bloco A",
      "type": "Retorno cardiologia"
    }
  ]
}
```

---

## 16. Notas de Implementação

### Autenticação e Autorização

- JWT com expiração de 24h + refresh token (7 dias) armazenados em httpOnly cookies
- Roles do sistema: `admin`, `doctor`, `analyst`
- Guards recomendados:
  - `GET/POST /admin/*` → apenas `admin`
  - `PATCH /users/:id/status` → apenas `admin`
  - `POST /exams` → `admin` ou `doctor`
  - `GET /exams`, `GET /patients` → todos autenticados
- O campo `doctorId` no JWT payload é usado pelo frontend para o filtro `view=mine` na ExamsPage

### Formato de Data Crítico

> ⚠️ O frontend usa `collectedAt` como string `"YYYY-MM-DD HH:mm"` (sem timezone) em múltiplos lugares. Todos os endpoints que retornam exames **devem serializar `collected_at` nesse formato** ou o parsing de datas quebrará.

```
"2026-02-29 22:15"       ← formato esperado pelo frontend
"2026-02-29T22:15:00Z"   ← NÃO use ISO 8601 nesses campos
```

### Storage de Arquivos

- Usar **MinIO** (self-hosted) ou **Azure Blob Storage** (compatível com OneDrive do hospital)
- Estrutura de pastas sugerida:
  ```
  /previews/{exam_id}.jpg
  /attachments/{uuid}.{ext}
  /reports/{uuid}.pdf
  /output/{run_id}/disco{n}/analise_75px.png
  ```
- O endpoint `GET /attachments` deve retornar `storageUrl` como URL pública com expiração (signed URL) se o bucket for privado

### Geração de PDF

- O endpoint `POST /reports/generate` deve:
  1. Inserir registro com `status = 'generating'`
  2. Enfileirar job (Redis/BullMQ) para gerar o PDF com os dados do exame
  3. Worker gera o PDF (Python `reportlab` / Node `pdfkit` / similar), salva no storage
  4. Atualiza `status = 'ready'` e `storage_url`
- O frontend já implementa jsPDF como **fallback local** enquanto o backend não está pronto
- Quando o backend retornar `storageUrl`, o frontend abre a URL diretamente no `<iframe>` do PdfViewerPage

### Server-Sent Events (Script Python)

- O servidor Express local (`server/index.cjs`) já implementa o SSE com spawn do Python
- No backend principal, o mesmo padrão deve ser mantido no endpoint `GET /api/run`
- Variáveis de ambiente necessárias:
  ```
  SCRIPT_DIR=/home/felipe/Documents/pi7_sem/Unbrella/
  SCRIPT_NAME=GerarGrafico2D_DetectarHalo_v3_azul.py
  VENV_PYTHON=/home/felipe/Documents/pi7_sem/Unbrella/venv/bin/python
  OUTPUT_DIR=/home/felipe/Documents/pi7_sem/Unbrella/graficos_2d_halo_v2/
  ```
- O frontend se conecta em `http://localhost:3333` via `EventSource` — em produção, apontar para a URL do backend

### Campos que o Frontend Espera Denormalizados

Os seguintes campos devem ser retornados diretamente nas listas (sem joins extras no cliente):

| Endpoint | Campo extra esperado |
|---|---|
| `GET /exams` | `patientName`, `doctorName` |
| `GET /exams/:id` | `patientName`, `doctorName` |
| `GET /reports` | `patientName` |
| `GET /doctors/:id` | `recentExams[]` |
| `GET /dashboard` | tudo inline (ver seção 15) |

### Migração dos Dados Mock → BD

| Mock | Tabela destino | Observação |
|---|---|---|
| `patients` (12 registros) | `patients` | Direto |
| `doctors` (6 registros) | `doctors` | Criar usuários associados na tabela `users` |
| `exams` (18 registros) | `exams` + `antibiogram_entries` | `antibiogram[]` vira linhas separadas em `antibiogram_entries` |
| `initialAttachments` (8 registros) | `attachments` | Arquivos precisam ser enviados para o storage |
| `appointments` (8 registros) | `appointments` | Resolver FK para `patients` |
| `MOCK_USERS` do AdminPage (6 registros) | `users` | Já têm email/role/shift — hashear senhas |

### CORS

O frontend Vite roda em `http://localhost:5173`. Configurar CORS do backend para aceitar essa origin em desenvolvimento. Em produção, substituir pela URL do domínio do hospital.
