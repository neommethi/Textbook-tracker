import { useEffect, useState } from 'react'
import { apiFetch } from '../api'

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
      { label: 'Learner ID', render: (allocation) => allocation.learner_id },
      {
        label: 'Allocated',
        render: (allocation) => formatDate(allocation.allocated_at),
      },
    ],
  },
  returned: {
    title: 'Returned books',
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
      { label: 'Learner ID', render: (allocation) => allocation.learner_id },
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
    endpoint: '/api/admin/subjects',
    resultKey: 'subjects',
    columns: [{ label: 'Subject', render: (subject) => subject.name }],
  },
}

export default function AdminDataPage({ pageKey }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const page = pages[pageKey]

  useEffect(() => {
    if (!page) return undefined

    let active = true
    apiFetch(page.endpoint)
      .then((response) => {
        const data = response[page.resultKey]
        if (!Array.isArray(data)) {
          throw new Error(`The server returned an invalid ${page.title.toLowerCase()} list.`)
        }
        if (active) {
          setRows(data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || `Could not load ${page.title.toLowerCase()}.`)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, reloadCount])

  function handleRetry() {
    setLoading(true)
    setError('')
    setReloadCount((count) => count + 1)
  }

  if (!page) {
    return <p className="p-8 text-slate-700">Page not found.</p>
  }

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase()
  const filteredRows = normalizedSearch
    ? rows.filter((row) =>
        page.columns.some((column) =>
          String(column.render(row) ?? '')
            .toLocaleLowerCase()
            .includes(normalizedSearch),
        ),
      )
    : rows

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-slate-900">{page.title}</h1>
        <div className="mt-5 max-w-md">
          <label
            htmlFor="admin-data-search"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Search {page.title.toLowerCase()}
          </label>
          <input
            id="admin-data-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Search ${page.title.toLowerCase()}...`}
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {loading ? (
          <div
            className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white"
            aria-busy="true"
          >
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-slate-600" role="status">
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"
              />
              Loading {page.title.toLowerCase()}...
            </div>
            <table className="min-w-full divide-y divide-slate-200" aria-hidden="true">
              <thead className="bg-slate-50">
                <tr>
                  {page.columns.map((column) => (
                    <th key={column.label} className="px-4 py-3">
                      <span className="sr-only">{column.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[0, 1, 2].map((row) => (
                  <tr key={row}>
                    {page.columns.map((column, index) => (
                      <td key={column.label} className="px-4 py-4">
                        <div
                          className={`h-4 animate-pulse rounded bg-slate-200 ${
                            index === 0 ? 'w-32' : 'w-20'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-white p-6" role="alert">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 min-h-11 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            No {page.title.toLowerCase()} found.
          </p>
        ) : filteredRows.length === 0 ? (
          <p className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            No {page.title.toLowerCase()} match “{searchTerm.trim()}”.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  {page.columns.map((column) => (
                    <th key={column.label} scope="col" className="px-4 py-3">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRows.map((row, index) => (
                  <tr key={row.id ?? row.name ?? index}>
                    {page.columns.map((column) => (
                      <td key={column.label} className="whitespace-nowrap px-4 py-3">
                        {column.render(row) ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
