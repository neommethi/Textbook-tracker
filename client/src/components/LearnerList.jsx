import LearnerCard from './LearnerCard'

// Render learner cards and pass their management actions through.
export default function LearnerList({
  learners,
  search,
}) {
  if (learners.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-600">There are no learners in the roster yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {learners.map((learner) => (
        <LearnerCard
          key={learner.id}
          learner={learner}
          search={search}
        />
      ))}
    </div>
  )
}
