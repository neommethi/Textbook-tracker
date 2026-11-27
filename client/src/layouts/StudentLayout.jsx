import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const studentNavigationItems = [
  {
    label: 'Home',
    to: '/student-dashboard',
    end: true,
    icon: '/admin.svg',
  },
  {
    label: 'My Textbooks',
    to: '/student-dashboard/textbooks',
    icon: '/textbook-svgrepo-com.svg',
  },
  {
    label: 'Settings',
    to: '/student-dashboard/settings',
    icon: '/settings.svg',
  },
]

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

export default function StudentLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [user, setUser] = useState(readStoredUser)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const isStudent = Boolean(token && user && user.role === 'user')
  const studentName =
    typeof user?.name === 'string' && user.name.trim()
      ? user.name.trim()
      : 'Student'

  useEffect(() => {
    function handleUserUpdate() {
      setUser(readStoredUser())
    }

    window.addEventListener('student-user-updated', handleUserUpdate)
    return () => window.removeEventListener('student-user-updated', handleUserUpdate)
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  function handleSidebarLeave() {
    if (!sidebarPinned) setSidebarExpanded(false)
  }

  function handleToggleSidebarPin() {
    setSidebarPinned((pinned) => !pinned)
    setSidebarExpanded(true)
  }

  if (!isStudent) return <Navigate to="/login" replace />

  return (
    <div className="admin-app min-h-screen bg-[#111318]">
      <Sidebar
        userName={studentName}
        expanded={sidebarExpanded}
        pinned={sidebarPinned}
        onExpand={() => setSidebarExpanded(true)}
        onCollapse={handleSidebarLeave}
        onTogglePin={handleToggleSidebarPin}
        onLogout={handleLogout}
        items={studentNavigationItems}
        navigationLabel="Student navigation"
      />

      <main
        className={`pb-24 transition-[margin] duration-200 md:pb-0 ${
          sidebarExpanded ? 'md:ml-56' : 'md:ml-[76px]'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}
