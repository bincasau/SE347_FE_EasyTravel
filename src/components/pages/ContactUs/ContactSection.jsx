import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <section className="w-full">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="grid gap-10 md:grid-cols-2 items-stretch">
            {/* LEFT */}
            <div className="text-gray-800">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Get In Touch!
              </h2>
              <p className="mt-3 text-sm text-gray-700 max-w-md">
                Fill up the form and our Team will get <br /> back to you within
                24 hours.
              </p>

              <div className="mt-10 space-y-8">
                {/* LOCATION */}
                <div className="flex items-center gap-4 text-gray-800 transition-all duration-200 hover:text-orange-600 hover:scale-[1.03] cursor-pointer">
                  <i className="fa-solid fa-location-dot text-orange-500 text-xl"></i>
                  <span className="text-base font-medium">
                    Piazza Napoleone, Lucca, Tuscany
                  </span>
                </div>

                {/* PHONE BOX */}
                <div className="inline-flex">
                  <div className="flex items-center gap-4 text-gray-800 transition-all duration-200 hover:text-orange-600 hover:scale-[1.03] cursor-pointer">
                    <i className="fa-solid fa-phone text-orange-500 text-xl"></i>
                    <span className="text-base font-semibold">
                      +39 346 368 5708
                    </span>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-center gap-4 text-gray-800 transition-all duration-200 hover:text-orange-600 hover:scale-[1.03] cursor-pointer">
                  <i className="fa-solid fa-envelope text-orange-500 text-xl"></i>
                  <span className="text-base font-medium">
                    italianlimo@gmail.com
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="rounded-xl bg-white/80 p-5 sm:p-6 shadow-lg ring-1 ring-black/5 backdrop-blur">
              <form onSubmit={onSubmit} className="space-y-5">
                {/* NAME */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-800">
                    Name and Surname
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name and surname"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-800">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                {/* MESSAGE */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-800">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Enter your message"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                {/* SUBMIT */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-white font-semibold shadow-sm hover:bg-amber-600"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    Send message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
