import { useParams } from "react-router-dom";


// Fake data – bạn sẽ thay bằng API backend
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
        { time: "15:00", title: "Sky Tower Visit", duration: "1 hour" }
      ]
    },
    {
      day: 2,
      location: "Christchurch",
      steps: [
        { time: "10:00", title: "Old Town", duration: "1 hour" },
        { time: "11:00", title: "Adventure Park", duration: "1 hour" },
        { time: "12:00", title: "Botanic Gardens", duration: "2 hours" },
        { time: "14:00", title: "Gondola Ride", duration: "30 min" }
      ]
    }
  ]
};

export default function TourScheduleDetail() {
  const { tourId } = useParams();
  // Tạm thời dùng fake data
  const tour = fakeTour;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* BACK */}
      <button
        onClick={() => window.history.back()}
        className="text-gray-500 hover:text-gray-700 mb-5"
      >
        ← Back
      </button>

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-orange-500 mb-8">
        {tour.title}
      </h1>

      {/* DAYS */}
      <div className="space-y-10">
        {tour.days.map((day) => (
          <div
            key={day.day}
            className="p-6 rounded-xl shadow border bg-white"
          >
            {/* Header Day */}
            <h2 className="text-2xl font-semibold mb-4">
              Day {day.day} — {day.location}
            </h2>

            {/* Timeline */}
            <div className="relative ml-4">
              {/* Vertical line */}
              <div className="absolute top-0 left-3 w-[3px] bg-orange-300 h-full rounded"></div>

              {/* Steps */}
              <div className="space-y-6">
                {day.steps.map((step, index) => (
                  <div key={index} className="relative pl-10">
                    {/* Dot */}
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-orange-500 border-4 border-orange-200"></div>

                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">
                        {step.time}
                      </span>
                      <span className="text-lg font-medium">
                        {step.title}
                      </span>
                      <span className="text-gray-500 text-sm">
                        Duration: {step.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
          </div>
        ))}
      </div>
    </div>
  );
}
