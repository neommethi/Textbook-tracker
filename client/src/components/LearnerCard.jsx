import { useState } from 'react'
import LearnerManagementModal from './LearnerManagementModal'

// Show a learner summary and open their management screen.
export default function LearnerCard({
  learner,
  onEditLearner,
  onDeleteLearner,
  onAddTextbook,
  onEditTextbook,
  onReturnTextbook,
}) {
  const [managementOpen, setManagementOpen] = useState(false)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {learner.name}
          </h2>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            Grade {learner.grade}
          </span>
        </div>
      </div>
      <ul>
        {learner.textbooks.map((textbook) => (
          <li
            key={textbook.allocationId}
            className="flex items-center justify-between gap-3 border-t border-slate-100 py-3"
          >
            <div className="min-w-0">
              <span className="mr-2 font-mono text-xs text-slate-500">
                {textbook.bookNumber}
              </span>
              <span className="break-words text-sm text-slate-700">
                {textbook.subject}
              </span>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                textbook.returned
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {textbook.returned ? 'Returned' : 'Outstanding'}
            </span>
          </li>
        ))}
      </ul>
      <button
        aria-haspopup="dialog"
        className="mt-3 min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        onClick={() => setManagementOpen(true)}
        type="button"
      >
        Edit
      </button>
      {managementOpen && (
        <LearnerManagementModal
          learner={learner}
          onClose={() => setManagementOpen(false)}
          onEditLearner={onEditLearner}
          onDeleteLearner={onDeleteLearner}
          onAddTextbook={onAddTextbook}
          onEditTextbook={onEditTextbook}
          onReturnTextbook={onReturnTextbook}
        />
      )}
    </article>
  )
}
