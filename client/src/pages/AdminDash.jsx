import { useState } from 'react'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import LearnerForm from '../components/LearnerForm'
import LearnerList from '../components/LearnerList'
import SummaryStrip from '../components/SummaryStrip'
import TextbookForm from '../components/TextbookForm'
import { learners as initialLearners } from '../data/learners'

// Keep every subject available in the dropdown, even if its last book is removed.
const availableSubjects = [
  ...new Set(
    initialLearners.flatMap((learner) =>
      learner.textbooks.map((textbook) => textbook.subject),
    ),
  ),
].sort((first, second) => first.localeCompare(second))

// Keep dashboard data and all add, edit, and delete actions in one place.
export default function AdminDashboard() {
  const [learners, setLearners] = useState(initialLearners)
  const [activeForm, setActiveForm] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const totalTextbooks = learners.reduce(
    (total, learner) => total + learner.textbooks.length,
    0,
  )
  const totalOutstanding = learners.reduce(
    (total, learner) =>
      total + learner.textbooks.filter((textbook) => !textbook.returned).length,
    0,
  )
  function handleSaveLearner(values) {
    if (activeForm.mode === 'edit') {
      setLearners((currentLearners) =>
        currentLearners
          .map((learner) =>
            learner.id === activeForm.learner.id
              ? { ...learner, ...values }
              : learner,
          )
          .sort((first, second) => first.grade - second.grade),
      )
    } else {
      setLearners((currentLearners) =>
        [
          ...currentLearners,
          {
            id:
              currentLearners.reduce(
                (highestId, learner) => Math.max(highestId, learner.id),
                0,
              ) + 1,
            ...values,
            textbooks: values.textbooks ?? [],
          },
        ].sort((first, second) => first.grade - second.grade),
      )
    }
    setActiveForm(null)
  }

  function isBookNumberTaken(bookNumber) {
    const normalizedBookNumber = bookNumber.trim().toLowerCase()

    return learners.some((learner) =>
      learner.textbooks.some(
        (textbook) =>
          textbook.bookNumber.trim().toLowerCase() === normalizedBookNumber &&
          !(
            activeForm?.mode === 'edit' &&
            activeForm.learnerId === learner.id &&
            activeForm.textbook.bookNumber === textbook.bookNumber
          ),
      ),
    )
  }

  function handleSaveTextbook(values) {
    if (isBookNumberTaken(values.bookNumber)) {
      return false
    }

    if (activeForm.mode === 'edit') {
      setLearners((currentLearners) =>
        currentLearners.map((learner) =>
          learner.id === activeForm.learnerId
            ? {
                ...learner,
                textbooks: learner.textbooks.map((textbook) =>
                  textbook.bookNumber === activeForm.textbook.bookNumber
                    ? { ...textbook, ...values }
                    : textbook,
                ),
              }
            : learner,
        ),
      )
    } else {
      setLearners((currentLearners) =>
        currentLearners.map((learner) =>
          learner.id === activeForm.learnerId
            ? {
                ...learner,
                textbooks: [
                  ...learner.textbooks,
                  { ...values, returned: false },
                ],
              }
            : learner,
        ),
      )
    }
    setActiveForm(null)
    return true
  }

  function handleConfirmDelete() {
    if (pendingDelete.type === 'learner') {
      setLearners((currentLearners) =>
        currentLearners.filter(
          (learner) => learner.id !== pendingDelete.learnerId,
        ),
      )
    } else {
      setLearners((currentLearners) =>
        currentLearners.map((learner) =>
          learner.id === pendingDelete.learnerId
            ? {
                ...learner,
                textbooks: learner.textbooks.filter(
                  (textbook) =>
                    textbook.bookNumber !== pendingDelete.textbook.bookNumber,
                ),
              }
            : learner,
        ),
      )
    }
    setPendingDelete(null)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <button
            className="min-h-11 self-start rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
            onClick={() => setActiveForm({ type: 'learner', mode: 'add' })}
            type="button"
          >
            Add learner
          </button>
          <SummaryStrip
            totalLearners={learners.length}
            totalTextbooks={totalTextbooks}
            totalOutstanding={totalOutstanding}
          />
        </header>
        <LearnerList
          learners={learners}
          onAddLearner={() =>
            setActiveForm({ type: 'learner', mode: 'add' })
          }
          onEditLearner={(learner) =>
            setActiveForm({ type: 'learner', mode: 'edit', learner })
          }
          onDeleteLearner={(learner) =>
            setPendingDelete({
              type: 'learner',
              learnerId: learner.id,
              itemDescription: `${learner.firstName} ${learner.lastName} (Grade ${learner.grade})`,
            })
          }
          onAddTextbook={(learnerId) =>
            setActiveForm({ type: 'textbook', mode: 'add', learnerId })
          }
          onEditTextbook={(learnerId, textbook) =>
            setActiveForm({
              type: 'textbook',
              mode: 'edit',
              learnerId,
              textbook,
            })
          }
          onDeleteTextbook={(learnerId, textbook) =>
            setPendingDelete({
              type: 'textbook',
              learnerId,
              textbook,
              itemDescription: `book ${textbook.bookNumber} (${textbook.subject})`,
            })
          }
        />
      </div>
      {activeForm?.type === 'learner' && (
        <LearnerForm
          key={`${activeForm.mode}-${activeForm.learner?.id ?? 'new'}`}
          learner={activeForm.learner}
          availableSubjects={availableSubjects}
          isBookNumberTaken={isBookNumberTaken}
          onSave={handleSaveLearner}
          onCancel={() => setActiveForm(null)}
        />
      )}
      {activeForm?.type === 'textbook' && (
        <TextbookForm
          key={`${activeForm.mode}-${activeForm.textbook?.bookNumber ?? 'new'}`}
          textbook={activeForm.textbook}
          availableSubjects={availableSubjects}
          isBookNumberTaken={isBookNumberTaken}
          onSave={handleSaveTextbook}
          onCancel={() => setActiveForm(null)}
        />
      )}
      {pendingDelete && (
        <ConfirmDeleteModal
          itemType={pendingDelete.type}
          itemDescription={pendingDelete.itemDescription}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </main>
  )
}