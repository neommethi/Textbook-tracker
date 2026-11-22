import { useCallback, useEffect, useState } from 'react'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import LearnerForm from '../components/LearnerForm'
import LearnerList from '../components/LearnerList'
import SummaryStrip from '../components/SummaryStrip'
import TextbookForm from '../components/TextbookForm'
import { apiFetch } from '../api'

async function fetchDashboardData() {
  const [learnerResult, allocationResult, summaryResult] =
    await Promise.all([
      apiFetch('/api/admin/learners'),
      apiFetch('/api/admin/allocations'),
      apiFetch('/api/admin/summary'),
    ])

  const allocationsByLearner = new Map()
  for (const allocation of allocationResult.allocations) {
    const textbook = allocation.textbook || {}
    const books = allocationsByLearner.get(allocation.learner_id) || []
    books.push({
      allocationId: allocation.id,
      textbookId: allocation.textbook_id,
      bookNumber: textbook.book_number,
      title: textbook.title,
      subject: textbook.subject,
      grade: textbook.grade,
      condition: textbook.condition,
      returned: allocation.returned_at !== null,
    })
    allocationsByLearner.set(allocation.learner_id, books)
  }

  return {
    learners: learnerResult.learners.map((learner) => ({
      ...learner,
      textbooks: allocationsByLearner.get(learner.id) || [],
    })),
    summary: summaryResult,
  }
}

// Load and manage learners and their textbook allocations through the admin API.
export default function AdminDashboard() {
  const [learners, setLearners] = useState([])
  const [summary, setSummary] = useState({
    learners: 0,
    textbooks: 0,
    outstanding: 0,
  })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeForm, setActiveForm] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [actionError, setActionError] = useState('')
  const [savingAction, setSavingAction] = useState(false)

  const applyDashboardData = useCallback(({ learners: nextLearners, summary: nextSummary }) => {
    setLearners(nextLearners)
    setSummary(nextSummary)
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
          book_number: values.bookNumber,
          title: values.title,
          subject: values.subject,
        },
      })
    } else {
      await apiFetch('/api/admin/allocations', {
        method: 'POST',
        body: {
          ...values,
          learner_id: activeForm.learner.id,
        },
      })
    }

    setActiveForm(null)
    if (activeForm.mode === 'add') setSuccessMessage('Textbook issued successfully.')
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
            body: { condition_returned: 'good' },
          },
        )
      }

      setPendingAction(null)
      setLoading(true)
      await loadDashboard()
    } catch (error) {
      setActionError(error.message || 'Could not complete the action.')
    } finally {
      setSavingAction(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              New learner accounts can sign up through the learner portal.
            </p>
          </div>
          <SummaryStrip
            totalLearners={summary.learners}
            totalTextbooks={summary.textbooks}
            totalOutstanding={summary.outstanding}
          />
        </header>

        {successMessage && (
          <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status">
            {successMessage}
          </p>
        )}

        {loading ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            Loading admin data...
          </p>
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
        ) : (
          <LearnerList
            learners={learners}
            onEditLearner={(learner) => setActiveForm({ type: 'learner', learner })}
            onDeleteLearner={(learner) => {
              setActionError('')
              setPendingAction({
                type: 'learner',
                learnerId: learner.id,
                itemDescription: `${learner.name} (Grade ${learner.grade})`,
              })
            }}
            onAddTextbook={(learnerId) =>
              {
                setSuccessMessage('')
                setActiveForm({
                  type: 'textbook',
                  mode: 'add',
                  learner: learners.find((learner) => learner.id === learnerId),
                })
              }
            }
            onEditTextbook={(learnerId, textbook) =>
              setActiveForm({
                type: 'textbook',
                mode: 'edit',
                learnerId,
                textbook,
              })
            }
            onReturnTextbook={(textbook) => {
              setActionError('')
              setPendingAction({
                type: 'textbook',
                allocationId: textbook.allocationId,
                itemDescription: `book ${textbook.bookNumber} (${textbook.subject})`,
              })
            }}
          />
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
