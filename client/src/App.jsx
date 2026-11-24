
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import AdminDash from './pages/AdminDash'
import AdminDataPage from './pages/AdminDataPage'
import AdminLayout from './layouts/AdminLayout'
import AdminOverview from './pages/AdminOverview'

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
        <Route index element={<AdminOverview />} />
        <Route path="learners" element={<AdminDash />} />
        <Route path="learners/:learnerId" element={<AdminDash />} />
        <Route
          path="textbooks"
          element={<AdminDataPage key="textbooks" pageKey="textbooks" />}
        />
        <Route
          path="issued"
          element={<AdminDataPage key="issued" pageKey="issued" />}
        />
        <Route
          path="returned"
          element={<AdminDataPage key="returned" pageKey="returned" />}
        />
        <Route
          path="subjects"
          element={<AdminDataPage key="subjects" pageKey="subjects" />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
