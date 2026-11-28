import { useEffect, useState } from 'react'
import { apiFetch } from '../api'
import FullScreenLoading from './FullScreenLoading'

// Load the full textbook list once; allocations do not make catalog entries unavailable.
export default function TextbookForm({
  learner,
  textbook,
  onSave,
  onCancel,
}) {
  const [selectedTextbookId, setSelectedTextbookId] = useState('')
  const [title, setTitle] = useState(textbook?.title ?? '')
  const [subject, setSubject] = useState(textbook?.subject ?? '')
  const [grade, setGrade] = useState(textbook?.grade?.toString() ?? '')
  const [subjects, setSubjects] = useState([])
  const [books, setBooks] = useState([])
  const [showOtherGrades, setShowOtherGrades] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!textbook)
  const [saving, setSaving] = useState(false)
  const [initialError, setInitialError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const learnerGrade = learner?.grade == null ? null : Number(learner.grade)
  const hasGrade = Number.isInteger(learnerGrade) && learnerGrade >= 8 && learnerGrade <= 12
  const matchingBooks = books.filter(
    (book) =>
      book.subject === subject &&
      (!hasGrade || showOtherGrades || book.grade === learnerGrade),
  )

  useEffect(() => {
    if (textbook) return undefined

    let active = true
    Promise.all([
      apiFetch('/api/admin/subjects'),
      apiFetch('/api/admin/textbooks'),
    ])
      .then(([subjectResult, textbookResult]) => {
        if (!active) return
        setSubjects(subjectResult.subjects)
        setBooks(textbookResult.textbooks)
      })
      .catch((error) => {
        if (active) setInitialError(error.message || 'Could not load subjects and textbooks.')
      })
      .finally(() => {
        if (active) setInitialLoading(false)
      })

    return () => {
      active = false
    }
  }, [textbook])

  function handleSubjectChange(event) {
    setSubject(event.target.value)
    setSelectedTextbookId('')
    setSubmitError('')
  }

  function handleOtherGradesChange(event) {
    setShowOtherGrades(event.target.checked)
    setSubmitError('')
  }

  function handleBookChange(event) {
    setSelectedTextbookId(event.target.value)
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (textbook) {
      if (!title.trim() || !subject.trim() || !/^(8|9|10|11|12)$/.test(grade)) {
        setSubmitError('Enter a title, subject and grade from 8 to 12.')
        return
      }

      setSaving(true)
      try {
        await onSave({
          title: title.trim(),
          subject: subject.trim(),
          grade: Number(grade),
        })
      } catch (error) {
        setSubmitError(error.message || 'Could not save textbook.')
      } finally {
        setSaving(false)
      }
      return
    }

    const selectedBook = matchingBooks.find(
      (book) => book.id === selectedTextbookId,
    )
    if (!selectedBook) {
      setSubmitError('Choose a textbook.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        textbook_id: selectedBook.id,
      })
    } catch (error) {
      setSubmitError(error.message || 'Could not allocate textbook.')
    } finally {
      setSaving(false)
    }
  }

  const loadError = initialError
  const selectedBook = matchingBooks.find(
    (book) => book.id === selectedTextbookId,
  )

  return (
    <>
      <FullScreenLoading visible={initialLoading} label="Loading textbooks..." />
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <section
        aria-labelledby="textbook-form-title"
        aria-modal="true"
        className="admin-blue-shadow my-auto w-full max-w-md rounded-xl border border-slate-700 bg-[#1a1d24] p-5 text-white sm:p-6"
        role="dialog"
      >
        <h2 id="textbook-form-title" className="text-xl font-semibold text-white">
          {textbook ? 'Edit textbook' : 'Add textbook to learner'}
        </h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {textbook ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="textbook-title">
                  Title
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 py-2 text-base text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  id="textbook-title"
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  type="text"
                  value={title}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="textbook-subject">
                  Subject
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 py-2 text-base text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  id="textbook-subject"
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  type="text"
                  value={subject}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="textbook-grade">
                  Grade
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 py-2 text-base text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  id="textbook-grade"
                  max="12"
                  min="8"
                  onChange={(event) => setGrade(event.target.value)}
                  required
                  type="number"
                  value={grade}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="learner-name">
                  Learner
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#20232b] px-3 py-2 text-base text-slate-300"
                  id="learner-name"
                  readOnly
                  value={learner.name}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="textbook-subject">
                  Subject
                </label>
                <select
                  className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 py-2 text-base text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-[#20232b]"
                  disabled={initialLoading || Boolean(initialError) || saving}
                  id="textbook-subject"
                  onChange={handleSubjectChange}
                  value={subject}
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              {hasGrade && (
                <label className="flex min-h-11 items-center gap-3 text-sm text-slate-300">
                  <input
                    checked={showOtherGrades}
                    className="h-5 w-5 rounded border-slate-600 bg-[#111318] text-blue-500 focus:ring-blue-500"
                    disabled={initialLoading || Boolean(initialError) || saving}
                    onChange={handleOtherGradesChange}
                    type="checkbox"
                  />
                  Show other grades
                </label>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="textbook-select">
                  Textbook
                </label>
                <select
                  className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 py-2 text-base text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-[#20232b]"
                  disabled={!subject || initialLoading || Boolean(loadError) || saving}
                  id="textbook-select"
                  onChange={handleBookChange}
                  value={selectedTextbookId}
                >
                  <option value="">Choose a book</option>
                  {matchingBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} (Grade {book.grade})
                    </option>
                  ))}
                </select>
                {subject && !initialLoading && !loadError && matchingBooks.length === 0 && (
                  <p className="mt-2 text-sm text-slate-400">
                    No textbooks found for this subject.
                  </p>
                )}
              </div>
              {selectedBook && (
                <p className="text-sm text-slate-400">
                  Selected textbook: {selectedBook.title}, Grade {selectedBook.grade}.
                </p>
              )}
            </>
          )}

          {loadError && (
            <p className="text-sm text-red-300" role="alert">
              {loadError}
            </p>
          )}
          {submitError && (
            <p className="text-sm text-red-300" role="alert">
              {submitError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-white/5"
              disabled={saving}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                saving ||
                (!textbook && (initialLoading || !selectedBook || Boolean(loadError)))
              }
              type="submit"
            >
              {saving ? 'Saving...' : textbook ? 'Save textbook' : 'Allocate textbook'}
            </button>
          </div>
        </form>
      </section>
      </div>
    </>
  )
}
