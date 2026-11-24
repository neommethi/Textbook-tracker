// Show an allocation's number and textbook details with its management actions.
export default function TextbookRow({
  textbook,
  showActions = false,
  onEdit,
  onReturn,
}) {
  const statusStyles = textbook.returned
    ? 'bg-blue-100 text-blue-800'
    : 'bg-red-100 text-red-800'

  return (
    <li className="flex flex-col gap-3 border-t border-slate-100 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-mono text-xs text-slate-500">
          Allocation {textbook.allocationNumber}
        </p>
        <p className="truncate text-sm font-medium text-slate-800">
          {textbook.title}
        </p>
        <p className="truncate text-sm text-slate-600">
          {textbook.subject}
        </p>
        <p className="truncate text-sm text-slate-600">
          Grade {textbook.grade}
        </p>
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
            {!textbook.returned && (
              <button
                className="min-h-9 rounded-md border border-blue-200 px-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
                onClick={onReturn}
                type="button"
              >
                Return
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
