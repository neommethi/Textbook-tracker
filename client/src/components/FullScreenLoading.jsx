export default function FullScreenLoading({ label = 'Loading...', visible = true }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex h-screen items-center justify-center bg-[#111318] text-white transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-busy={visible}
      aria-hidden={!visible}
    >
      <div className="flex flex-col items-center gap-5" role="status" aria-live="polite">
        <span
          aria-hidden="true"
          className={`h-20 w-20 rounded-full border-[7px] border-blue-500/25 border-t-blue-400 ${
            visible ? 'animate-spin' : ''
          }`}
        />
        <span className="text-sm font-semibold text-slate-300">{label}</span>
      </div>
    </div>
  )
}
