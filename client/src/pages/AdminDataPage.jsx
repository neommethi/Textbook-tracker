import { useEffect, useState } from 'react'
import { apiFetch } from '../api'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import TextbookForm from '../components/TextbookForm'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const pages = {
  textbooks: {
    title: 'Textbooks',
    description: 'Browse and organize the books in your school library.',
    endpoint: '/api/admin/textbooks',
    resultKey: 'textbooks',
    columns: [
      { label: 'Title', render: (textbook) => textbook.title },
      { label: 'Subject', render: (textbook) => textbook.subject },
      { label: 'Grade', render: (textbook) => `Grade ${textbook.grade}` },
      { label: 'Added', render: (textbook) => formatDate(textbook.created_at) },
    ],
  },
  issued: {
    title: 'Issued books',
    description: 'Track active allocations and record returns.',
    endpoint: '/api/admin/allocations?outstanding=true',
    resultKey: 'allocations',
    columns: [
      {
        label: 'Allocation number',
        render: (allocation) => allocation.allocation_number,
      },
      {
        label: 'Title',
        render: (allocation) => allocation.textbook?.title ?? '—',
      },
      {
        label: 'Subject',
        render: (allocation) => allocation.textbook?.subject ?? '—',
      },
      {
        label: 'Grade',
        render: (allocation) =>
          allocation.textbook?.grade == null
            ? '—'
            : `Grade ${allocation.textbook.grade}`,
      },
      { label: 'Learner', render: (allocation) => allocation.learner_name ?? 'Unknown learner' },
      {
        label: 'Allocated',
        render: (allocation) => formatDate(allocation.allocated_at),
      },
    ],
  },
  returned: {
    title: 'Returned books',
    description: 'A searchable history of books returned to the library.',
    endpoint: '/api/admin/allocations?outstanding=false',
    resultKey: 'allocations',
    columns: [
      {
        label: 'Allocation number',
        render: (allocation) => allocation.allocation_number,
      },
      {
        label: 'Title',
        render: (allocation) => allocation.textbook?.title ?? '—',
      },
      {
        label: 'Subject',
        render: (allocation) => allocation.textbook?.subject ?? '—',
      },
      {
        label: 'Grade',
        render: (allocation) =>
          allocation.textbook?.grade == null
            ? '—'
            : `Grade ${allocation.textbook.grade}`,
      },
      { label: 'Learner', render: (allocation) => allocation.learner_name ?? 'Unknown learner' },
      {
        label: 'Allocated',
        render: (allocation) => formatDate(allocation.allocated_at),
      },
      {
        label: 'Returned',
        render: (allocation) => formatDate(allocation.returned_at),
      },
    ],
  },
  subjects: {
    title: 'Subjects',
    description: 'Explore how the catalog is organized by subject.',
    endpoint: '/api/admin/subjects',
    resultKey: 'subjects',
    columns: [{ label: 'Subject', render: (subject) => subject.name }],
  },
}

