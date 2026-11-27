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
  const [drawerOpen, setDrawerOpen] = useState(false)
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

  useEffect(() => {
    if (!drawerOpen) return undefined

    // Lock page scrolling until the mobile drawer closes.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') setDrawerOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [drawerOpen])

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
      <header className="flex h-14 items-center gap-3 border-b border-slate-800 bg-[#17191d] px-4 text-white md:hidden">
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="font-semibold text-white">Textbook Tracker</span>
      </header>

      {drawerOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
        />
      )}
      <Sidebar
        adminName={adminName}
        drawerOpen={drawerOpen}
        expanded={sidebarExpanded}
        pinned={sidebarPinned}
        onExpand={() => setSidebarExpanded(true)}
        onCollapse={handleSidebarLeave}
        onTogglePin={handleToggleSidebarPin}
        onNavigate={() => setDrawerOpen(false)}
        onLogout={handleLogout}
      />

      <main
        className={`transition-[margin] duration-200 ${
          sidebarExpanded ? 'md:ml-56' : 'md:ml-[76px]'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}
