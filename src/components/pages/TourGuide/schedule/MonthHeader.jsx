import { format } from "date-fns";

export default function MonthHeader({ month, onNext, onPrev, canGoPrev }) {
  return (
    <div className="mb-6 sm:mb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left (Prev) */}
        <div className="flex justify-center sm:justify-start">
          {canGoPrev ? (
            <button
              onClick={onPrev}
              className="inline-flex items-center justify-center
                         px-3 sm:px-4 py-2 rounded-full sm:rounded-lg
                         bg-orange-500 text-white hover:bg-orange-400
                         text-sm sm:text-base"
            >
              ← <span className="ml-1">Previous</span>
            </button>
          ) : (
            // giữ chỗ để title luôn cân giữa trên desktop
            <div className="hidden sm:block w-[130px]" />
          )}
        </div>

        {/* Center (Title) */}
        <h1 className="text-center text-xl sm:text-3xl font-bold text-orange-500 leading-tight">
          {format(month, "MMMM yyyy")}
        </h1>

        {/* Right (Next) */}
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={onNext}
            className="inline-flex items-center justify-center
                       px-3 sm:px-4 py-2 rounded-full sm:rounded-lg
                       bg-orange-500 text-white hover:bg-orange-400
                       text-sm sm:text-base"
          >
            <span className="mr-1">Next</span> →
          </button>
        </div>
      </div>
    </div>
  );
}
