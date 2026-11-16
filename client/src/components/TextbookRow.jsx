// Show one textbook and whether it has been returned.
export default function TextbookRow({ textbook }) {
  const statusStyles = textbook.returned
    ? 'bg-blue-100 text-blue-800'
    : 'bg-yellow-100 text-yellow-800'

  return (
    <li className="flex items-center justify-between gap-3 border-t border-slate-100 py-3">
      <div className="min-w-0">
        <span className="mr-2 font-mono text-xs text-slate-500">
          {textbook.bookNumber}
        </span>
        <span className="break-words text-sm text-slate-700">
          {textbook.subject}
        </span>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles}`}
      >
        {textbook.returned ? 'Returned' : 'Outstanding'}
      </span>
    </li>
  )
}
