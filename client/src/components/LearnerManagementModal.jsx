import TextbookRow from './TextbookRow'

// Keep learner and allocation management actions together.
export default function LearnerManagementModal({
  learner,
  onClose,
  onEditLearner,
  onDeleteLearner,
  onAddTextbook,
  onEditTextbook,
  onReturnTextbook,
}) {
  function runAndClose(action) {
    action()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <section
        aria-labelledby="learner-management-title"
        aria-modal="true"
        className="my-auto max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="learner-management-title"
              className="text-xl font-semibold text-slate-900"
            >
              Manage {learner.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Grade {learner.grade}
            </p>
          </div>
          <button
            aria-label="Close edit menu"
            className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => runAndClose(onEditLearner)}
            type="button"
          >
            Edit learner details
          </button>
          <button
            className="min-h-11 rounded-lg border border-red-200 px-4 py-2 font-medium text-red-700 hover:bg-red-50"
            onClick={() => runAndClose(onDeleteLearner)}
            type="button"
          >
            Delete learner
          </button>
          <button
            className="min-h-11 rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
            onClick={() => runAndClose(onAddTextbook)}
            type="button"
          >
            Add textbook
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-base font-semibold text-slate-900">
            Textbooks
          </h3>
          {learner.textbooks.length > 0 ? (
            <ul className="mt-2">
              {learner.textbooks.map((textbook) => (
                <TextbookRow
                  key={textbook.allocationId}
                  textbook={textbook}
                  showActions
                  onEdit={() =>
                    runAndClose(() => onEditTextbook(learner.id, textbook))
                  }
                  onReturn={() =>
                    runAndClose(() => onReturnTextbook(textbook))
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No textbooks assigned yet.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
