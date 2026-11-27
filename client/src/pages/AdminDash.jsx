import { useCallback, useEffect, useState } from 'react'
import LearnerList from '../components/LearnerList'
import TextbookForm from '../components/TextbookForm'
import { apiFetch } from '../api'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import LearnerDetailPage from './LearnerDetailPage'

const grades = [8, 9, 10, 11, 12]

async function fetchDashboardData() {
  const [learnerResult, allocationResult] = await Promise.all([
    apiFetch('/api/admin/learners'),
    apiFetch('/api/admin/allocations'),
  ])

  const allocationsByLearner = new Map()
  for (const allocation of allocationResult.allocations) {
    const textbook = allocation.textbook || {}
    const books = allocationsByLearner.get(allocation.learner_id) || []
    books.push({
      allocationId: allocation.id,
      allocationNumber: allocation.allocation_number,
      textbookId: allocation.textbook_id,
      title: textbook.title,
      subject: textbook.subject,
      grade: textbook.grade,
      returned: allocation.returned_at !== null,
    })
    allocationsByLearner.set(allocation.learner_id, books)
  }

  return {
    learners: learnerResult.learners.map((learner) => ({
      ...learner,
      textbooks: allocationsByLearner.get(learner.id) || [],
    })),
  }
}

function LearnerLoadingState({ title }) {
  return (
    <div
      className="rounded-xl border border-slate-800 bg-[#1a1d24] p-4 text-slate-200 sm:p-5"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-sm text-slate-300" role="status">
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"
        />
        Fetching {title.toLowerCase()}...
      </div>
      <div
        className="mt-4 grid grid-cols-1 gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}
        aria-hidden="true"
      >
        {[0, 1, 2].map((card) => (
          <div
            key={card}
            className="admin-blue-shadow rounded-xl border border-slate-800 bg-[#20232b] p-4 sm:p-5"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="h-5 w-32 animate-pulse rounded bg-slate-700" />
              <div className="h-7 w-20 animate-pulse rounded-full bg-slate-700" />
            </div>
            {[0, 1].map((row) => (
              <div key={row} className="border-t border-slate-700 py-3">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-700" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-700" />
              </div>
            ))}
            <div className="mt-3 h-10 w-20 animate-pulse rounded-lg bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Load and manage learners and their textbook allocations through the admin API.
export default function AdminDashboard({ view = 'learners' }) {
  const { learnerId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedGradeParam = searchParams.get('grade')
  const selectedGrade = grades.includes(Number(selectedGradeParam))
    ? Number(selectedGradeParam)
    : null
  const searchTerm = searchParams.get('q') || ''
  const queryString = searchParams.toString()
  const backTo = `/admin/learners${queryString ? `?${queryString}` : ''}`
  const [learners, setLearners] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeForm, setActiveForm] = useState(null)

  const applyDashboardData = useCallback(({ learners: nextLearners }) => {
    setLearners(nextLearners)
  }, [])

  const loadDashboard = useCallback(async () => {
    try {
      const data = await fetchDashboardData()
      applyDashboardData(data)
      setLoadError('')
    } catch (error) {
      setLoadError(error.message || 'Could not load admin data.')
    } finally {
      setLoading(false)
    }
  }, [applyDashboardData])

  useEffect(() => {
    let active = true
    fetchDashboardData()
      .then((data) => {
        if (!active) return
        applyDashboardData(data)
        setLoadError('')
      })
      .catch((error) => {
        if (active) setLoadError(error.message || 'Could not load admin data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [applyDashboardData])

  async function handleSaveTextbook(values) {
    const result = await apiFetch('/api/admin/allocations', {
      method: 'POST',
      body: {
        ...values,
        learner_id: activeForm.learner.id,
      },
    })
    setSuccessMessage(
      `Textbook allocated successfully. Allocation number: ${result.allocation.allocation_number}`,
    )

    setActiveForm(null)
    setLoading(true)
    await loadDashboard()
  }

  const selectedLearner = learners.find((learner) => learner.id === learnerId)
  const gradeLearners = selectedGrade
    ? learners.filter((learner) => learner.grade === selectedGrade)
    : []
  const filteredLearners = gradeLearners.filter((learner) =>
    learner.name.toLocaleLowerCase().includes(searchTerm.trim().toLocaleLowerCase()),
  )
  const totalAllocations = learners.reduce(
    (total, learner) => total + learner.textbooks.length,
    0,
  )
  const learnersWithActiveAllocations = learners.filter((learner) =>
    learner.textbooks.some((textbook) => !textbook.returned),
  ).length
  function selectGrade(grade) {
    setSearchParams({ grade: String(grade) })
  }

  function updateSearch(value) {
    const nextParams = new URLSearchParams(searchParams)
    if (value) nextParams.set('q', value)
    else nextParams.delete('q')
    setSearchParams(nextParams, { replace: true })
  }

  const pageTitle = view === 'grades' ? 'Grades' : 'Learners'

  return (
    <main className="min-h-screen bg-[#111318] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full">
        {!learnerId && !selectedGrade && (
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="admin-blue-shadow flex items-center gap-4 rounded-xl border border-slate-800 bg-[#1a1d24] px-5 py-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                      <circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-xs text-slate-400">Total learners</span>
                    <span className="block text-2xl font-bold text-blue-300">{learners.length.toLocaleString()}</span>
                  </span>
                </div>
                <div className="admin-blue-shadow flex items-center gap-4 rounded-xl border border-slate-800 bg-[#1a1d24] px-5 py-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-xs text-slate-400">Books allocated</span>
                    <span className="block text-2xl font-bold text-blue-300">{totalAllocations.toLocaleString()}</span>
                  </span>
                </div>
                <div className="admin-blue-shadow flex items-center gap-4 rounded-xl border border-slate-800 bg-[#1a1d24] px-5 py-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
                      <path d="M4 12h16M12 4v16" /><circle cx="12" cy="12" r="9" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-xs text-slate-400">Learners with books</span>
                    <span className="block text-2xl font-bold text-blue-300">{learnersWithActiveAllocations.toLocaleString()}</span>
                  </span>
                </div>
              </div>
        )}

        {successMessage && (
          <p className="mb-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200" role="status">
            {successMessage}
          </p>
        )}

        {loading ? (
          <LearnerLoadingState title={pageTitle} />
        ) : loadError ? (
          <div className="rounded-xl border border-red-400/30 bg-[#1a1d24] p-6" role="alert">
            <p className="text-sm text-red-300">{loadError}</p>
            <button
              className="mt-3 min-h-10 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              onClick={() => {
                setLoading(true)
                loadDashboard()
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : learnerId && !selectedLearner ? (
          <div className="rounded-xl border border-slate-800 bg-[#1a1d24] p-6">
            <p className="text-slate-300">Learner not found.</p>
            <Link
              to={backTo}
              className="mt-3 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Back to learners
            </Link>
          </div>
        ) : learnerId ? (
          <LearnerDetailPage
            learner={selectedLearner}
            backTo={backTo}
            onAddTextbook={(selectedId) => {
              setSuccessMessage('')
              setActiveForm({
                type: 'textbook',
                learner: learners.find((learner) => learner.id === selectedId),
              })
            }}
          />
        ) : selectedGrade ? (
          <>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Link
                to={view === 'grades' ? '/admin/grades' : '/admin/learners'}
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                &larr; Back to grades
              </Link>
              <div className="w-full sm:max-w-sm">
                <label
                  htmlFor="learner-name-search"
                  className="mb-1 block text-sm font-medium text-slate-300"
                >
                  Search learners by name
                </label>
                <input
                  id="learner-name-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Search names..."
                  className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#1a1d24] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            {gradeLearners.length === 0 ? (
              <p className="rounded-xl border border-slate-800 bg-[#1a1d24] p-6 text-slate-400">
                There are no learners in Grade {selectedGrade} yet.
              </p>
            ) : filteredLearners.length === 0 ? (
              <p className="rounded-xl border border-slate-800 bg-[#1a1d24] p-6 text-slate-400">
                No learners match “{searchTerm.trim()}” in Grade {selectedGrade}.
              </p>
            ) : (
              <LearnerList learners={filteredLearners} search={queryString} />
            )}
          </>
        ) : (
          <section aria-labelledby="grade-levels-heading">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Browse by class level</p>
                <h2 id="grade-levels-heading" className="mt-1 text-lg font-semibold text-white">Grade overview</h2>
              </div>
              <span className="text-xs text-slate-500">Grades 8–12</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {grades.map((grade) => {
                const gradeLearnerList = learners.filter((learner) => learner.grade === grade)
                const count = gradeLearnerList.length
                const learnersWithBooks = gradeLearnerList.filter((learner) =>
                  learner.textbooks.some((textbook) => !textbook.returned),
                ).length
                const allocationRate = count === 0 ? 0 : (learnersWithBooks / count) * 100
                const barWidth = allocationRate === 0 ? 0 : Math.max(8, allocationRate)
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => selectGrade(grade)}
                    className="admin-blue-shadow group relative min-h-52 overflow-hidden rounded-xl border border-slate-800 bg-[#1a1d24] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-[#20242d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111318]"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                    <span className="pointer-events-none absolute -right-2 -top-5 text-8xl font-black leading-none text-white/[0.035] transition group-hover:text-white/[0.07]">
                      {grade}
                    </span>
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Grade</span>
                        <svg aria-hidden="true" className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-300" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path d="M5 12h14m-6-6 6 6-6 6" />
                        </svg>
                      </div>
                      <p className="mt-2 text-4xl font-bold tracking-tight text-blue-300">{grade}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        <span className="font-semibold text-blue-300">{count}</span> {count === 1 ? 'learner' : 'learners'}
                      </p>
                      <div className="mt-auto pt-5">
                        <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                          <span><span className="font-semibold text-blue-300">{learnersWithBooks}</span> learners with books</span>
                          <span className="text-blue-300">{Math.round(allocationRate)}%</span>
                        </div>
                        <div
                          className="h-1.5 overflow-hidden rounded-full bg-slate-700/70"
                          role="progressbar"
                          aria-label={`Learners with books in Grade ${grade}`}
                          aria-valuenow={Math.round(allocationRate)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {activeForm?.type === 'textbook' && (
        <TextbookForm
          key={activeForm.learner?.id}
          learner={activeForm.learner}
          onSave={handleSaveTextbook}
          onCancel={() => setActiveForm(null)}
        />
      )}
    </main>
  )
}
