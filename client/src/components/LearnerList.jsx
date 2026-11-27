import LearnerCard from './LearnerCard'

// Render learner cards and pass their management actions through.
export default function LearnerList({
  learners,
  search,
}) {
  if (learners.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-[#1a1d24] p-8 text-center">
        <p className="text-slate-400">There are no learners in the roster yet.</p>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}
    >
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
