/**
 * Servidor local de desenvolvimento — BioLab Script Runner
 * Porta: 3333
 *
 * GET  /api/health         → status
 * GET  /api/run            → SSE: executa GerarGrafico2D_DetectarHalo_v2.py e
 *                            faz stream linha a linha para o cliente
 */

const express  = require('express')
const cors     = require('cors')
const { spawn } = require('child_process')
const path     = require('path')
const fs       = require('fs')

const app  = express()
const PORT = 3333

// Diretório onde o script Python vive
const SCRIPT_DIR    = '/home/felipe/Documents/pi7_sem/Unbrella'
const SCRIPT_NAME   = 'GerarGrafico2D_DetectarHalo_v3_azul.py'
const VENV_PYTHON   = path.join(SCRIPT_DIR, 'venv', 'bin', 'python')
const OUTPUT_DIR    = path.join(SCRIPT_DIR, 'graficos_2d_halo_v2')

// Aceita qualquer origem localhost (Vite pode usar 5173, 5174, etc.)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  }
}))

// Serve as imagens geradas pelo script como arquivos estáticos
app.use('/output', express.static(OUTPUT_DIR))
app.use(express.json())

// ── Health check ────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const scriptExists = fs.existsSync(path.join(SCRIPT_DIR, SCRIPT_NAME))
  const venvExists   = fs.existsSync(VENV_PYTHON)
  res.json({
    ok: scriptExists && venvExists,
    scriptDir:  SCRIPT_DIR,
    scriptName: SCRIPT_NAME,
    scriptExists,
    venvExists,
  })
})

// ── Listar imagens geradas ───────────────────────────────────────
app.get('/api/images', (_req, res) => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    return res.json({ groups: [], flat: [] })
  }

  const IMAGE_EXT = /\.(png|jpg|jpeg|gif|webp)$/i
  const flat = []

  // Imagens na raiz do output (halo_disco*.png)
  fs.readdirSync(OUTPUT_DIR).forEach(name => {
    const full = path.join(OUTPUT_DIR, name)
    if (IMAGE_EXT.test(name) && fs.statSync(full).isFile()) {
      flat.push({ label: name.replace(/\.[^.]+$/, ''), url: `/output/${name}` })
    }
  })

  // Subpastas (disco1/, disco2/, …)
  const groups = []
  fs.readdirSync(OUTPUT_DIR).forEach(dir => {
    const dirPath = path.join(OUTPUT_DIR, dir)
    if (!fs.statSync(dirPath).isDirectory()) return
    const images = fs.readdirSync(dirPath)
      .filter(f => IMAGE_EXT.test(f))
      .map(f => ({
        label: f.replace(/\.[^.]+$/, ''),
        url:   `/output/${dir}/${f}`,
      }))
    if (images.length > 0) groups.push({ name: dir, images })
  })

  // Ordena grupos por nome
  groups.sort((a, b) => a.name.localeCompare(b.name))

  res.json({ groups, flat })
})

// ── SSE: rodar script e fazer stream ────────────────────────────
app.get('/api/run', (req, res) => {
  // Cabeçalhos SSE
  res.setHeader('Content-Type',  'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection',    'keep-alive')
  res.flushHeaders()

  const send = (type, text) => {
    const payload = JSON.stringify({ type, text })
    res.write(`data: ${payload}\n\n`)
  }

  // Verificar pré-requisitos
  if (!fs.existsSync(VENV_PYTHON)) {
    send('error', `venv não encontrado em: ${VENV_PYTHON}`)
    send('exit',  '1')
    res.end()
    return
  }
  if (!fs.existsSync(path.join(SCRIPT_DIR, SCRIPT_NAME))) {
    send('error', `Script não encontrado: ${SCRIPT_NAME}`)
    send('exit',  '1')
    res.end()
    return
  }

  send('info', `Executando: ${VENV_PYTHON} ${SCRIPT_NAME}`)
  send('info', `Diretório:  ${SCRIPT_DIR}`)
  send('info', '─'.repeat(52))

  const proc = spawn(VENV_PYTHON, ['-u', SCRIPT_NAME], {
    cwd:   SCRIPT_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, MPLBACKEND: 'Agg', DISPLAY: process.env.DISPLAY || ':0' },
  })

  proc.stdout.setEncoding('utf8')
  proc.stderr.setEncoding('utf8')

  // Buffer para linhas incompletas
  let stdoutBuf = ''
  let stderrBuf = ''

  const flushLines = (buf, type, setter) => {
    const lines = buf.split('\n')
    const remaining = lines.pop() // último fragmento (pode ser incompleto)
    lines.forEach(line => {
      if (line.trim() !== '') send(type, line)
    })
    setter(remaining)
  }

  proc.stdout.on('data', chunk => {
    stdoutBuf += chunk
    let remaining = ''
    flushLines(stdoutBuf, 'stdout', v => { remaining = v })
    stdoutBuf = remaining
  })

  proc.stderr.on('data', chunk => {
    stderrBuf += chunk
    let remaining = ''
    flushLines(stderrBuf, 'stderr', v => { remaining = v })
    stderrBuf = remaining
  })

  proc.on('close', (code) => {
    // Flush restos
    if (stdoutBuf.trim()) send('stdout', stdoutBuf)
    if (stderrBuf.trim()) send('stderr', stderrBuf)
    send('exit', String(code ?? 0))
    res.end()
  })

  proc.on('error', (err) => {
    send('error', `Erro ao iniciar processo: ${err.message}`)
    send('exit',  '1')
    res.end()
  })

  // Se o cliente desconectar, matar o processo filho
  req.on('close', () => {
    if (!proc.killed) proc.kill('SIGTERM')
  })
})

const server = app.listen(PORT, () => {
  console.log(`[BioLab Server] rodando em http://localhost:${PORT}`)
  console.log(`[BioLab Server] script: ${path.join(SCRIPT_DIR, SCRIPT_NAME)}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[BioLab Server] ERRO: porta ${PORT} já está em uso. Rode: kill $(lsof -ti:${PORT})`)
  } else {
    console.error(`[BioLab Server] ERRO: ${err.message}`)
  }
  process.exit(1)
})

// Mantém o processo vivo e encerra com graça
process.on('SIGINT',  () => { console.log('\n[BioLab Server] encerrado.'); process.exit(0) })
process.on('SIGTERM', () => { console.log('\n[BioLab Server] encerrado.'); process.exit(0) })
