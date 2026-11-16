import LearnerCard from './LearnerCard'

// Render the learner cards in a responsive grid.
export default function LearnerList({ learners }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {learners.map((learner) => (
        <LearnerCard key={learner.id} learner={learner} />
      ))}
    </div>
  )
}
