
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import AdminDash from './pages/AdminDash'
import AdminLayout from './layouts/AdminLayout'
import AdminPlaceholder from './pages/AdminPlaceholder'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/student-dashboard"
        element={<StudentDashboard />}
      />
      {/* Keep admin routes together so one layout protects the whole section. */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminPlaceholder title="Dashboard" />} />
        <Route path="learners" element={<AdminDash />} />
        <Route
          path="textbooks"
          element={<AdminPlaceholder title="Textbooks" />}
        />
        <Route
          path="issued"
          element={<AdminPlaceholder title="Issued books" />}
        />
        <Route
          path="subjects"
          element={<AdminPlaceholder title="Subjects" />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