export default function AdminDataPage({ pageKey }) {
  const [rows, setRows] = useState([])
  const [subjectBooks, setSubjectBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [pendingReturn, setPendingReturn] = useState(null)
  const [editingTextbook, setEditingTextbook] = useState(null)
  const [returnError, setReturnError] = useState('')
  const [returning, setReturning] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const page = pages[pageKey]

  useEffect(() => {
    if (!page) return undefined

    let active = true
    async function loadPage() {
      try {
        const response = await apiFetch(page.endpoint)
        const data = response[page.resultKey]
        if (!Array.isArray(data)) {
          throw new Error(`The server returned an invalid ${page.title.toLowerCase()} list.`)
        }

        let rowsWithLearnerNames = data
        let textbooksForSubjects = []
        if (pageKey === 'issued' || pageKey === 'returned') {
          const learnerResponse = await apiFetch('/api/admin/learners')
          if (!Array.isArray(learnerResponse.learners)) {
            throw new Error('The server returned an invalid learners list.')
          }
          const learnerNames = new Map(
            learnerResponse.learners.map((learner) => [learner.id, learner.name]),
          )
          rowsWithLearnerNames = data.map((allocation) => ({
            ...allocation,
            learner_name: learnerNames.get(allocation.learner_id) || 'Unknown learner',
          }))
        } else if (pageKey === 'subjects') {
          const textbookResponse = await apiFetch('/api/admin/textbooks')
          if (!Array.isArray(textbookResponse.textbooks)) {
            throw new Error('The server returned an invalid textbooks list.')
          }
          textbooksForSubjects = textbookResponse.textbooks
        }

        if (active) {
          setRows(rowsWithLearnerNames)
          setSubjectBooks(textbooksForSubjects)
          setError('')
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || `Could not load ${page.title.toLowerCase()}.`)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPage()

    return () => {
      active = false
    }
  }, [page, pageKey, reloadCount])

  function handleRetry() {
    setLoading(true)
    setError('')
    setReloadCount((count) => count + 1)
  }

  async function handleConfirmReturn() {
    if (!pendingReturn) return

    setReturnError('')
    setReturning(true)
    try {
      await apiFetch(
        `/api/admin/allocations/${encodeURIComponent(pendingReturn.id)}/return`,
        { method: 'PUT' },
      )
      setSuccessMessage(`Allocation ${pendingReturn.allocation_number} was recorded as returned.`)
      setPendingReturn(null)
      setLoading(true)
      setReloadCount((count) => count + 1)
    } catch (requestError) {
      setReturnError(requestError.message || 'Could not return this book.')
    } finally {
      setReturning(false)
    }
  }

  async function handleSaveTextbook(values) {
    await apiFetch(`/api/admin/textbooks/${encodeURIComponent(editingTextbook.id)}`, {
      method: 'PUT',
      body: values,
    })
    setEditingTextbook(null)
    setSuccessMessage(`${values.title} was updated in the catalog.`)
    setLoading(true)
    setReloadCount((count) => count + 1)
  }

  if (!page) {
    return <p className="p-8 text-slate-300">Page not found.</p>
  }

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase()
  const filterableRows = pageKey !== 'subjects'
  const subjectOptions = [...new Set(
    rows.map((row) => row.subject ?? row.textbook?.subject).filter(Boolean),
  )].sort((a, b) => a.localeCompare(b))
  const gradeOptions = [...new Set(
    rows.map((row) => row.grade ?? row.textbook?.grade).filter((grade) => grade != null),
  )].sort((a, b) => Number(a) - Number(b))
  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      !normalizedSearch ||
      page.columns.some((column) =>
        String(column.render(row) ?? '')
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      )
    const subject = row.subject ?? row.textbook?.subject
    const grade = row.grade ?? row.textbook?.grade
    return (
      matchesSearch &&
      (!subjectFilter || subject === subjectFilter) &&
      (!gradeFilter || String(grade) === gradeFilter)
    )
  })

  const textbooksCount = pageKey === 'subjects' ? subjectBooks.length : rows.length
  const subjectCount = new Set(
    (pageKey === 'subjects' ? subjectBooks : rows)
      .map((row) => row.subject ?? row.textbook?.subject)
      .filter(Boolean),
  ).size
  const gradeCount = new Set(
    (pageKey === 'subjects' ? subjectBooks : rows)
      .map((row) => row.grade ?? row.textbook?.grade)
      .filter((grade) => grade != null),
  ).size
  const uniqueLearners = new Set(rows.map((row) => row.learner_id).filter(Boolean)).size
  const metrics = {
    textbooks: [
      { label: 'Catalog titles', value: rows.length, tone: 'blue' },
      { label: 'Subjects covered', value: subjectCount, tone: 'blue' },
      { label: 'Grade levels', value: gradeCount, tone: 'blue' },
    ],
    issued: [
      { label: 'Active allocations', value: rows.length, tone: 'blue' },
      { label: 'Learners', value: uniqueLearners, tone: 'blue' },
      { label: 'Subjects', value: subjectCount, tone: 'blue' },
    ],
    returned: [
      { label: 'Returned records', value: rows.length, tone: 'blue' },
      { label: 'Learners served', value: uniqueLearners, tone: 'blue' },
      { label: 'Subjects', value: subjectCount, tone: 'blue' },
    ],
    subjects: [
      { label: 'Subjects', value: rows.length, tone: 'blue' },
      { label: 'Catalog titles', value: textbooksCount, tone: 'blue' },
      { label: 'Grade levels', value: gradeCount, tone: 'blue' },
    ],
  }[pageKey]
  const metricTones = {
    blue: 'bg-blue-400/10 text-blue-300',
  }
  const bookTitle = (row) => row.title ?? row.textbook?.title ?? 'Untitled book'
  const bookSubject = (row) => row.subject ?? row.textbook?.subject ?? 'Uncategorized'
  const bookGrade = (row) => row.grade ?? row.textbook?.grade
  const isReturnedHistory = pageKey === 'returned'
  const historyDate = (row) => pageKey === 'returned' ? row.returned_at : row.allocated_at
  const sortedHistoryRows = pageKey === 'returned' || pageKey === 'issued'
    ? [...filteredRows].sort(
        (a, b) => new Date(historyDate(b)).getTime() - new Date(historyDate(a)).getTime(),
      )
    : []
  const historyYearGroups = sortedHistoryRows.reduce((groups, row) => {
    const date = new Date(historyDate(row))
    const year = Number.isNaN(date.getTime()) ? 'Date unavailable' : String(date.getFullYear())
    const items = groups.get(year) ?? []
    items.push(row)
    groups.set(year, items)
    return groups
  }, new Map())
  return (
    <section className="min-h-screen bg-[#111318] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full">
        {!loading && !error && pageKey === 'textbooks' && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="admin-blue-shadow rounded-xl border border-slate-800 bg-[#1a1d24] px-4 py-3">
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className={`mt-1 text-xl font-bold ${metricTones[metric.tone].split(' ').pop()}`}>
                  {metric.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (pageKey === 'issued' || pageKey === 'returned') && (
          <div className="admin-blue-shadow mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-slate-800 bg-[#1a1d24] px-5 py-4">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className={`mt-1 text-lg font-bold ${metricTones[metric.tone].split(' ').pop()}`}>{metric.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {successMessage && (
          <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200" role="status">
            {successMessage}
          </p>
        )}

        <div className="mt-5 rounded-xl border border-slate-800 bg-[#1a1d24] p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <svg aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" />
              </svg>
              <label htmlFor="admin-data-search" className="sr-only">
                Search {page.title.toLowerCase()}
              </label>
              <input
                id="admin-data-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Search ${page.title.toLowerCase()}...`}
                className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            {filterableRows && (
              <>
                <label className="sr-only" htmlFor="admin-subject-filter">Filter by subject</label>
                <select
                  id="admin-subject-filter"
                  value={subjectFilter}
                  onChange={(event) => setSubjectFilter(event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-700 bg-[#111318] px-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="">All subjects</option>
                  {subjectOptions.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
                <label className="sr-only" htmlFor="admin-grade-filter">Filter by grade</label>
                <select
                  id="admin-grade-filter"
                  value={gradeFilter}
                  onChange={(event) => setGradeFilter(event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-700 bg-[#111318] px-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="">All grades</option>
                  {gradeOptions.map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}
                </select>
              </>
            )}
            <div className="flex min-h-11 items-center justify-center rounded-lg bg-white/[0.04] px-4 text-sm text-slate-400">
              <span>{filteredRows.length.toLocaleString()} {filteredRows.length === 1 ? 'result' : 'results'}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-[#1a1d24]" aria-busy="true">
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-slate-300" role="status">
              <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              Loading {page.title.toLowerCase()}...
            </div>
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex gap-4 border-t border-slate-800 px-4 py-5">
                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-700" />
                <div className="h-4 w-1/5 animate-pulse rounded bg-slate-700" />
                <div className="h-4 w-1/6 animate-pulse rounded bg-slate-700" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-[#1a1d24] p-6" role="alert">
            <p className="text-sm text-red-300">{error}</p>
            <button type="button" onClick={handleRetry} className="mt-3 min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-5 rounded-xl border border-slate-800 bg-[#1a1d24] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">Nothing here yet</p>
            <p className="mt-2 text-sm text-slate-400">No {page.title.toLowerCase()} have been recorded.</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="mt-5 rounded-xl border border-slate-800 bg-[#1a1d24] px-6 py-10 text-center">
            <p className="font-semibold text-white">No matching records</p>
            <p className="mt-2 text-sm text-slate-400">Try a different search or clear the selected filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setSubjectFilter('')
                setGradeFilter('')
              }}
              className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Clear filters
            </button>
          </div>
        ) : pageKey === 'textbooks' ? (
          <div
            className="mt-5 grid grid-cols-1 gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}
          >
            {filteredRows.map((book, index) => {
              const covers = [
                'from-blue-500/25 via-blue-500/10 to-[#1a1d24]',
                'from-blue-500/25 via-blue-500/10 to-[#1a1d24]',
                'from-blue-500/25 via-blue-500/10 to-[#1a1d24]',
                'from-blue-500/25 via-blue-500/10 to-[#1a1d24]',
              ]
              return (
                <article key={book.id} className="admin-blue-shadow group overflow-hidden rounded-xl border border-slate-800 bg-[#1a1d24] transition hover:-translate-y-0.5 hover:border-blue-500/40">
                  <div className={`relative flex h-32 items-end overflow-hidden bg-gradient-to-br ${covers[index % covers.length]} p-5`}>
                    <div className="absolute -right-4 -top-8 h-36 w-28 rotate-12 rounded-lg border border-white/10 bg-white/[0.035]" />
                    <div className="absolute right-8 top-5 h-24 w-1 rounded-full bg-white/10" />
                    <span className="relative rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium text-slate-200">
                      Grade {book.grade}
                    </span>
                    <span className="absolute bottom-5 right-5 text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                      Library copy
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-white">{book.title}</h2>
                        <p className="mt-1 text-sm text-blue-300">{book.subject}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-700/50 px-2.5 py-1 text-[11px] text-slate-300">
                        {formatDate(book.created_at)}
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500">
                      <span>Added to catalog</span>
                      <span className="font-mono">{String(book.id ?? '').slice(0, 8)}</span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        className="min-h-10 rounded-lg border border-blue-500/30 px-3 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-400/10"
                        onClick={() => {
                          setSuccessMessage('')
                          setEditingTextbook(book)
                        }}
                        type="button"
                      >
                        Edit textbook
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : pageKey === 'returned' || pageKey === 'issued' ? (
          <div className="mt-5 space-y-7">
            {[...historyYearGroups.entries()].map(([year, yearRows]) => (
              <section key={year} aria-labelledby={`history-year-${year}`}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 id={`history-year-${year}`} className="text-sm font-semibold text-blue-200">{year}</h2>
                  <div className="h-px flex-1 bg-slate-800" />
                  <span className="text-xs text-slate-500"><span className="font-semibold text-blue-300">{yearRows.length}</span> {yearRows.length === 1 ? (isReturnedHistory ? 'return' : 'issue') : (isReturnedHistory ? 'returns' : 'issues')}</span>
                </div>
                <div className="relative ml-2 space-y-3 border-l border-blue-400/20 pl-6">
                  {yearRows.map((allocation) => (
                    <article key={allocation.id} className="admin-blue-shadow relative rounded-xl border border-slate-800 bg-[#1a1d24] p-4 transition hover:border-blue-500/40 sm:p-5">
                      <span className="absolute -left-[31px] top-5 h-2.5 w-2.5 rounded-full border-2 border-[#111318] bg-blue-300" />
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{bookTitle(allocation)}</p>
                          <p className="mt-1 text-sm text-blue-200">{bookSubject(allocation)}</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-blue-400/10 px-3 py-1.5 text-sm font-medium text-blue-200">
                          {isReturnedHistory ? 'Returned' : 'Issued'} {formatDate(historyDate(allocation))}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3 text-sm sm:grid-cols-4">
                        <div><p className="text-xs text-slate-500">Learner</p><p className="mt-1 truncate text-slate-200">{allocation.learner_name}</p></div>
                        <div><p className="text-xs text-slate-500">Grade</p><p className="mt-1 text-blue-300">{bookGrade(allocation) == null ? '—' : `Grade ${bookGrade(allocation)}`}</p></div>
                        <div>
                          <p className="text-xs text-slate-500">{isReturnedHistory ? 'Allocated' : 'Status'}</p>
                          <p className="mt-1 text-slate-300">{isReturnedHistory ? formatDate(allocation.allocated_at) : 'Outstanding'}</p>
                        </div>
                        <div><p className="text-xs text-slate-500">Allocation</p><p className="mt-1 truncate font-mono text-xs text-blue-300">{allocation.allocation_number}</p></div>
                      </div>
                      {pageKey === 'issued' && (
                        <div className="mt-4 flex justify-end border-t border-slate-800 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setReturnError('')
                              setPendingReturn(allocation)
                            }}
                            className="min-h-10 rounded-lg border border-blue-500/30 px-4 text-sm font-semibold text-blue-300 transition hover:bg-blue-400/10"
                          >
                            Return book
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : pageKey === 'subjects' ? (
          <div
            className="mt-5 grid grid-cols-1 gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}
          >
            {filteredRows.map((subject, index) => {
              const books = subjectBooks.filter((book) => book.subject === subject.name)
              const grades = [...new Set(books.map((book) => book.grade))].sort((a, b) => a - b)
              const accents = ['from-blue-400 to-blue-600']
              return (
                <article key={subject.id ?? subject.name} className="admin-blue-shadow group relative overflow-hidden rounded-xl border border-slate-800 bg-[#1a1d24] p-5 transition hover:border-blue-500/40 hover:bg-[#20242d]">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accents[index % accents.length]}`} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
                          <path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8" />
                        </svg>
                      </span>
                      <h2 className="truncate text-lg font-semibold text-white">{subject.name}</h2>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-400/10 px-2.5 py-1 text-xs text-blue-300">
                      {books.length} {books.length === 1 ? 'title' : 'titles'}
                    </span>
                  </div>
                  <div className="mt-5 border-t border-slate-800 pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Grades represented</p>
                    {grades.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {grades.map((grade) => (
                          <span key={grade} className="rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-300">Grade {grade}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">No catalog titles yet</p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <>
            <div className="mt-5 hidden overflow-x-auto rounded-xl border border-slate-800 bg-[#1a1d24] md:block">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead className="bg-[#20232b] text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <tr>
                    {page.columns.map((column) => <th key={column.label} scope="col" className="px-4 py-3">{column.label}</th>)}
                    {pageKey === 'issued' && <th scope="col" className="px-4 py-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredRows.map((row, index) => (
                    <tr key={row.id ?? row.name ?? index} className="transition-colors hover:bg-white/[0.025]">
                      {page.columns.map((column) => (
                        <td key={column.label} className="whitespace-nowrap px-4 py-3">
                          {column.label === 'Grade' ? (
                            <span className="rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-300">{column.render(row) ?? '—'}</span>
                          ) : column.label === 'Allocation number' ? (
                            <span className="font-mono text-xs text-slate-400">{column.render(row) ?? '—'}</span>
                          ) : column.label === 'Title' ? (
                            <span className="font-medium text-white">{column.render(row) ?? '—'}</span>
                          ) : column.label === 'Subject' ? (
                            <span className="text-blue-300">{column.render(row) ?? '—'}</span>
                          ) : (
                            column.render(row) ?? '—'
                          )}
                        </td>
                      ))}
                      {pageKey === 'issued' && (
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setReturnError('')
                              setPendingReturn(row)
                            }}
                            className="rounded-lg border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-400/10"
                          >
                            Return book
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {filteredRows.map((row, index) => (
                <article key={row.id ?? row.name ?? index} className="rounded-xl border border-slate-800 bg-[#1a1d24] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{bookTitle(row)}</p>
                      <p className="mt-1 truncate text-sm text-blue-300">{bookSubject(row)}</p>
                    </div>
                    {bookGrade(row) != null && (
                      <span className="shrink-0 rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-300">Grade {bookGrade(row)}</span>
                    )}
                  </div>
                  {pageKey !== 'textbooks' && (
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Learner</p>
                        <p className="mt-1 truncate text-slate-200">{row.learner_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{pageKey === 'returned' ? 'Returned' : 'Allocated'}</p>
                        <p className="mt-1 text-slate-300">{formatDate(pageKey === 'returned' ? row.returned_at : row.allocated_at)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Allocation</p>
                        <p className="mt-1 font-mono text-xs text-slate-400">{row.allocation_number}</p>
                      </div>
                    </div>
                  )}
                  {pageKey === 'issued' && (
                    <button
                      type="button"
                      onClick={() => {
                        setReturnError('')
                        setPendingReturn(row)
                      }}
                      className="mt-4 min-h-10 w-full rounded-lg border border-blue-500/30 text-sm font-semibold text-blue-300 hover:bg-blue-400/10"
                    >
                      Return book
                    </button>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
      {pendingReturn && (
        <ConfirmDeleteModal
          itemType="book"
          itemDescription={`allocation ${pendingReturn.allocation_number} (${bookTitle(pendingReturn)} for ${pendingReturn.learner_name})`}
          action="return"
          error={returnError}
          loading={returning}
          onConfirm={handleConfirmReturn}
          onCancel={() => {
            setPendingReturn(null)
            setReturnError('')
          }}
        />
      )}
      {editingTextbook && (
        <TextbookForm
          key={editingTextbook.id}
          textbook={editingTextbook}
          onSave={handleSaveTextbook}
          onCancel={() => setEditingTextbook(null)}
        />
      )}
    </section>
  )
}
