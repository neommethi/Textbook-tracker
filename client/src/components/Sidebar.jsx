import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const adminNavigationItems = [
  {
    label: 'Dashboard',
    to: '/admin',
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

function SidebarIcon({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  )
}

function LogoutIcon() {
  return (
    <SidebarIcon>
      <path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </SidebarIcon>
  )
}

function MoreIcon({ expanded }) {
  return expanded ? (
    <SidebarIcon>
      <path d="m6 15 6-6 6 6" />
    </SidebarIcon>
  ) : (
    <SidebarIcon>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </SidebarIcon>
  )
}

export default function Sidebar({
  userName,
  expanded,
  pinned,
  onExpand,
  onCollapse,
  onTogglePin,
  onLogout,
  items = adminNavigationItems,
  navigationLabel = 'Admin navigation',
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const hasOverflow = items.length + 1 > 4
  const primaryItems = hasOverflow ? items.slice(0, 3) : items
  const overflowItems = hasOverflow ? items.slice(3) : []

  function closeMobileMenu() {
    setMobileExpanded(false)
  }

  function handleMobileLogout() {
    closeMobileMenu()
    onLogout()
  }

  return (
    <>
      <aside
        onMouseEnter={onExpand}
        onMouseLeave={onCollapse}
        className={`fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-slate-800/70 bg-[#17191d] px-3 py-5 text-slate-300 transition-[width,transform] duration-200 md:flex ${
          expanded ? 'md:w-56' : 'md:w-[76px]'
        }`}
      >
        <nav aria-label={navigationLabel} className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              className={({ isActive }) =>
                `group flex min-h-11 items-center rounded-lg text-[13px] font-medium transition-colors ${
                  expanded ? 'gap-3 px-3' : 'justify-center px-0'
                } ${
                  isActive
                    ? 'bg-[#25283a] text-blue-400'
                    : 'text-slate-300 hover:bg-white/[0.055] hover:text-white'
                }`
              }
            >
              <SidebarIcon className="h-5 w-5 shrink-0">{item.icon}</SidebarIcon>
              <span
                className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-150 ${
                  expanded
                    ? 'max-w-40 opacity-100 delay-100'
                    : 'max-w-0 opacity-0 delay-0'
                }`}
              >
                {item.label}
              </span>
              {expanded && !item.end && (
                <SidebarIcon className="ml-auto h-4 w-4 text-slate-500">
                  <path d="m9 6 6 6-6 6" />
                </SidebarIcon>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-4">
          {expanded && userName && (
            <p className="truncate px-3 pb-2 text-sm font-medium text-slate-300">
              {userName}
            </p>
          )}
          {expanded && (
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
              <SidebarIcon className="h-5 w-5 shrink-0">
                <path d="m16 3 5 5-4 1-4 4 3 3-2 2-3-3-5 5-1-1 5-5-3-3 2-2 3 3 4-4z" />
              </SidebarIcon>
              <span className="whitespace-nowrap">{pinned ? 'Pinned open' : 'Pin sidebar'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            className={`flex min-h-11 w-full items-center rounded-lg text-sm font-medium text-slate-400 hover:bg-white/[0.055] hover:text-white ${
              expanded ? 'gap-3 px-3 text-left' : 'justify-center px-0'
            }`}
          >
            <LogoutIcon />
            {expanded && <span className="whitespace-nowrap">Log out</span>}
          </button>
        </div>
      </aside>

      <nav
        aria-label={`${navigationLabel} mobile`}
        className={`fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 border border-slate-700/80 bg-[#17191d]/95 text-slate-300 shadow-2xl shadow-black/30 backdrop-blur-md transition-[border-radius,padding] duration-200 md:hidden ${
          mobileExpanded && hasOverflow
            ? 'w-[calc(100vw-2rem)] max-w-sm rounded-3xl p-3'
            : 'rounded-full p-2'
        }`}
      >
        {mobileExpanded && hasOverflow && (
          <div className="mb-2 grid max-h-[55vh] grid-cols-3 gap-2 overflow-y-auto">
            {overflowItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-label={item.label}
                title={item.label}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500/30 bg-blue-400/10 text-blue-300'
                      : 'border-transparent text-slate-300 hover:bg-white/[0.055]'
                  }`
                }
              >
                <SidebarIcon className="h-5 w-5">{item.icon}</SidebarIcon>
                <span className="line-clamp-2">{item.label}</span>
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleMobileLogout}
              aria-label="Log out"
              className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.055]"
            >
              <LogoutIcon />
              <span>Log out</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1">
          {primaryItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              title={item.label}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                  isActive
                    ? 'bg-blue-400/15 text-blue-300'
                    : 'text-slate-400 hover:bg-white/[0.055] hover:text-white'
                }`
              }
            >
              <SidebarIcon className="h-5 w-5">{item.icon}</SidebarIcon>
            </NavLink>
          ))}
          {hasOverflow ? (
            <button
              type="button"
              aria-label={mobileExpanded ? 'Hide more navigation' : 'Show more navigation'}
              aria-expanded={mobileExpanded}
              title={mobileExpanded ? 'Hide more navigation' : 'Show more navigation'}
              onClick={() => setMobileExpanded((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/[0.055] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <MoreIcon expanded={mobileExpanded} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMobileLogout}
              aria-label="Log out"
              title="Log out"
              className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/[0.055] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <LogoutIcon />
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
