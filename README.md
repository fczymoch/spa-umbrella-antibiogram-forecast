# Painel Saúde — React + Vite

Aplicação responsiva para área da saúde com três telas principais:

- **Login**: autenticação simples para profissionais.
- **Home**: visão geral do plantão, agenda e últimos anexos.
- **Anexos**: upload e listagem de arquivos clínicos (exames, laudos, imagens).

## Executando o projeto

```bash
npm install
npm run dev
```

Abra o endereço indicado no terminal (geralmente http://localhost:5173).

## Scripts úteis

- `npm run dev` – ambiente de desenvolvimento com HMR.
- `npm run build` – build de produção.
- `npm run preview` – pré-visualizar o build.
- `npm run lint` – checar padrões de código.

## Rotas

- `/login` – tela de acesso.
- `/` – dashboard inicial (protegida).
- `/exams` – lista de exames com status e origem.
- `/exams/:id` – detalhes do antibiograma com gráficos e imagem do exame.
- `/patients` – visão por paciente/leito e risco.
- `/doctors` – visão por médico responsável.
- `/attachments` – gestão de anexos (protegida).

## Notas

- App pensado para cenário clínico, com foco em responsividade e rapidez de navegação.
- Armazenamento de anexos é apenas em memória (mock) para demonstração.
- As imagens de exames simulam arquivos oriundos de OneDrive/bucket; substitua pelos links reais na integração.
- Gráficos usam `react-chartjs-2` + `chart.js` para a tela de detalhes do antibiograma.
