// Displays the total number of books calculated from learner data.
export default function SummaryStrip({
  totalLearners,
  totalTextbooks,
  totalOutstanding,
}) {
  const summaries = [
    { label: "Learners", value: totalLearners },
    { label: "Textbooks", value: totalTextbooks },
    { label: "Outstanding", value: totalOutstanding },
  ];

  return (
    <dl className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:min-w-[24rem] sm:p-4">
      {summaries.map(({ label, value }) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-medium text-black sm:text-sm">{label}</dt>
          <dd
            className={`mt-1 text-xl font-semibold sm:text-2xl ${
              label === "Outstanding"
                ? "text-red-600"
                : label === "Textbooks"
                  ? "text-blue-600"
                  : "text-slate-900"
            }`}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
