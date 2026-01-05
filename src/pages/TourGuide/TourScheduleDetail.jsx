import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "http://localhost:8080";

// (optional) nếu tour có mainImage và bạn muốn show đâu đó sau này
const S3_TOUR_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/tour";
const FALLBACK_IMAGE = `${S3_TOUR_BASE}/tour_default.jpg`;

export default function TourScheduleDetail() {
  const { tourId } = useParams();

  const [tour, setTour] = useState(null); // { tourId, title, ... }
  const [days, setDays] = useState([]); // [{ day, location, steps: [{title,time,duration}] }]
  const [openDay, setOpenDay] = useState(null);

  // checkbox state: key = `${dayIdx}-${stepIdx}`
  const [doneMap, setDoneMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // ✅ lấy token
  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  // ✅ fetch auto gửi JWT
  const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[FETCH ERROR]", url, res.status, text);
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    return res;
  };

  // ✅ helper: tách activities -> list task
  const splitActivitiesToSteps = (activities) => {
    const raw = (activities ?? "").toString().trim();
    if (!raw) return [];

    // tách theo dấu chấm, bỏ rỗng
    const lines = raw
      .split(".")
      .map((s) => s.trim())
      .filter(Boolean);

    // convert sang format step
    return lines.map((line) => ({
      time: "—",
      title: line,
      duration: "—",
    }));
  };

  // ✅ normalize itineraries response
  const extractItineraries = (data) => {
    const items =
      data?._embedded?.itineraries ||
      data?.itineraries ||
      (Array.isArray(data) ? data : []) ||
      [];
    return Array.isArray(items) ? items : [];
  };

  // ✅ sort itineraries theo day_number
  const sortByDay = (a, b) => (a.day_number ?? 0) - (b.day_number ?? 0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const idNum = Number(tourId);
        if (!idNum) throw new Error("tourId không hợp lệ");

        // 1) ✅ fetch upcoming -> find tour theo tourId
        const upRes = await fetchWithAuth(`${API_BASE}/tour_guide/upcoming`);
        const upData = await upRes.json();
        const upcomingList = Array.isArray(upData?.content) ? upData.content : [];

        const foundTour = upcomingList.find((t) => Number(t.tourId) === idNum);
        if (!foundTour) {
          throw new Error(
            `Không tìm thấy tourId=${idNum} trong upcoming. (Có thể tour không nằm trong upcoming)`
          );
        }

        // set tour basic
        const normalizedTour = {
          tourId: foundTour.tourId,
          title: foundTour.title,
          mainImage: foundTour.mainImage
            ? `${S3_TOUR_BASE}/${foundTour.mainImage}`
            : FALLBACK_IMAGE,
          startDate: foundTour.startDate,
          endDate: foundTour.endDate,
        };

        if (mounted) setTour(normalizedTour);

        // 2) ✅ fetch itineraries của tour đó
        const itRes = await fetchWithAuth(
          `${API_BASE}/tours/${idNum}/itineraries`
        );
        const itData = await itRes.json();
        const itineraries = extractItineraries(itData).sort(sortByDay);

        // build days array
        const builtDays = itineraries.map((it, idx) => {
          const dayNumber = it.day_number ?? idx + 1;
          const location = it.title?.trim() || `Day ${dayNumber}`;

          return {
            day: dayNumber,
            location,
            steps: splitActivitiesToSteps(it.activities),
          };
        });

        if (mounted) {
          setDays(builtDays);
          setOpenDay(builtDays?.[0]?.day ?? null);
        }
      } catch (e) {
        console.error("[TOUR SCHEDULE DETAIL ERROR]", e);
        if (mounted) {
          setTour(null);
          setDays([]);
          setErrMsg(e?.message || "Failed to load schedule detail");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tourId]);

  const totalTasks = useMemo(() => {
    return days.reduce((sum, d) => sum + (d.steps?.length || 0), 0);
  }, [days]);

  const doneTasks = useMemo(() => {
    return Object.values(doneMap).filter(Boolean).length;
  }, [doneMap]);

  const toggleDone = (dayIdx, stepIdx) => {
    const key = `${dayIdx}-${stepIdx}`;
    setDoneMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const dayProgress = (dayIdx) => {
    const steps = days[dayIdx]?.steps?.length || 0;
    let done = 0;
    for (let i = 0; i < steps; i++) {
      if (doneMap[`${dayIdx}-${i}`]) done++;
    }
    return { done, steps };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 text-center">
        <p className="text-red-500 font-semibold">{errMsg}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 rounded-full border hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (!tour) return null;

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

      {/* DAYS */}
      {days.length === 0 ? (
        <div className="text-center text-gray-500">
          Tour này chưa có lịch trình.
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day, dayIdx) => {
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
                  type="button"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
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
                    {day.steps.length === 0 ? (
                      <div className="text-gray-500 text-sm">
                        No activities.
                      </div>
                    ) : (
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
                    )}

                    {/* footer actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          const steps = day.steps.length;
                          setDoneMap((prev) => {
                            const next = { ...prev };
                            for (let i = 0; i < steps; i++) {
                              next[`${dayIdx}-${i}`] = true;
                            }
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
                          const steps = day.steps.length;
                          setDoneMap((prev) => {
                            const next = { ...prev };
                            for (let i = 0; i < steps; i++) {
                              delete next[`${dayIdx}-${i}`];
                            }
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
      )}
    </div>
  );
}
