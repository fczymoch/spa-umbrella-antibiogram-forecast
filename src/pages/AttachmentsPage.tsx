import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteAttachment,
  listAttachments,
  uploadAttachments,
} from '../api/attachments.ts'
import { Spinner } from '../components/Spinner.tsx'
import { useToast } from '../contexts/useToast.ts'
import { extractErrorMessage } from '../api/client.ts'
import type { Attachment } from '../types.ts'

const ITEMS_PER_PAGE = 20

function formatBytes(bytes: number | undefined): string {
  if (!bytes && bytes !== 0) return ''
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(1)} ${sizes[i]}`
}

function formatUploadedAt(value: string | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function describe(item: Attachment): string {
  return item.notes || item.fileType || item.type || 'Documento'
}

export function AttachmentsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)

  const attachmentsQuery = useQuery({
    queryKey: ['attachments', { page }],
    queryFn: () => listAttachments({ page, limit: ITEMS_PER_PAGE }),
  })

  const uploadMutation = useMutation({
    mutationFn: ({ files, notes }: { files: FileList; notes: string }) =>
      uploadAttachments(files, notes),
    onSuccess: () => {
      toast('Arquivo(s) enviado(s) com sucesso.', 'success')
      setFiles(null)
      setNotes('')
      // Reset input file value
      const input = document.getElementById('files') as HTMLInputElement | null
      if (input) input.value = ''
      queryClient.invalidateQueries({ queryKey: ['attachments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao enviar arquivos'), 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      toast('Anexo removido.', 'success')
      queryClient.invalidateQueries({ queryKey: ['attachments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      toast(extractErrorMessage(error, 'Falha ao remover anexo'), 'error')
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!files || files.length === 0) {
      toast('Selecione ao menos um arquivo.', 'warning')
      return
    }
    uploadMutation.mutate({ files, notes })
  }

  const attachments = attachmentsQuery.data?.data ?? []
  const total = attachmentsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted">Central de documentos</p>
          <h1>Anexos</h1>
        </div>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="files">Enviar arquivo</label>
          <input
            id="files"
            type="file"
            multiple
            disabled={uploadMutation.isPending}
            onChange={(e) => setFiles(e.target.files)}
          />
        </div>
        <div>
          <label htmlFor="notes">Observações</label>
          <textarea
            id="notes"
            placeholder="Contexto clínico, nome do médico, origem do arquivo"
            value={notes}
            disabled={uploadMutation.isPending}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit" className="button primary" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? 'Enviando…' : 'Salvar e compartilhar'}
        </button>
      </form>

      <section className="card">
        <div className="card-header">
          <h3>Uploads recentes</h3>
          <span className="pill subtle">{total} documentos</span>
        </div>

        {attachmentsQuery.isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <Spinner size="lg" />
          </div>
        ) : attachmentsQuery.isError ? (
          <div style={{ padding: 'var(--space-4)' }}>
            <p className="muted">Erro ao carregar anexos: {extractErrorMessage(attachmentsQuery.error)}</p>
            <button className="btn btn--primary" onClick={() => attachmentsQuery.refetch()} style={{ marginTop: 'var(--space-3)' }}>
              Tentar novamente
            </button>
          </div>
        ) : attachments.length === 0 ? (
          <p className="muted" style={{ padding: 'var(--space-4)' }}>
            Nenhum anexo enviado ainda. Use o formulário acima para enviar o primeiro.
          </p>
        ) : (
          <ul className="list">
            {attachments.map((item) => (
              <li key={item.id} className="list-row">
                <div>
                  <p className="list-title">{item.fileName}</p>
                  <p className="muted small">{describe(item)}</p>
                </div>
                <div className="list-meta">
                  <span className="pill subtle">{formatBytes(item.fileSize) || item.size}</span>
                  <span className="muted">{formatUploadedAt(item.uploadedAt)}</span>
                  {item.storageUrl && (
                    <a href={item.storageUrl} target="_blank" rel="noreferrer" className="pill subtle">
                      Abrir
                    </a>
                  )}
                  <button
                    type="button"
                    className="ghost small"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm('Remover este anexo?')) deleteMutation.mutate(item.id)
                    }}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Paginação de resultados">
            <button
              className="pill subtle pagination-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Anterior
            </button>
            <span className="muted small">Página {page} de {totalPages}</span>
            <button
              className="pill subtle pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Próxima →
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}
