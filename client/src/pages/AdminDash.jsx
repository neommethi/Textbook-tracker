import { useCallback, useEffect, useState } from 'react'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import LearnerForm from '../components/LearnerForm'
import LearnerList from '../components/LearnerList'
import TextbookForm from '../components/TextbookForm'
import { apiFetch } from '../api'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-sm text-slate-600" role="status">
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"
        />
        Fetching {title.toLowerCase()}...
      </div>
      <div
        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-hidden="true"
      >
        {[0, 1, 2].map((card) => (
          <div
            key={card}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
            </div>
            {[0, 1].map((row) => (
              <div key={row} className="border-t border-slate-100 py-3">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
            <div className="mt-3 h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Load and manage learners and their textbook allocations through the admin API.
export default function AdminDashboard({ view = 'learners' }) {
  const { learnerId } = useParams()
  const navigate = useNavigate()
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
  const [pendingAction, setPendingAction] = useState(null)
  const [actionError, setActionError] = useState('')
  const [savingAction, setSavingAction] = useState(false)

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

  async function handleSaveLearner(values) {
    await apiFetch(`/api/admin/learners/${encodeURIComponent(activeForm.learner.id)}`, {
      method: 'PUT',
      body: values,
    })
    setActiveForm(null)
    setLoading(true)
    await loadDashboard()
  }

  async function handleSaveTextbook(values) {
    if (activeForm.mode === 'edit') {
      await apiFetch(`/api/admin/textbooks/${encodeURIComponent(activeForm.textbook.textbookId)}`, {
        method: 'PUT',
        body: {
          title: values.title,
          subject: values.subject,
          grade: values.grade,
        },
      })
    } else {
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
    }

    setActiveForm(null)
    setLoading(true)
    await loadDashboard()
  }

  async function handleConfirmAction() {
    setActionError('')
    setSavingAction(true)

    try {
      if (pendingAction.type === 'learner') {
        await apiFetch(`/api/admin/learners/${encodeURIComponent(pendingAction.learnerId)}`, {
          method: 'DELETE',
        })
      } else {
        await apiFetch(
          `/api/admin/allocations/${encodeURIComponent(pendingAction.allocationId)}/return`,
          {
            method: 'PUT',
          },
        )
      }

      setPendingAction(null)
      if (pendingAction.type === 'learner') {
        navigate(backTo)
      }
      setLoading(true)
      await loadDashboard()
    } catch (error) {
      setActionError(error.message || 'Could not complete the action.')
    } finally {
      setSavingAction(false)
    }
  }

  const selectedLearner = learners.find((learner) => learner.id === learnerId)
  const gradeLearners = selectedGrade
    ? learners.filter((learner) => learner.grade === selectedGrade)
    : []
  const filteredLearners = gradeLearners.filter((learner) =>
    learner.name.toLocaleLowerCase().includes(searchTerm.trim().toLocaleLowerCase()),
  )

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
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {!learnerId && (
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedGrade ? `Grade ${selectedGrade} learners` : pageTitle}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {selectedGrade
                  ? `Showing learners in Grade ${selectedGrade}.`
                  : view === 'grades'
                    ? 'Choose a grade to view its learners.'
                    : 'Choose a grade to browse and manage its learners.'}
              </p>
            </div>
          </header>
        )}

        {successMessage && (
          <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status">
            {successMessage}
          </p>
        )}

        {loading ? (
          <LearnerLoadingState title={pageTitle} />
        ) : loadError ? (
          <div className="rounded-xl border border-red-200 bg-white p-6" role="alert">
            <p className="text-sm text-red-700">{loadError}</p>
            <button
              className="mt-3 min-h-10 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
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
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-slate-700">Learner not found.</p>
            <Link
              to={backTo}
              className="mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Back to learners
            </Link>
          </div>
        ) : learnerId ? (
          <LearnerDetailPage
            learner={selectedLearner}
            backTo={backTo}
            onEditLearner={(learner) =>
              setActiveForm({ type: 'learner', learner })
            }
            onDeleteLearner={(learner) => {
              setActionError('')
              setPendingAction({
                type: 'learner',
                learnerId: learner.id,
                itemDescription: `${learner.name} (Grade ${learner.grade})`,
              })
            }}
            onAddTextbook={(selectedId) => {
              setSuccessMessage('')
              setActiveForm({
                type: 'textbook',
                mode: 'add',
                learner: learners.find((learner) => learner.id === selectedId),
              })
            }}
            onEditTextbook={(selectedId, textbook) =>
              setActiveForm({
                type: 'textbook',
                mode: 'edit',
                learner: learners.find((learner) => learner.id === selectedId),
                textbook,
              })
            }
            onReturnTextbook={(textbook) => {
              setActionError('')
              setPendingAction({
                type: 'textbook',
                allocationId: textbook.allocationId,
                itemDescription: `allocation ${textbook.allocationNumber} (${textbook.subject})`,
              })
            }}
          />
        ) : selectedGrade ? (
          <>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Link
                to={view === 'grades' ? '/admin/grades' : '/admin/learners'}
                className="text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                &larr; Back to grades
              </Link>
              <div className="w-full sm:max-w-sm">
                <label
                  htmlFor="learner-name-search"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Search learners by name
                </label>
                <input
                  id="learner-name-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Search names..."
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            {gradeLearners.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
                There are no learners in Grade {selectedGrade} yet.
              </p>
            ) : filteredLearners.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
                No learners match “{searchTerm.trim()}” in Grade {selectedGrade}.
              </p>
            ) : (
              <LearnerList learners={filteredLearners} search={queryString} />
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grades.map((grade) => {
              const count = learners.filter((learner) => learner.grade === grade).length
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => selectGrade(grade)}
                  className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold text-slate-900">Grade {grade}</h2>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                      {count} {count === 1 ? 'learner' : 'learners'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {count === 0
                      ? 'There are no learners in this grade yet.'
                      : 'View and manage learners'}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {activeForm?.type === 'learner' && (
        <LearnerForm
          key={activeForm.learner.id}
          learner={activeForm.learner}
          onSave={handleSaveLearner}
          onCancel={() => setActiveForm(null)}
        />
      )}
      {activeForm?.type === 'textbook' && (
        <TextbookForm
          key={`${activeForm.mode}-${activeForm.textbook?.allocationId ?? activeForm.learner?.id}`}
          learner={activeForm.learner}
          textbook={activeForm.textbook}
          onSave={handleSaveTextbook}
          onCancel={() => setActiveForm(null)}
        />
      )}
      {pendingAction && (
        <ConfirmDeleteModal
          itemType={pendingAction.type === 'learner' ? 'learner' : 'book'}
          itemDescription={pendingAction.itemDescription}
          action={pendingAction.type === 'learner' ? 'delete' : 'return'}
          error={actionError}
          loading={savingAction}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </main>
  )
}
