// Confirm exactly which learner or textbook will be removed.
export default function ConfirmDeleteModal({
  itemType,
  itemDescription,
  onConfirm,
  onCancel,
  action = 'delete',
  error,
  loading = false,
}) {
  const isReturn = action === 'return'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <section
        aria-labelledby="delete-modal-title"
        aria-modal="true"
        className="admin-blue-shadow my-auto w-full max-w-md rounded-xl border border-slate-700 bg-[#1a1d24] p-5 text-white sm:p-6"
        role="alertdialog"
      >
        <h2 id="delete-modal-title" className="text-xl font-semibold text-white">
          {isReturn ? 'Return book?' : `Delete ${itemType}?`}
        </h2>
        <p className="mt-3 break-words text-sm text-slate-300">
          {isReturn
            ? `This will record ${itemDescription} as returned and preserve its allocation history.`
            : itemType === 'learner'
              ? `This will delete ${itemDescription}. Learners with allocation history cannot be deleted.`
              : `This will delete ${itemDescription}.`}
        </p>
        {error && (
          <p className="mt-3 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-white/5"
            onClick={onCancel}
            type="button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`min-h-11 rounded-lg px-4 py-2 font-medium text-white ${
              isReturn ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-700 hover:bg-red-600'
            }`}
            onClick={onConfirm}
            type="button"
            disabled={loading}
          >
            {loading ? 'Saving...' : isReturn ? 'Return book' : `Delete ${itemType}`}
          </button>
        </div>
      </section>
    </div>
  )
}
