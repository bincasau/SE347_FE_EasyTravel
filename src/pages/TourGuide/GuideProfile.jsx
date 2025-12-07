

export default function GuideProfile() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* TITLE — đưa lên sát top, bỏ nút Back */}
      <h1 className="text-3xl font-bold text-center text-orange-500 mb-12">
        Guide’s Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* LEFT FORM */}
        <div className="md:col-span-2 space-y-5">

          {/* NAME ROW */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block font-medium mb-1">First Name</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                defaultValue="Mehrab"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Last Name</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                defaultValue="Bozorgi"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              defaultValue="mehrabbozorgi.business@gmail.com"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block font-medium mb-1">Address</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              defaultValue="33062 Zboncak isle"
            />
          </div>

          {/* CONTACT NUMBER */}
          <div>
            <label className="block font-medium mb-1">Contact Number</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              defaultValue="58077.79"
            />
          </div>

          {/* CITY + STATE */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block font-medium mb-1">City</label>
              <select className="w-full border rounded-lg px-3 py-2">
                <option>Mehrab</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">State</label>
              <select className="w-full border rounded-lg px-3 py-2">
                <option>Bozorgi</option>
              </select>
            </div>
          </div>

          {/* TOUR PORTFOLIO */}
          <div>
            <label className="block font-medium mb-1">Tour Portfolio</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              defaultValue="sbdfbnd65sfdvb s"
            />
          </div>

        </div>

        {/* RIGHT: AVATAR + RATING */}
        <div className="flex flex-col items-center">
          <img
            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
            alt="Guide"
            className="w-60 h-72 object-cover rounded-lg shadow-md"
          />

          {/* RATING */}
          <div className="flex items-center gap-2 mt-4 text-yellow-500 text-xl">
            <span className="text-gray-700 text-2xl font-semibold">4.9</span>
            <span>★★★★★</span>
          </div>
        </div>

      </div>
    </div>
  );
}
