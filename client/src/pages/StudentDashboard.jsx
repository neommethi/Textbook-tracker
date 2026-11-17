
import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'


const textbooks = [
  { id: 'TB-001', subject: 'Mathematics', title: 'Mathematics Grade 11', returned: false },
  { id: 'TB-002', subject: 'English', title: 'English Home Language', returned: true },
  { id: 'TB-003', subject: 'Life Sciences', title: 'Life Sciences Grade 11', returned: false },
  { id: 'TB-004', subject: 'Geography', title: 'Geography Grade 11', returned: true },
  { id: 'TB-005', subject: 'Physical Sciences', title: 'Physical Sciences Grade 11', returned: false },
]

export default function StudentDashboard() {

  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login', { replace: true })
  }

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const returned = textbooks.filter(book => book.returned).length
  const outstanding = textbooks.length - returned

  const filteredBooks = textbooks.filter(book => {
    const matchesSearch = `${book.subject} ${book.title} ${book.id}`
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'returned' && book.returned) ||
      (filter === 'outstanding' && !book.returned)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-slate-50">
     
<header className="bg-white border-b border-slate-200">
  <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-xl font-bold text-blue-700">
        Textbook Tracker
      </h1>
      <p className="text-sm text-slate-500">
        Student Portal
      </p>
    </div>

    <nav aria-label="Student navigation" className="flex items-center gap-3">
      <Link
        to="/student-dashboard"
        aria-current="page"
        className="text-sm font-medium text-blue-700 bg-blue-50 px-4 py-2 rounded-lg"
      >
        Dashboard
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
      >
        Logout
      </button>
    </nav>
  </div>
</header>


      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-900">
          My Dashboard
        </h2>
        <p className="text-slate-500 mt-1">
          Track your school textbooks and return status.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Total Textbooks', value: textbooks.length },
            { label: 'Returned', value: returned },
            { label: 'Outstanding', value: outstanding },
          ].map(stat => (
            <div key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold mt-2 text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-8 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold mb-4">My Textbooks</h3>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="search"
              placeholder="Search textbooks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3"
            />

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-3"
              aria-label="Filter textbooks by return status"
            >
              <option value="all">All Books</option>
              <option value="returned">Returned</option>
              <option value="outstanding">Outstanding</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredBooks.map(book => (
              <div key={book.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-slate-200 rounded-lg p-4">
                <div>
                  <h4 className="font-semibold">{book.subject}</h4>
                  <p className="text-sm text-slate-500">{book.title}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Book ID: {book.id}
                  </p>
                </div>

                <span className={`self-start text-sm font-medium px-3 py-1 rounded-full ${
                  book.returned
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {book.returned ? 'Returned' : 'Outstanding'}
                </span>
              </div>
            ))}

            {filteredBooks.length === 0 && (
              <p className="text-center text-slate-500 py-6">
                No textbooks found.
              </p>
            )}
          </div>
        </section>

        <p className="text-sm text-slate-500 mt-6">
          Textbook return statuses are updated by school administrators.
        </p>
      </main>
    </div>
  )
}
