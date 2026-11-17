
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import AdminDash from './pages/AdminDash'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/student-dashboard"
        element={<StudentDashboard />}
      />
      <Route path="/admin" element={<AdminDash />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
