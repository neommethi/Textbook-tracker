
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Temporary frontend data for Phase 1.
// Real learner records will come from the backend in Phase 2.
const textbooks = [
  {
    id: 'TB-001',
    subject: 'Mathematics',
    title: 'Mathematics Grade 11',
    returned: false,
    conditionIssued: 'Good',
    conditionReturned: null,
    dateIssued: '2026-01-15',
    dateReturned: null,
  },
  {
    id: 'TB-002',
    subject: 'English',
    title: 'English Home Language',
    returned: true,
    conditionIssued: 'Good',
    conditionReturned: 'Good',
    dateIssued: '2026-01-15',
    dateReturned: '2026-11-10',
  },
  {
    id: 'TB-003',
    subject: 'Life Sciences',
    title: 'Life Sciences Grade 11',
    returned: false,
    conditionIssued: 'Fair',
    conditionReturned: null,
    dateIssued: '2026-01-16',
    dateReturned: null,
  },
  {
    id: 'TB-004',
    subject: 'Geography',
    title: 'Geography Grade 11',
    returned: true,
    conditionIssued: 'Good',
    conditionReturned: 'Fair',
    dateIssued: '2026-01-16',
    dateReturned: '2026-11-12',
  },
  {
    id: 'TB-005',
    subject: 'Physical Sciences',
    title: 'Physical Sciences Grade 11',
    returned: false,
    conditionIssued: 'Poor',
    conditionReturned: null,
    dateIssued: '2026-01-17',
    dateReturned: null,
  },
]

function formatDate(date) {
  if (!date) return 'Not recorded'

  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

function ConditionBadge({ condition }) {
  const styles = {
    Good: 'border-green-200 bg-green-50 text-green-700',
    Fair: 'border-amber-200 bg-amber-50 text-amber-700',
    Poor: 'border-orange-200 bg-orange-50 text-orange-700',
    Damaged: 'border-red-200 bg-red-50 text-red-700',
  }

  if (!condition) {
    return (
      <span className="text-sm font-medium text-slate-400">
        Not recorded
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[condition] || 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {condition}
    </span>
  )
}

export default function StudentDashboard() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const returned = textbooks.filter(book => book.returned).length
  const outstanding = textbooks.length - returned

  const filteredBooks = textbooks.filter(book => {
    const matchesSearch =
      `${book.subject} ${book.title} ${book.id}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'returned' && book.returned) ||
      (filter === 'outstanding' && !book.returned)

    return matchesSearch && matchesFilter
  })

  const handleLogout = () => {
    // Frontend-only navigation for Phase 1.
    // Backend logout will be implemented in Phase 2.
    navigate('/login', { replace: true })
  }

  const stats = [
    {
      label: 'Total Textbooks',
      value: textbooks.length,
      description: 'Books allocated to you',
      color: 'text-blue-700',
      background: 'bg-blue-50',
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M4.75 5.75A2.75 2.75 0 0 1 7.5 3h12v16h-12a2.75 2.75 0 0 0-2.75 2.75v-16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M4.75 19A2.75 2.75 0 0 1 7.5 16.25h12M8.5 7h7M8.5 10h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Returned',
      value: returned,
      description: 'Successfully handed back',
      color: 'text-green-700',
      background: 'bg-green-50',
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      ),
    },
    {
      label: 'Outstanding',
      value: outstanding,
      description: 'Still in your care',
      color: 'text-amber-700',
      background: 'bg-amber-50',
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm shadow-blue-900/15">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path d="M4.75 5.75A2.75 2.75 0 0 1 7.5 3h12v16h-12a2.75 2.75 0 0 0-2.75 2.75v-16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M4.75 19A2.75 2.75 0 0 1 7.5 16.25h12M8.5 7h7M8.5 10h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                Textbook Tracker
              </h1>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Student portal
              </p>
            </div>
          </div>

          <nav aria-label="Student navigation" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/student-dashboard"
              aria-current="page"
              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:px-4"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:px-4"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <section className="mb-7 flex flex-col gap-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50 p-5 shadow-sm sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Learner workspace
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Keep track of your allocated textbooks, their condition, and return history.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
            2026 academic year
          </div>
        </section>

        {/* Summary cards */}
        <section
          aria-label="Textbook summary"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5"
        >
          {stats.map(stat => (
            <div
              key={stat.label}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-600">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {stat.description}
                </p>
              </div>
              <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.background} ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
          ))}
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-8">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  My Textbooks
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Check your textbook allocation and return records.
                </p>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500 sm:mt-0">
                Showing {filteredBooks.length} of {textbooks.length} books
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:p-5">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">Search textbooks</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                placeholder="Search by subject, title or book number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search textbooks"
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block sm:w-52">
              <span className="sr-only">Filter textbooks by return status</span>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                aria-label="Filter textbooks by return status"
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">All books</option>
                <option value="returned">Returned</option>
                <option value="outstanding">Outstanding</option>
              </select>
            </label>
          </div>

          <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
            {filteredBooks.map(book => (
              <article
                key={book.id}
                className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      {book.subject}
                    </p>
                    <h4 className="mt-1 break-words text-base font-bold text-slate-900 sm:text-lg">
                      {book.title}
                    </h4>
                  </div>
                  <span
                    className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      book.returned
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${book.returned ? 'bg-green-600' : 'bg-amber-600'}`} aria-hidden="true" />
                    {book.returned ? 'Returned' : 'Outstanding'}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Book number
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                    {book.id}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="min-w-0">
                    <dt className="mb-2 text-xs font-semibold text-slate-500">
                      Condition when issued
                    </dt>
                    <dd><ConditionBadge condition={book.conditionIssued} /></dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-2 text-xs font-semibold text-slate-500">
                      Condition when returned
                    </dt>
                    <dd><ConditionBadge condition={book.conditionReturned} /></dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-2 text-xs font-semibold text-slate-500">
                      Date issued
                    </dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {formatDate(book.dateIssued)}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-2 text-xs font-semibold text-slate-500">
                      Date returned
                    </dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {book.dateReturned ? formatDate(book.dateReturned) : 'Not returned'}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}

            {filteredBooks.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-800">
                  No textbooks found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filter.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:mt-6 sm:p-5">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
          <p className="text-sm leading-6 text-blue-900">
            Textbook conditions, allocation dates and return statuses are managed by authorized school staff. Contact your teacher if any information is incorrect.
          </p>
        </aside>

      </main>
    </div>
  )
}
