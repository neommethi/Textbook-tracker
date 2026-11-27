// Show an allocation's number and textbook details with its management actions.
export default function TextbookRow({ textbook }) {
  const statusStyles = 'bg-blue-400/10 text-blue-300'

  return (
    <li className="flex flex-col gap-3 border-t border-slate-700 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-mono text-xs text-slate-500">
          Allocation <span className="text-blue-300">{textbook.allocationNumber}</span>
        </p>
        <p className="truncate text-sm font-medium text-slate-200">
          {textbook.title}
        </p>
        <p className="truncate text-sm text-slate-400">
          {textbook.subject}
        </p>
        <p className="truncate text-sm text-blue-300">
          Grade {textbook.grade}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles}`}
        >
          {textbook.returned ? 'Returned' : 'Outstanding'}
        </span>
      </div>
    </li>
  )
}
