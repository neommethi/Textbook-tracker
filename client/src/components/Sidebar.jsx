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
    label: 'Returned books',
    to: '/admin/returned',
    icon: (
      <>
        <path d="M4 5h16v14H4zM8 9h5" />
        <path d="m9 15 2.5 2.5L17 12" />
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
  {
    label: 'Settings',
    to: '/admin/settings',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a7.8 7.8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a7.8 7.8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7.5 7.5 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a7.8 7.8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7.5 7.5 0 0 1 0 2Z" />
      </>
    ),
  },
]

export default function Sidebar({
  adminName,
  drawerOpen,
  expanded,
  pinned,
  onExpand,
  onCollapse,
  onTogglePin,
  onNavigate,
  onLogout,
}) {
  const isExpanded = expanded || drawerOpen

  return (
    <aside
      onMouseEnter={onExpand}
      onMouseLeave={onCollapse}
      className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-slate-800/70 bg-[#17191d] px-3 py-5 text-slate-300 transition-[width,transform] duration-200 md:translate-x-0 ${
        expanded ? 'md:w-56' : 'md:w-[76px]'
      } ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <nav aria-label="Admin navigation" className="space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            onClick={onNavigate}
            aria-label={item.label}
            className={({ isActive }) =>
              `group flex min-h-11 items-center rounded-lg text-[13px] font-medium transition-colors ${
                isExpanded ? 'gap-3 px-3' : 'justify-center px-0 md:gap-0 md:px-0'
              } ${
                isActive
                  ? 'bg-[#25283a] text-blue-400'
                  : 'text-slate-300 hover:bg-white/[0.055] hover:text-white'
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
            <span
              className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-150 ${
                isExpanded
                  ? 'max-w-40 opacity-100 delay-100'
                  : 'max-w-0 opacity-0 delay-0'
              }`}
            >
              {item.label}
            </span>
            {isExpanded && item.to !== '/admin' && (
              <svg aria-hidden="true" className="ml-auto h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
                <path d="m9 6 6 6-6 6" />
              </svg>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-4">
        {isExpanded && (
          <p className="truncate px-3 pb-2 text-sm font-medium text-slate-300">
            {adminName}
          </p>
        )}
        {isExpanded && (
          <button
            type="button"
            onClick={onTogglePin}
            aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
            aria-pressed={pinned}
            title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
            className={`mb-1 flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors hover:bg-white/[0.055] ${
              pinned ? 'text-blue-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="m16 3 5 5-4 1-4 4 3 3-2 2-3-3-5 5-1-1 5-5-3-3 2-2 3 3 4-4z" />
            </svg>
            <span className="whitespace-nowrap">{pinned ? 'Pinned open' : 'Pin sidebar'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={onLogout}
          aria-label="Log out"
          className={`flex min-h-11 w-full items-center rounded-lg text-sm font-medium text-slate-400 hover:bg-white/[0.055] hover:text-white ${
            isExpanded ? 'gap-3 px-3 text-left' : 'justify-center px-0'
          }`}
        >
          <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
            <path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
          </svg>
          {isExpanded && <span className="whitespace-nowrap">Log out</span>}
        </button>
      </div>
    </aside>
  )
}
