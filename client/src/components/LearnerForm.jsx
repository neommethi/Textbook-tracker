import { useState } from 'react'

// Edit learner details supported by the admin API.
export default function LearnerForm({ learner, onSave, onCancel }) {
  const [name, setName] = useState(learner.name ?? '')
  const [grade, setGrade] = useState(String(learner?.grade ?? 8))
  const [learnerClass, setLearnerClass] = useState(learner.class ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    const numericGrade = Number(grade)

    if (!trimmedName) {
      setError('Enter the learner name.')
      return
    }

    if (!Number.isInteger(numericGrade) || numericGrade < 8 || numericGrade > 12) {
      setError('Grade must be between 8 and 12.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await onSave({
        name: trimmedName,
        grade: numericGrade,
        class: learnerClass.trim() || null,
      })
    } catch (saveError) {
      setError(saveError.message || 'Could not save learner.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <section
        aria-labelledby="learner-form-title"
        aria-modal="true"
        className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-8"
        role="dialog"
      >
        <h2 id="learner-form-title" className="text-xl font-semibold text-slate-900">
          Edit learner
        </h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="learner-name">
              Name
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              id="learner-name"
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="learner-grade">
              Grade
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              id="learner-grade"
              onChange={(event) => setGrade(event.target.value)}
              value={grade}
            >
              {[8, 9, 10, 11, 12].map((gradeOption) => (
                <option key={gradeOption} value={gradeOption}>
                  Grade {gradeOption}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="learner-class">
              Class
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              id="learner-class"
              onChange={(event) => setLearnerClass(event.target.value)}
              type="text"
              value={learnerClass}
            />
          </div>
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
              onClick={onCancel}
              type="button"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save learner'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
