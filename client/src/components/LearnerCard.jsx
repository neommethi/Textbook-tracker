import TextbookRow from './TextbookRow'

// Show a learner's name, grade, and assigned textbooks.
export default function LearnerCard({ learner }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          {learner.firstName} {learner.lastName}
        </h2>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          Grade {learner.grade}
        </span>
      </div>
      <ul>
        {learner.textbooks.map((textbook) => (
          <TextbookRow key={textbook.bookNumber} textbook={textbook} />
        ))}
      </ul>
    </article>
  )
}
