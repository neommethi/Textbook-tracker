import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

const cards = [
  {
    key: 'learners',
    title: 'Learners',
    to: '/admin/learners',
    description: 'Learners signed up',
    emptyMessage: 'There are no learners signed up yet.',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8" />
      </>
    ),
  },
  {
    key: 'textbooks',
    title: 'Textbooks',
    to: '/admin/textbooks',
    description: 'Textbooks in the catalog',
    emptyMessage: 'There are no textbooks in the catalog yet.',
    icon: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
        <path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8" />
      </>
    ),
  },
  {
    key: 'outstanding',
    title: 'Issued books',
    to: '/admin/issued',
    description: 'Textbooks currently allocated',
    emptyMessage: 'No textbooks have been allocated.',
    icon: (
      <>
        <path d="M4 4h16v16H4zM8 8h8M8 12h8" />
        <path d="m8 16 2 2 5-5" />
      </>
    ),
  },
  {
    key: 'returned',
    title: 'Returned books',
    to: '/admin/returned',
    description: 'Textbooks returned',
    emptyMessage: 'No textbooks have been returned yet.',
    icon: (
      <>
        <path d="M4 5h16v14H4zM8 9h5" />
        <path d="m9 15 2.5 2.5L17 12" />
      </>
    ),
  },
  {
    key: 'subjects',
    title: 'Subjects',
    to: '/admin/subjects',
    description: 'Subjects available',
    emptyMessage: 'There are no subjects configured yet.',
    icon: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
        <path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 11h6" />
      </>
    ),
  },
]

