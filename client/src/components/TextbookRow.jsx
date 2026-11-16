// Show textbook details and its available management actions.
export default function TextbookRow({
  textbook,
  showActions = false,
  onEdit,
  onDelete,
}) {
  const statusStyles = textbook.returned
    ? 'bg-blue-100 text-blue-800'
    : 'bg-red-100 text-red-800'

  return (
    <li className="flex flex-col gap-3 border-t border-slate-100 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <span className="mr-2 font-mono text-xs text-slate-500">
          {textbook.bookNumber}
        </span>
        <span className="break-words text-sm text-slate-700">
          {textbook.subject}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles}`}
        >
          {textbook.returned ? 'Returned' : 'Outstanding'}
        </span>
        {showActions && (
          <div className="flex gap-2">
            <button
              className="min-h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={onEdit}
              type="button"
            >
              Edit
            </button>
            <button
              className="min-h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
              onClick={onDelete}
              type="button"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  )
}
