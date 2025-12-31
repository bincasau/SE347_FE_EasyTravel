import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

// Fake data – demo only
const fakeTour = {
  id: 1,
  title: "New Zealand Discovery Tour",
  days: [
    {
      day: 1,
      location: "Auckland",
      steps: [
        { time: "09:00", title: "Meet the group", duration: "1 hour" },
        { time: "11:00", title: "City Walk", duration: "2 hours" },
        { time: "15:00", title: "Sky Tower Visit", duration: "1 hour" },
      ],
    },
    {
      day: 2,
      location: "Christchurch",
      steps: [
        { time: "10:00", title: "Old Town", duration: "1 hour" },
        { time: "11:00", title: "Adventure Park", duration: "1 hour" },
        { time: "12:00", title: "Botanic Gardens", duration: "2 hours" },
        { time: "14:00", title: "Gondola Ride", duration: "30 min" },
      ],
    },
  ],
};

export default function TourScheduleDetail() {
  const { tourId } = useParams();
  const tour = fakeTour;

  const [openDay, setOpenDay] = useState(1);

  // checkbox state: key = `${dayIndex}-${stepIndex}`
  const [doneMap, setDoneMap] = useState({});

  const totalTasks = useMemo(() => {
    return tour.days.reduce((sum, d) => sum + d.steps.length, 0);
  }, [tour.days]);

  const doneTasks = useMemo(() => {
    return Object.values(doneMap).filter(Boolean).length;
  }, [doneMap]);

  const toggleDone = (dayIdx, stepIdx) => {
    const key = `${dayIdx}-${stepIdx}`;
    setDoneMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const dayProgress = (dayIdx) => {
    const steps = tour.days[dayIdx].steps.length;
    let done = 0;
    for (let i = 0; i < steps; i++) {
      if (doneMap[`${dayIdx}-${i}`]) done++;
    }
    return { done, steps };
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-400 text-sm whitespace-nowrap"
        >
          ← Back
        </button>

        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold text-orange-500">{tour.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Progress: <span className="font-semibold">{doneTasks}</span> /{" "}
            <span className="font-semibold">{totalTasks}</span> tasks done
          </p>
        </div>

        <div className="w-[80px]" />
      </div>

      {/* DAYS - HORIZONTAL BARS */}
      <div className="space-y-4">
        {tour.days.map((day, dayIdx) => {
          const isOpen = openDay === day.day;
          const prog = dayProgress(dayIdx);
          const percent =
            prog.steps === 0 ? 0 : Math.round((prog.done / prog.steps) * 100);

          return (
            <div
              key={day.day}
              className="rounded-2xl border bg-white shadow-sm overflow-hidden"
            >
              {/* DAY BAR */}
              <button
                onClick={() => setOpenDay(isOpen ? null : day.day)}
                className="w-full px-5 py-4 text-left hover:bg-orange-50 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-bold">
                        D{day.day}
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">
                          Day {day.day} · {day.location}
                        </h2>
                        <p className="text-sm text-gray-500 truncate">
                          {prog.done}/{prog.steps} done · {percent}%
                        </p>
                      </div>
                    </div>

                    {/* progress bar */}
                    <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* chevron */}
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center text-orange-600 transition ${
                      isOpen ? "bg-orange-100 rotate-180" : "bg-white"
                    }`}
                    aria-hidden
                  >
                    ▾
                  </div>
                </div>
              </button>

              {/* CONTENT */}
              {isOpen && (
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {day.steps.map((step, stepIdx) => {
                      const key = `${dayIdx}-${stepIdx}`;
                      const checked = !!doneMap[key];

                      return (
                        <label
                          key={stepIdx}
                          className={`group cursor-pointer rounded-xl border p-4 shadow-sm hover:shadow transition flex gap-3 ${
                            checked
                              ? "bg-gray-50 border-gray-200"
                              : "bg-white hover:border-orange-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-5 w-5 accent-orange-500"
                            checked={checked}
                            onChange={() => toggleDone(dayIdx, stepIdx)}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p
                                className={`font-semibold ${
                                  checked
                                    ? "text-gray-500 line-through"
                                    : "text-gray-900"
                                }`}
                              >
                                {step.title}
                              </p>

                              <span
                                className={`shrink-0 text-xs px-2 py-1 rounded-full border ${
                                  checked
                                    ? "text-gray-500 border-gray-200 bg-white"
                                    : "text-orange-700 border-orange-200 bg-orange-50"
                                }`}
                              >
                                {step.time}
                              </span>
                            </div>

                            <p
                              className={`text-sm mt-1 ${
                                checked ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              ⏱ {step.duration}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* optional footer actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        // mark all in this day
                        const steps = tour.days[dayIdx].steps.length;
                        setDoneMap((prev) => {
                          const next = { ...prev };
                          for (let i = 0; i < steps; i++) next[`${dayIdx}-${i}`] = true;
                          return next;
                        });
                      }}
                      className="px-3 py-2 text-sm rounded-xl border hover:bg-gray-50"
                      type="button"
                    >
                      Mark all done
                    </button>

                    <button
                      onClick={() => {
                        // clear all in this day
                        const steps = tour.days[dayIdx].steps.length;
                        setDoneMap((prev) => {
                          const next = { ...prev };
                          for (let i = 0; i < steps; i++) delete next[`${dayIdx}-${i}`];
                          return next;
                        });
                      }}
                      className="px-3 py-2 text-sm rounded-xl border hover:bg-gray-50"
                      type="button"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
