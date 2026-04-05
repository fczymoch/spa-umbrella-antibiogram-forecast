import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Attachment } from '../types.ts'

interface AttachmentsPageProps {
  attachments: Attachment[]
  onUpload: (files: FileList | null, notes: string) => void
}

export function AttachmentsPage({ attachments, onUpload }: AttachmentsPageProps) {
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onUpload(files, notes)
    setNotes('')
    setFiles(null)
  }

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
            onChange={(e) => setFiles(e.target.files)}
          />
        </div>
        <div>
          <label htmlFor="notes">Observações</label>
          <textarea
            id="notes"
            placeholder="Contexto clínico, nome do médico, origem do arquivo"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit" className="button primary">
          Salvar e compartilhar
        </button>
      </form>

      <section className="card">
        <div className="card-header">
          <h3>Uploads recentes</h3>
          <span className="pill subtle">{attachments.length} documentos</span>
        </div>
        <ul className="list">
          {attachments.map((item) => (
            <li key={item.id} className="list-row">
              <div>
                <p className="list-title">{item.fileName}</p>
                <p className="muted small">{item.notes || item.type}</p>
              </div>
              <div className="list-meta">
                <span className="pill subtle">{item.size}</span>
                <span className="muted">{item.uploadedAt}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
