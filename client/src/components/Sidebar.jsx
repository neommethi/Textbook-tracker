import { NavLink } from 'react-router-dom'

const navigationItems = [
  {
    label: 'Dashboard',
    to: '/admin',
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
    label: 'Learners',
    to: '/admin/learners',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8" />
      </>
    ),
  },
  {
    label: 'Textbooks',
    to: '/admin/textbooks',
    icon: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
        <path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8" />
      </>
    ),
  },
  {
    label: 'Issued books',
    to: '/admin/issued',
    icon: (
      <>
        <path d="M4 4h16v16H4zM8 8h8M8 12h8" />
        <path d="m8 16 2 2 5-5" />
      </>
    ),
  },
  {
    label: 'Subjects',
    to: '/admin/subjects',
    icon: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
        <path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 11h6" />
      </>
    ),
  },
]

export default function Sidebar({
  adminName,
  drawerOpen,
  onNavigate,
  onLogout,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-200 md:translate-x-0 ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-8 px-3">
        <p className="text-lg font-bold text-slate-900">Textbook Tracker</p>
        <p className="mt-1 text-sm text-slate-500">Admin area</p>
      </div>

      <nav aria-label="Admin navigation" className="space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
            >
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-4">
        <p className="truncate px-3 pb-2 text-sm font-medium text-slate-700">
          {adminName}
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}
