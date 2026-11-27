
import { useState } from 'react'
import { useStudentTextbooks } from '../hooks/useStudentTextbooks'
import FullScreenLoading from '../components/FullScreenLoading'

function formatDate(date) {
  if (!date) return 'Not recorded'

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return 'Not recorded'

  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate)
}

function ReturnStatusBadge({ status }) {
  const styles = {
    issued: 'border-blue-200 bg-blue-50 text-blue-700',
    returned: 'border-green-200 bg-green-50 text-green-700',
  }
  const labels = {
    issued: 'Issued',
    returned: 'Returned',
  }

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        styles[status] || 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'returned' ? 'bg-green-600'
            : 'bg-blue-600'
        }`}
        aria-hidden="true"
      />
      {labels[status] || (status ? `${status[0].toUpperCase()}${status.slice(1)}` : 'Unknown')}
    </span>
  )
}

export default function StudentDashboard() {
  const { textbooks, loadState, loadError, retry } = useStudentTextbooks()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const returned = textbooks.filter(book => book.status === 'returned').length
  const outstanding = textbooks.length - returned

  const filteredBooks = textbooks.filter(book => {
    const matchesSearch =
      `${book.subject} ${book.title} ${book.allocationNumber} ${book.status}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'returned' && book.status === 'returned') ||
      (filter === 'outstanding' && book.status !== 'returned')

    return matchesSearch && matchesFilter
  })

  const stats = [
    {
      label: 'Total Textbooks',
      value: loadState === 'ready' ? textbooks.length : '—',
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
      value: loadState === 'ready' ? returned : '—',
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
      value: loadState === 'ready' ? outstanding : '—',
      description: 'Not marked as returned',
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
    <>
      <FullScreenLoading visible={loadState === 'loading'} label="Loading your dashboard..." />
      {loadState !== 'loading' && (
        <div className="student-dashboard min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <section className="mb-7 flex flex-col gap-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50 p-5 shadow-sm sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Learner workspace
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Keep track of your textbook allocations and return history.
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
                {loadState === 'ready'
                  ? `Showing ${filteredBooks.length} of ${textbooks.length} books`
                  : 'Allocation unavailable'}
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
                placeholder="Search by subject, title or allocation number..."
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
            {loadState === 'error' ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-10 text-center">
                <p className="font-semibold text-red-900">We couldn’t load your textbooks</p>
                <p className="mt-1 text-sm text-red-800">{loadError}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : textbooks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center">
                <p className="font-semibold text-slate-800">No textbooks assigned yet</p>
                <p className="mt-1 text-sm text-slate-500">Your allocations will appear here once they are assigned.</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center">
                <p className="font-semibold text-slate-800">No textbooks found</p>
                <p className="mt-1 text-sm text-slate-500">Try changing your search or filter.</p>
              </div>
            ) : filteredBooks.map(book => (
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
                  <ReturnStatusBadge status={book.status} />
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Allocation number
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                    {book.allocationNumber}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="mb-2 text-xs font-semibold text-slate-500">
                      Grade
                    </dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {book.grade}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-2 text-xs font-semibold text-slate-500">
                      Date allocated
                    </dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {formatDate(book.dateAllocated)}
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
          </div>
        </section>

        <aside className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:mt-6 sm:p-5">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
          <p className="text-sm leading-6 text-blue-900">
            Allocation records and return dates are managed by authorized school staff. Contact your teacher if any information is incorrect.
          </p>
        </aside>

          </div>
        </div>
      )}
    </>
  )
}
