// Confirm exactly which learner or textbook will be removed.
export default function ConfirmDeleteModal({
  itemType,
  itemDescription,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <section
        aria-labelledby="delete-modal-title"
        aria-modal="true"
        className="my-auto w-full max-w-md rounded-xl bg-white p-5 shadow-xl sm:p-6"
        role="alertdialog"
      >
        <h2 id="delete-modal-title" className="text-xl font-semibold text-slate-900">
          Delete {itemType}?
        </h2>
        <p className="mt-3 break-words text-sm text-slate-600">
          {itemType === 'learner'
            ? `This will delete ${itemDescription} and all of their textbooks.`
            : `This will delete ${itemDescription}.`}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-11 rounded-lg bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800"
            onClick={onConfirm}
            type="button"
          >
            Delete {itemType}
          </button>
        </div>
      </section>
    </div>
  )
}
