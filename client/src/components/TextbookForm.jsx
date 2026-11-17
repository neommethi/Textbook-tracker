import { useState } from 'react'

// Collect textbook details and prevent duplicate book numbers.
export default function TextbookForm({
  textbook,
  availableSubjects,
  isBookNumberTaken,
  onSave,
  onCancel,
}) {
  const [bookNumber, setBookNumber] = useState(textbook?.bookNumber ?? '')
  const [subject, setSubject] = useState(textbook?.subject ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedBookNumber = bookNumber.trim()
    const trimmedSubject = subject.trim()

    if (!trimmedBookNumber || !trimmedSubject) {
      setError('Enter both a book number and a subject.')
      return
    }

    if (isBookNumberTaken(trimmedBookNumber)) {
      setError('That book number is already assigned to a learner.')
      return
    }

    const saved = onSave({
      bookNumber: trimmedBookNumber,
      subject: trimmedSubject,
    })

    if (saved === false) {
      setError('That book number is already assigned to a learner.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <section
        aria-labelledby="textbook-form-title"
        aria-modal="true"
        className="my-auto w-full max-w-md rounded-xl bg-white p-5 shadow-xl sm:p-6"
        role="dialog"
      >
        <h2 id="textbook-form-title" className="text-xl font-semibold text-slate-900">
          {textbook ? 'Edit textbook' : 'Add textbook'}
        </h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="textbook-book-number">
              Book number
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              id="textbook-book-number"
              onChange={(event) => setBookNumber(event.target.value)}
              required
              type="text"
              value={bookNumber}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="textbook-subject">
              Subject
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              id="textbook-subject"
              onChange={(event) => setSubject(event.target.value)}
              required
              value={subject}
            >
              <option value="">Select a subject</option>
              {availableSubjects.map((subjectOption) => (
                <option key={subjectOption} value={subjectOption}>
                  {subjectOption}
                </option>
              ))}
            </select>
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
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
              type="submit"
            >
              Save textbook
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
