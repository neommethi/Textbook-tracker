import { Link } from 'react-router-dom'

// Keep roster cards a consistent size; full allocation details live on the learner page.
export default function LearnerCard({ learner, search = '' }) {
  const previewBooks = learner.textbooks.slice(0, 2)
  const detailPath = `/admin/learners/${encodeURIComponent(learner.id)}${search ? `?${search}` : ''}`

  return (
    <Link
      to={detailPath}
      className="block h-72 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111318]"
      aria-label={`View ${learner.name}'s books`}
    >
      <article className="admin-blue-shadow flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#1a1d24] p-4 transition-colors hover:border-blue-500/50 hover:bg-[#20242d] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 truncate text-lg font-semibold text-white">
            {learner.name}
          </h2>
          <span className="shrink-0 rounded-full bg-blue-400/10 px-3 py-1 text-sm font-medium text-blue-300">
            Grade {learner.grade}
          </span>
        </div>

        <ul className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden">
          {previewBooks.length > 0 ? (
            previewBooks.map((textbook) => (
              <li
                key={textbook.allocationId}
                className="overflow-hidden border-t border-slate-700 pt-2"
              >
                <p className="truncate font-mono text-xs text-slate-500">
                  Allocation {textbook.allocationNumber}
                </p>
                <p className="truncate text-sm font-medium text-slate-200">
                  {textbook.title}
                </p>
                <p className="truncate text-sm text-slate-400">
                  {textbook.subject}
                </p>
              </li>
            ))
          ) : (
            <li className="border-t border-slate-700 pt-3 text-sm text-slate-500">
              No books assigned yet.
            </li>
          )}
        </ul>

        {learner.textbooks.length > previewBooks.length && (
          <p className="mt-2 shrink-0 truncate text-xs font-medium text-blue-300">
            +{learner.textbooks.length - previewBooks.length} more books
          </p>
        )}
      </article>
    </Link>
  )
}
