import { useMemo, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ShellLayout } from './components/ShellLayout.tsx'
import {
  AttachmentsPage,
  DoctorsPage,
  DoctorDetailPage,
  ExamDetailPage,
  ExamsPage,
  HomePage,
  LoginPage,
  ProfilePage,
  PatientsPage,
  PatientDetailPage,
  AdminPage,
} from './pages/index.ts'
import { doctors, exams, initialAttachments, patients } from './data/mockData.ts'
import type { Attachment, User } from './types.ts'
import { useLocalStorage } from './hooks/useLocalStorage.ts'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [attachments, setAttachments] = useLocalStorage<Attachment[]>('biolab:attachments', initialAttachments)

  const memoPatients = useMemo(() => patients, [])
  const memoDoctors = useMemo(() => doctors, [])
  const memoExams = useMemo(() => exams, [])

  const handleLogin = (email: string) => {
    const displayName = email.split('@')[0] || 'Profissional'
    setUser({
      name: `Dr(a). ${displayName}`,
      email,
      role: 'Coordenador Clínico',
      shift: 'Plantão hoje • 12h',
      doctorId: doctors[0]?.id,
    })
  }

  const handleLogout = () => setUser(null)

  const handleUpload = (fileList: FileList | null, notes: string) => {
    if (!fileList || fileList.length === 0) return

    const newItems: Attachment[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      type: file.type || 'Documento',
      size: formatBytes(file.size),
      uploadedAt: new Date().toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      notes: notes || undefined,
    }))

    setAttachments((prev) => [...newItems, ...prev])
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        <Route path="/app" element={<ProtectedRoute user={user} />}>
          <Route element={<ShellLayout user={user} onLogout={handleLogout} />}>
            <Route
              index
              element={
                user && (
                  <HomePage
                    user={user}
                    attachments={attachments}
                    exams={memoExams}
                    patients={memoPatients}
                  />
                )
              }
            />
            <Route
              path="exams"
              element={
                <ExamsPage
                  exams={memoExams}
                  patients={memoPatients}
                  doctors={memoDoctors}
                  user={user}
                />
              }
            />
            <Route
              path="exams/:id"
              element={
                <ExamDetailPage
                  exams={memoExams}
                  patients={memoPatients}
                  doctors={memoDoctors}
                />
              }
            />
            <Route
              path="patients"
              element={<PatientsPage patients={memoPatients} exams={memoExams} />}
            />
            <Route
              path="patients/:id"
              element={
                <PatientDetailPage
                  patients={memoPatients}
                  exams={memoExams}
                  doctors={memoDoctors}
                />
              }
            />
            <Route
              path="doctors"
              element={<DoctorsPage doctors={memoDoctors} exams={memoExams} />}
            />
            <Route
              path="doctors/:id"
              element={<DoctorDetailPage doctors={memoDoctors} exams={memoExams} patients={memoPatients} />}
            />
            <Route path="profile" element={<ProfilePage user={user} />} />
            <Route path="admin" element={<AdminPage />} />
            <Route
              path="attachments"
              element={
                user && (
                  <AttachmentsPage attachments={attachments} onUpload={handleUpload} />
                )
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={user ? '/app' : '/'} replace />} />
      </Routes>
    </div>
  )
}

function ProtectedRoute({ user }: { user: User | null }) {
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(1)} ${sizes[i]}`
}

export default App
