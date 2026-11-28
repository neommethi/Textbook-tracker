import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import adminIcon from '../assets/admin.svg'
import issuedBooksIcon from '../assets/issued books-svgrepo-com.svg'
import learnersIcon from '../assets/learners.svg'
import logoutIcon from '../assets/logout.svg'
import pinIcon from '../assets/pin-svgrepo-com.svg'
import returnedBooksIcon from '../assets/returned books-svgrepo-com.svg'
import settingsIcon from '../assets/settings.svg'
import subjectsIcon from '../assets/subjects-svgrepo-com.svg'
import textbookIcon from '../assets/textbook-svgrepo-com.svg'

const adminNavigationItems = [
  {
    label: 'Dashboard',
    to: '/admin',
    end: true,
    icon: adminIcon,
  },
  {
    label: 'Learners',
    to: '/admin/learners',
    icon: learnersIcon,
  },
  {
    label: 'Textbooks',
    to: '/admin/textbooks',
    icon: textbookIcon,
  },
  {
    label: 'Issued books',
    to: '/admin/issued',
    icon: issuedBooksIcon,
  },
  {
    label: 'Returned books',
    to: '/admin/returned',
    icon: returnedBooksIcon,
  },
  {
    label: 'Subjects',
    to: '/admin/subjects',
    icon: subjectsIcon,
  },
  {
    label: 'Settings',
    to: '/admin/settings',
    icon: settingsIcon,
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

function SidebarAssetIcon({ src, className = 'h-5 w-5' }) {
  return <img aria-hidden="true" alt="" className={`shrink-0 object-contain ${className}`} src={src} />
}

function LogoutIcon() {
  return <SidebarAssetIcon src={logoutIcon} />
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
              <SidebarAssetIcon className="h-5 w-5" src={item.icon} />
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
              <SidebarAssetIcon src={pinIcon} />
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
                <SidebarAssetIcon src={item.icon} />
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
              <SidebarAssetIcon src={item.icon} />
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
