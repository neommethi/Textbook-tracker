import { useState } from 'react'
import LearnerList from '../components/LearnerList'
import { learners as initialLearners } from '../data/learners'

// Keep the dashboard's learner data in page state and display the roster.
export default function AdminDashboard() {
  const [learners] = useState(initialLearners)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Textbook tracking
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Learner textbook return status
          </p>
        </header>
        <LearnerList learners={learners} />
      </div>
    </main>
  )
}