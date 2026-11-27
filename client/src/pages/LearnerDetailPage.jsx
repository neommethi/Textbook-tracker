import { Link } from 'react-router-dom'
import TextbookRow from '../components/TextbookRow'

export default function LearnerDetailPage({
  learner,
  backTo = '/admin/learners',
  onAddTextbook,
}) {
  return (
    <section className="mx-auto w-full">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={backTo}
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            &larr; Back to learners
          </Link>
          <h1 className="mt-3 truncate text-2xl font-bold text-white">
            {learner.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Grade <span className="font-medium text-blue-300">{learner.grade}</span>
            {learner.class ? ` · Class ${learner.class}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAddTextbook(learner.id)}
          className="min-h-11 shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Add textbook
        </button>
      </div>

      <section className="admin-blue-shadow rounded-xl border border-slate-800 bg-[#1a1d24] p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Books</h2>
        {learner.textbooks.length > 0 ? (
          <ul className="mt-3">
            {learner.textbooks.map((textbook) => (
              <TextbookRow key={textbook.allocationId} textbook={textbook} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-lg bg-[#20232b] p-4 text-sm text-slate-400">
            No books assigned yet.
          </p>
        )}
      </section>

    </section>
  )
}
