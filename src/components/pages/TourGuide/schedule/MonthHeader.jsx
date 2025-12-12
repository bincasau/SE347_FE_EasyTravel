import { format } from "date-fns";

export default function MonthHeader({
  month,
  onNext,
  onPrev,
  canGoPrev,
}) {
  return (
    <div className="flex items-center justify-between mb-10">
      <div>
        {canGoPrev && (
          <button
            onClick={onPrev}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-400"
          >
            ← Previous
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold text-orange-500">
        {format(month, "MMMM yyyy")}
      </h1>

      <button
        onClick={onNext}
        className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-400"
      >
        Next →
      </button>
    </div>
  );
}
