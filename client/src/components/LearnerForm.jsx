import { useState } from 'react'

// Collect learner details and, when adding, optional textbook assignments.
export default function LearnerForm({
  learner,
  availableSubjects,
  isBookNumberTaken,
  onSave,
  onCancel,
}) {
  const [firstName, setFirstName] = useState(learner?.firstName ?? '')
  const [lastName, setLastName] = useState(learner?.lastName ?? '')
  const [grade, setGrade] = useState(String(learner?.grade ?? 8))
  const [textbooks, setTextbooks] = useState(
    learner ? [] : [{ rowId: 1, bookNumber: '', subject: '' }],
  )
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const numericGrade = Number(grade)

    if (!trimmedFirstName || !trimmedLastName) {
      setError('Enter both a first name and a last name.')
      return
    }

    if (!Number.isInteger(numericGrade) || numericGrade < 8 || numericGrade > 12) {
      setError('Grade must be between 8 and 12.')
      return
    }

    const newTextbooks = textbooks.map(({ bookNumber, subject }) => ({
      bookNumber: bookNumber.trim(),
      subject,
      returned: false,
    }))
    const enteredBookNumbers = newTextbooks.map(({ bookNumber }) =>
      bookNumber.toLowerCase(),
    )

    if (
      newTextbooks.some(({ bookNumber, subject }) => !bookNumber || !subject)
    ) {
      setError('Complete the book number and subject for each textbook.')
      return
    }

    if (
      enteredBookNumbers.some(
        (bookNumber, index) =>
          enteredBookNumbers.indexOf(bookNumber) !== index ||
          isBookNumberTaken(bookNumber),
      )
    ) {
      setError('Each book number must be unique across all learners.')
      return
    }

    onSave({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      grade: numericGrade,
      ...(!learner && { textbooks: newTextbooks }),
    })
  }

  function updateTextbook(rowId, field, value) {
    setTextbooks((currentTextbooks) =>
      currentTextbooks.map((textbook) =>
        textbook.rowId === rowId ? { ...textbook, [field]: value } : textbook,
      ),
    )
  }

  function addTextbookRow() {
    setTextbooks((currentTextbooks) => [
      ...currentTextbooks,
      {
        rowId:
          currentTextbooks.reduce(
            (highestId, textbook) => Math.max(highestId, textbook.rowId),
            0,
          ) + 1,
        bookNumber: '',
        subject: '',
      },
    ])
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
          {learner ? 'Edit learner' : 'Add learner'}
        </h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="learner-first-name">
              First name
            </label>
            <input
              autoComplete="given-name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              id="learner-first-name"
              onChange={(event) => setFirstName(event.target.value)}
              required
              type="text"
              value={firstName}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="learner-last-name">
              Last name
            </label>
            <input
              autoComplete="family-name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              id="learner-last-name"
              onChange={(event) => setLastName(event.target.value)}
              required
              type="text"
              value={lastName}
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
          {!learner && (
            <section className="space-y-3 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">Textbooks</h3>
                <button
                  className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={addTextbookRow}
                  type="button"
                >
                  Add textbook
                </button>
              </div>
              {textbooks.map((textbook, index) => (
                <div
                  key={textbook.rowId}
                  className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2"
                >
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-slate-700"
                      htmlFor={`new-textbook-number-${textbook.rowId}`}
                    >
                      Book number
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      id={`new-textbook-number-${textbook.rowId}`}
                      onChange={(event) =>
                        updateTextbook(
                          textbook.rowId,
                          'bookNumber',
                          event.target.value,
                        )
                      }
                      placeholder="Enter book number"
                      type="text"
                      value={textbook.bookNumber}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-slate-700"
                      htmlFor={`new-textbook-subject-${textbook.rowId}`}
                    >
                      Subject
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      id={`new-textbook-subject-${textbook.rowId}`}
                      onChange={(event) =>
                        updateTextbook(
                          textbook.rowId,
                          'subject',
                          event.target.value,
                        )
                      }
                      value={textbook.subject}
                    >
                      <option value="">Select a subject</option>
                      {availableSubjects.map((subjectOption) => (
                        <option key={subjectOption} value={subjectOption}>
                          {subjectOption}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="min-h-9 justify-self-start text-sm font-medium text-red-700 hover:text-red-800 sm:col-span-2"
                    onClick={() =>
                      setTextbooks((currentTextbooks) =>
                        currentTextbooks.filter(
                          (item) => item.rowId !== textbook.rowId,
                        ),
                      )
                    }
                    type="button"
                  >
                    Remove textbook {index + 1}
                  </button>
                </div>
              ))}
            </section>
          )}
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
              Save learner
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
