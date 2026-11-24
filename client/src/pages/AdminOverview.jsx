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
    <div aria-busy="true">
      <div className="flex items-center gap-2 text-sm text-slate-600" role="status">
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"
        />
        Loading dashboard summary...
      </div>
      <div
        className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-hidden="true"
      >
        {cards.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 h-9 w-16 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-40 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminOverview() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true

    async function loadSummary() {
      try {
        const response = await apiFetch('/api/admin/summary')
        const validCounts = cards.every(
          (card) => Number.isInteger(response[card.key]) && response[card.key] >= 0,
        )
        if (!validCounts) {
          throw new Error('The server returned an invalid dashboard summary.')
        }

        if (active) {
          setSummary(response)
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
    <section className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            A quick overview of your textbook tracker. Select a section to manage it.
          </p>
        </header>

        {loading ? (
          <DashboardLoadingState />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-6" role="alert">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 min-h-11 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.key}
                to={card.to}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                        viewBox="0 0 24 24"
                      >
                        {card.icon}
                      </svg>
                    </span>
                    <h2 className="font-semibold text-slate-900">{card.title}</h2>
                  </div>
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </div>
                <p className="mt-5 text-3xl font-bold text-slate-900">
                  {summary[card.key]}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {summary[card.key] === 0 ? card.emptyMessage : card.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
