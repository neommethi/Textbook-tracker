import { useMemo, useState } from 'react'
import { useStudentTextbooks } from '../hooks/useStudentTextbooks'
import FullScreenLoading from '../components/FullScreenLoading'

function formatDate(value) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not recorded'
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function StatusBadge({ status }) {
  const returned = status === 'returned'
  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
      returned
        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
        : 'border-blue-500/30 bg-blue-400/10 text-blue-300'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${returned ? 'bg-emerald-400' : 'bg-blue-400'}`} aria-hidden="true" />
      {returned ? 'Returned' : 'Issued'}
    </span>
  )
}

export default function StudentTextbooksPage() {
  const { textbooks, loadState, loadError, retry } = useStudentTextbooks()
  const [search, setSearch] = useState('')
  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return textbooks
    return textbooks.filter((book) =>
      `${book.title} ${book.subject} ${book.grade} ${book.allocationNumber}`
        .toLowerCase()
        .includes(query),
    )
  }, [search, textbooks])

  return (
    <>
      <FullScreenLoading visible={loadState === 'loading'} label="Loading your textbooks..." />
      {loadState !== 'loading' && (
        <section className="min-h-screen px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Textbook showroom</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              A special place for all your Textbooks.
            </p>
          </div>

        </header>

        <div className="mb-5 rounded-xl border border-slate-800 bg-[#1a1d24] p-4 sm:p-5">
          <label htmlFor="showroom-search" className="sr-only">Search your textbooks</label>
          <input
            id="showroom-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, subject, grade, or allocation number..."
            className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {loadState === 'error' ? (
          <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-6 text-center">
            <p className="text-sm text-red-300">{loadError}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 min-h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Try again
            </button>
          </div>
        ) : textbooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-[#1a1d24] px-4 py-16 text-center">
            <p className="font-semibold text-slate-200">Your showroom is waiting for books</p>
            <p className="mt-2 text-sm text-slate-400">Textbooks assigned to you will appear here.</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-[#1a1d24] px-4 py-12 text-center text-sm text-slate-400">
            No textbooks match that search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBooks.map((book) => (
              <article
                key={book.id}
                className="admin-blue-shadow flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#1a1d24] transition-shadow"
              >
                <div className="flex min-h-44 items-center justify-center border-b border-slate-800 bg-[#20232b] p-6">
                  <svg aria-hidden="true" className="h-16 w-16 text-blue-300/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
                    <path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h6" />
                  </svg>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
                        {book.subject || 'Subject not set'}
                      </p>
                      <h2 className="mt-2 break-words text-lg font-bold text-white">
                        {book.title || 'Untitled textbook'}
                      </h2>
                    </div>
                    <StatusBadge status={book.status} />
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Grade</dt>
                      <dd className="mt-1 font-medium text-slate-200">{book.grade ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Allocated</dt>
                      <dd className="mt-1 font-medium text-slate-200">{formatDate(book.dateAllocated)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-slate-500">Allocation number</dt>
                      <dd className="mt-1 font-mono text-xs text-slate-300">{book.allocationNumber || '—'}</dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-500/30 px-4 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-400/10"
                  >
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M12 16V4m0 0L7 9m5-5 5 5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
                    </svg>
                    Upload image or picture
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
          </div>
        </section>
      )}
    </>
  )
}
