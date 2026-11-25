import { useState } from 'react'
import { Link } from 'react-router-dom'
import LearnerManagementModal from '../components/LearnerManagementModal'
import TextbookRow from '../components/TextbookRow'

export default function LearnerDetailPage({
  learner,
  backTo = '/admin/learners',
  onEditLearner,
  onDeleteLearner,
  onAddTextbook,
  onEditTextbook,
  onReturnTextbook,
}) {
  const [configureOpen, setConfigureOpen] = useState(false)

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={backTo}
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            &larr; Back to learners
          </Link>
          <h1 className="mt-3 truncate text-2xl font-bold text-slate-900">
            {learner.name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Grade {learner.grade}
            {learner.class ? ` · Class ${learner.class}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfigureOpen(true)}
          className="min-h-11 shrink-0 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Configure
        </button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Books</h2>
        {learner.textbooks.length > 0 ? (
          <ul className="mt-3">
            {learner.textbooks.map((textbook) => (
              <TextbookRow key={textbook.allocationId} textbook={textbook} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            No books assigned yet.
          </p>
        )}
      </section>

      {configureOpen && (
        <LearnerManagementModal
          learner={learner}
          onClose={() => setConfigureOpen(false)}
          onEditLearner={() => onEditLearner(learner)}
          onDeleteLearner={() => onDeleteLearner(learner)}
          onAddTextbook={() => onAddTextbook(learner.id)}
          onEditTextbook={(learnerId, textbook) =>
            onEditTextbook(learnerId, textbook)
          }
          onReturnTextbook={onReturnTextbook}
        />
      )}
    </section>
  )
}