function DashboardLoadingState() {
  return (
    <div aria-busy="true" className="rounded-xl border border-slate-800 bg-[#1a1d24] p-5">
      <div className="flex items-center gap-2 text-sm text-slate-300" role="status">
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"
        />
        Loading dashboard summary...
      </div>
      <div
        className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-hidden="true"
      >
        {cards.map((card) => (
          <div
            key={card.key}
            className="rounded-lg border border-slate-700/60 bg-[#20232b] p-5"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-slate-600" />
            <div className="mt-5 h-9 w-16 animate-pulse rounded bg-slate-600" />
            <div className="mt-3 h-4 w-40 animate-pulse rounded bg-slate-600" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminOverview() {
  const [summary, setSummary] = useState(null)
  const [gradeAllocations, setGradeAllocations] = useState([0, 0, 0, 0, 0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true

    async function loadSummary() {
      try {
        const [response, allocationResponse] = await Promise.all([
          apiFetch('/api/admin/summary'),
          apiFetch('/api/admin/allocations?outstanding=true'),
        ])
        const validCounts = cards.every(
          (card) => Number.isInteger(response[card.key]) && response[card.key] >= 0,
        )
        if (!validCounts) {
          throw new Error('The server returned an invalid dashboard summary.')
        }
        if (!Array.isArray(allocationResponse.allocations)) {
          throw new Error('The server returned an invalid allocation list.')
        }

        if (active) {
          setSummary(response)
          setGradeAllocations(
            [8, 9, 10, 11, 12].map(
              (grade) =>
                allocationResponse.allocations.filter(
                  (allocation) => allocation.textbook?.grade === grade,
                ).length,
            ),
          )
          setError('')
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Could not load the dashboard summary.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSummary()
    return () => {
      active = false
    }
  }, [reloadCount])

  function handleRetry() {
    setLoading(true)
    setError('')
    setReloadCount((count) => count + 1)
  }

  return (
    <section className="min-h-screen bg-[#111318] px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto w-full">
        {loading ? (
          <DashboardLoadingState />
        ) : error ? (
          <div className="rounded-xl border border-red-400/30 bg-[#1a1d24] p-6" role="alert">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="flex h-16 items-center px-1">
              <h1 className="text-2xl font-bold tracking-tight text-white/95">Overview</h1>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.65fr]">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-[#343a48]">
                {[
                  { title: 'Learners', value: summary.learners, icon: 'users', to: '/admin/learners' },
                  { title: 'Textbooks', value: summary.textbooks, icon: 'book', to: '/admin/textbooks' },
                  { title: 'Issued books', value: summary.outstanding, icon: 'issued', to: '/admin/issued' },
                  { title: 'Returned', value: summary.returned, icon: 'returned', to: '/admin/returned' },
                ].map((stat) => (
                  <Link key={stat.title} to={stat.to} className="admin-blue-shadow flex min-h-24 items-center gap-4 bg-[#1a1d24] px-5 transition hover:bg-[#20242d]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-400/10 text-blue-300">
                      {stat.icon === 'users' ? (
                        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8"/></svg>
                      ) : (
                        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20"/></svg>
                      )}
                    </span>
                    <span>
                      <span className="block text-sm text-slate-400">{stat.title}</span>
                      <span className="mt-1 block text-2xl font-bold text-blue-300">{stat.value.toLocaleString()}</span>
                    </span>
                  </Link>
                ))}
              </div>

              <div className="admin-blue-shadow relative min-h-52 overflow-hidden rounded-lg border border-slate-800/60 bg-[#1a1d24] px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Allocation history</p>
                    <p className="mt-1 text-3xl font-bold text-blue-300">{summary.outstanding.toLocaleString()}</p>
                  </div>
                  <span className="rounded-md bg-blue-400/10 px-2 py-1 text-xs text-blue-300">Active issue</span>
                </div>
                <div
                  className="absolute bottom-4 left-6 right-6 flex h-32 items-end justify-between gap-3"
                  role="img"
                  aria-label="Active allocations by grade"
                >
                  {[8, 9, 10, 11, 12].map((grade, index) => {
                    const value = gradeAllocations[index]
                    const maxValue = Math.max(...gradeAllocations, 1)
                    const height = value === 0 ? 6 : Math.max(18, (value / maxValue) * 100)
                    return (
                      <div key={grade} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                        <div className="flex h-[calc(100%-26px)] items-end justify-center">
                          <div
                            className="relative w-full max-w-16 rounded-t-md bg-blue-500"
                            style={{ height: `${height}%` }}
                            title={`Grade ${grade}: ${value} active allocations`}
                          >
                            {value > 0 && (
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-blue-200">
                                {value}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="h-6 pt-1 text-center text-xs font-medium text-slate-400">
                          Grade {grade}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Link to="/admin/textbooks" className="admin-blue-shadow group min-h-44 rounded-lg bg-[#202b3d] p-6 transition hover:-translate-y-0.5 hover:bg-[#26344a]">
                <p className="text-lg font-bold">Library catalog</p>
                <p className="mt-3 max-w-[260px] text-sm leading-6 text-slate-300">Browse and manage textbooks across every subject.</p>
                <p className="mt-5 text-sm font-semibold text-blue-300">{summary.textbooks} textbooks</p>
              </Link>
              <Link to="/admin/learners" className="admin-blue-shadow group relative min-h-44 overflow-hidden rounded-lg bg-[#202b3d] p-6 transition hover:-translate-y-0.5 hover:bg-[#26344a]">
                <p className="text-lg font-bold">Learner records</p>
                <p className="mt-3 max-w-[260px] text-sm leading-6 text-slate-200">View grades and track allocations for each learner.</p>
                <p className="mt-5 text-sm font-semibold text-blue-300">{summary.learners} registered</p>
                <svg aria-hidden="true" className="absolute bottom-3 right-5 h-16 w-16 text-blue-300/20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h7M7 16h5"/></svg>
              </Link>
              <Link to="/admin/subjects" className="admin-blue-shadow group relative min-h-44 overflow-hidden rounded-lg bg-[#202b3d] p-6 transition hover:-translate-y-0.5 hover:bg-[#26344a]">
                <p className="text-lg font-bold">Subjects</p>
                <p className="mt-3 max-w-[260px] text-sm leading-6 text-slate-200">Organize the library into clear subject categories.</p>
                <p className="mt-5 text-sm font-semibold text-blue-300">{summary.subjects} subjects</p>
                <svg aria-hidden="true" className="absolute bottom-4 right-5 h-14 w-14 text-blue-300/20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M8 7h8M8 11h6"/></svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
