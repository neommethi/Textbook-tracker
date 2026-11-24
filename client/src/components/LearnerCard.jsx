import { Link } from 'react-router-dom'

// Keep roster cards a consistent size; full allocation details live on the learner page.
export default function LearnerCard({ learner }) {
  const previewBooks = learner.textbooks.slice(0, 2)

  return (
    <Link
      to={`/admin/learners/${encodeURIComponent(learner.id)}`}
      className="block h-72 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      aria-label={`View ${learner.name}'s books`}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 truncate text-lg font-semibold text-slate-900">
            {learner.name}
          </h2>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            Grade {learner.grade}
          </span>
        </div>

        <ul className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden">
          {previewBooks.length > 0 ? (
            previewBooks.map((textbook) => (
              <li
                key={textbook.allocationId}
                className="overflow-hidden border-t border-slate-100 pt-2"
              >
                <p className="truncate font-mono text-xs text-slate-500">
                  Allocation {textbook.allocationNumber}
                </p>
                <p className="truncate text-sm font-medium text-slate-800">
                  {textbook.title}
                </p>
                <p className="truncate text-sm text-slate-600">
                  {textbook.subject}
                </p>
              </li>
            ))
          ) : (
            <li className="border-t border-slate-100 pt-3 text-sm text-slate-500">
              No books assigned yet.
            </li>
          )}
        </ul>

        {learner.textbooks.length > previewBooks.length && (
          <p className="mt-2 shrink-0 truncate text-xs font-medium text-blue-700">
            +{learner.textbooks.length - previewBooks.length} more books
          </p>
        )}
      </article>
    </Link>
  )
}
