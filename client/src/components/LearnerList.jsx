import LearnerCard from './LearnerCard'

// Render learner cards and pass their management actions through.
export default function LearnerList({
  learners,
  onAddLearner,
  onEditLearner,
  onDeleteLearner,
  onAddTextbook,
  onEditTextbook,
  onDeleteTextbook,
}) {
  if (learners.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-600">There are no learners in the roster yet.</p>
        <button
          className="mt-4 min-h-11 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
          onClick={onAddLearner}
          type="button"
        >
          Add learner
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {learners.map((learner) => (
        <LearnerCard
          key={learner.id}
          learner={learner}
          onEditLearner={() => onEditLearner(learner)}
          onDeleteLearner={() => onDeleteLearner(learner)}
          onAddTextbook={() => onAddTextbook(learner.id)}
          onEditTextbook={onEditTextbook}
          onDeleteTextbook={onDeleteTextbook}
        />
      ))}
    </div>
  )
}
