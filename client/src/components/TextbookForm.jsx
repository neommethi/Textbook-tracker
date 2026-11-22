import { useEffect, useState } from 'react'
import { apiFetch } from '../api'

const conditions = ['new', 'good', 'fair', 'poor', 'damaged']

// Load subjects and available copies when the form opens.
export default function TextbookForm({
  learner,
  textbook,
  onSave,
  onCancel,
}) {
  const [bookNumber, setBookNumber] = useState(textbook?.bookNumber ?? '')
  const [title, setTitle] = useState(textbook?.title ?? '')
  const [subject, setSubject] = useState(textbook?.subject ?? '')
  const [subjects, setSubjects] = useState([])
  const [books, setBooks] = useState([])
  const [unavailableBookNumbers, setUnavailableBookNumbers] = useState(new Set())
  const [condition, setCondition] = useState('good')
  const [showOtherGrades, setShowOtherGrades] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!textbook)
  const [booksLoading, setBooksLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialError, setInitialError] = useState('')
  const [booksError, setBooksError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const learnerGrade = learner?.grade == null ? null : Number(learner.grade)
  const hasGrade = Number.isInteger(learnerGrade) && learnerGrade >= 8 && learnerGrade <= 12

  useEffect(() => {
    if (textbook) return undefined

    let active = true
    Promise.all([
      apiFetch('/api/admin/subjects'),
      apiFetch('/api/admin/allocations?outstanding=true'),
    ])
      .then(([subjectResult, allocationResult]) => {
        if (!active) return
        setSubjects(subjectResult.subjects)
        setUnavailableBookNumbers(
          new Set(
            allocationResult.allocations
              .map((allocation) => allocation.textbook?.book_number)
              .filter(Boolean),
          ),
        )
      })
      .catch((error) => {
        if (active) setInitialError(error.message || 'Could not load subjects and available books.')
      })
      .finally(() => {
        if (active) setInitialLoading(false)
      })

    return () => {
      active = false
    }
  }, [textbook])

  useEffect(() => {
    if (textbook || !subject || initialError) return undefined

    let active = true
    const query = new URLSearchParams({ subject })
    if (hasGrade && !showOtherGrades) {
      query.set('grade', learnerGrade)
    }

    apiFetch(`/api/admin/textbooks?${query}`)
      .then((result) => {
        if (!active) return
        const availableBooks = result.textbooks.filter(
          (book) => !unavailableBookNumbers.has(book.book_number),
        )
        setBooks(availableBooks)
        setBookNumber((currentBookNumber) =>
          availableBooks.some((book) => book.book_number === currentBookNumber)
            ? currentBookNumber
            : '',
        )
      })
      .catch((error) => {
        if (active) setBooksError(error.message || 'Could not load books.')
      })
      .finally(() => {
        if (active) setBooksLoading(false)
      })

    return () => {
      active = false
    }
  }, [
    hasGrade,
    initialError,
    learnerGrade,
    showOtherGrades,
    subject,
    textbook,
    unavailableBookNumbers,
  ])

  function handleSubjectChange(event) {
    setSubject(event.target.value)
    setBookNumber('')
    setBooks([])
    setBooksError('')
    setSubmitError('')
    setCondition('good')
    setBooksLoading(Boolean(event.target.value))
  }

  function handleOtherGradesChange(event) {
    setShowOtherGrades(event.target.checked)
    setBooksError('')
    setSubmitError('')
    setBooksLoading(true)
  }

  function handleBookChange(event) {
    const selectedBookNumber = event.target.value
    const selectedBook = books.find((book) => book.book_number === selectedBookNumber)
    setBookNumber(selectedBookNumber)
    setCondition(selectedBook?.condition || 'good')
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (textbook) {
      if (!bookNumber.trim() || !title.trim() || !subject.trim()) {
        setSubmitError('Enter a book number, title and subject.')
        return
      }

      setSaving(true)
      try {
        await onSave({
          bookNumber: bookNumber.trim(),
          title: title.trim(),
          subject: subject.trim(),
        })
      } catch (error) {
        setSubmitError(error.message || 'Could not save textbook.')
      } finally {
        setSaving(false)
      }
      return
    }

    const selectedBook = books.find((book) => book.book_number === bookNumber)
    if (!selectedBook) {
      setSubmitError('Choose an available book.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        book_number: selectedBook.book_number,
        condition_issued: condition,
      })
    } catch (error) {
      setSubmitError(error.message || 'Could not issue textbook.')
    } finally {
      setSaving(false)
    }
  }

  const loadError = initialError || booksError
  const selectedBook = books.find((book) => book.book_number === bookNumber)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <section
        aria-labelledby="textbook-form-title"
        aria-modal="true"
        className="my-auto w-full max-w-md rounded-xl bg-white p-5 shadow-xl sm:p-6"
        role="dialog"
      >
        <h2 id="textbook-form-title" className="text-xl font-semibold text-slate-900">
          {textbook ? 'Edit textbook' : 'Add textbook to learner'}
        </h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {textbook ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="textbook-book-number">
                  Book number
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="textbook-book-number"
                  onChange={(event) => setBookNumber(event.target.value)}
                  required
                  type="text"
                  value={bookNumber}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="textbook-title">
                  Title
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="textbook-title"
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  type="text"
                  value={title}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="textbook-subject">
                  Subject
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="textbook-subject"
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  type="text"
                  value={subject}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="learner-name">
                  Learner
                </label>
                <input
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-base text-slate-700"
                  id="learner-name"
                  readOnly
                  value={learner.name}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="textbook-subject">
                  Subject
                </label>
                <select
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
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
                <label className="flex min-h-11 items-center gap-3 text-sm text-slate-700">
                  <input
                    checked={showOtherGrades}
                    className="h-5 w-5 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    disabled={initialLoading || Boolean(initialError) || saving}
                    onChange={handleOtherGradesChange}
                    type="checkbox"
                  />
                  Show other grades
                </label>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="textbook-book">
                  Book
                </label>
                <select
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
                  disabled={!subject || initialLoading || booksLoading || Boolean(loadError) || saving}
                  id="textbook-book"
                  onChange={handleBookChange}
                  value={bookNumber}
                >
                  <option value="">
                    {booksLoading ? 'Loading books...' : 'Choose a book'}
                  </option>
                  {books.map((book) => (
                    <option key={book.id} value={book.book_number}>
                      {book.title} (No. {book.book_number})
                    </option>
                  ))}
                </select>
                {subject && !booksLoading && !loadError && books.length === 0 && (
                  <p className="mt-2 text-sm text-slate-600">
                    No copies available for this subject.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="condition-issued">
                  Condition issued
                </label>
                <select
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  disabled={saving}
                  id="condition-issued"
                  onChange={(event) => setCondition(event.target.value)}
                  value={condition}
                >
                  {conditions.map((value) => (
                    <option key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {selectedBook && (
                <p className="text-sm text-slate-600">
                  Selected copy condition: {selectedBook.condition}.
                </p>
              )}
            </>
          )}

          {loadError && (
            <p className="text-sm text-red-700" role="alert">
              {loadError}
            </p>
          )}
          {submitError && (
            <p className="text-sm text-red-700" role="alert">
              {submitError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
              disabled={saving}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                saving ||
                (!textbook && (initialLoading || booksLoading || !selectedBook || Boolean(loadError)))
              }
              type="submit"
            >
              {saving ? 'Saving...' : textbook ? 'Save textbook' : 'Issue textbook'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
