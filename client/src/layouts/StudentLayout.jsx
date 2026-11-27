import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const studentNavigationItems = [
  {
    label: 'Home',
    to: '/student-dashboard',
    end: true,
    icon: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    label: 'My Textbooks',
    to: '/student-dashboard/textbooks',
    icon: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
        <path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8" />
      </>
    ),
  },
  {
    label: 'Settings',
    to: '/student-dashboard/settings',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a7.8 7.8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a7.8 7.8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7.5 7.5 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a7.8 7.8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7.5 7.5 0 0 1 0 2Z" />
      </>
    ),
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
