import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    // Treat invalid stored user data as signed out.
    return null
  }
}

export default function AdminLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [user, setUser] = useState(readStoredUser)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const isAdmin = Boolean(token && user && user.role === 'admin')
  const adminName =
    typeof user?.name === 'string' && user.name.trim()
      ? user.name.trim()
      : 'Admin'

  useEffect(() => {
    function handleUserUpdate() {
      setUser(readStoredUser())
    }

    window.addEventListener('admin-user-updated', handleUserUpdate)
    return () => window.removeEventListener('admin-user-updated', handleUserUpdate)
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

  if (!isAdmin) {
    // This check keeps the UI tidy; the server must enforce roles.
    return <Navigate to="/login" replace />
  }

  return (
    <div className="admin-app min-h-screen bg-[#111318]">
      <Sidebar
        userName={adminName}
        expanded={sidebarExpanded}
        pinned={sidebarPinned}
        onExpand={() => setSidebarExpanded(true)}
        onCollapse={handleSidebarLeave}
        onTogglePin={handleToggleSidebarPin}
        onLogout={handleLogout}
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
