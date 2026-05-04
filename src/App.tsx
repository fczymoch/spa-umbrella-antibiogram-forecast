import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ShellLayout } from './components/ShellLayout.tsx'
import {
  AttachmentsPage,
  DoctorsPage,
  DoctorDetailPage,
  ExamDetailPage,
  ExamsPage,
  NewExamPage,
  HomePage,
  LoginPage,
  ProfilePage,
  PatientsPage,
  PatientDetailPage,
  AdminPage,
  ReportsPage,
  PdfViewerPage,
} from './pages/index.ts'
import { useAuth } from './hooks/useAuth.ts'
import { Spinner } from './components/Spinner.tsx'
import './App.css'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to={user ? '/app' : '/login'} replace />} />
        <Route path="/login" element={user ? <Navigate to="/app" replace /> : <LoginPage />} />

        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<ShellLayout />}>
            <Route index element={<HomePage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="exams/new" element={<NewExamPage />} />
            <Route path="exams/:id" element={<ExamDetailPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:id" element={<PatientDetailPage />} />
            <Route path="doctors" element={<DoctorsPage />} />
            <Route path="doctors/:id" element={<DoctorDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="attachments" element={<AttachmentsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={user ? '/app' : '/'} replace />} />

        {/* Visualizador PDF — fora do ShellLayout para ocupar tela cheia */}
        <Route path="/pdf-viewer" element={<ProtectedRoute />}>
          <Route index element={<PdfViewerPage />} />
        </Route>
      </Routes>
    </div>
  )
}

function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export default App
