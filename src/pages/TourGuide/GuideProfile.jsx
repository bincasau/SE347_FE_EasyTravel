import { useState } from "react";

export default function GuideProfile() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-center text-orange-500 mb-12">
        Guide’s Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* LEFT FORM */}
        <div className="md:col-span-2 space-y-5">

          <div className="grid grid-cols-2 gap-5">
            <Input label="First Name" value="Mehrab" disabled={!isEditing} />
            <Input label="Last Name" value="Bozorgi" disabled={!isEditing} />
          </div>

          <Input
            label="Email"
            value="mehrabbozorgi.business@gmail.com"
            disabled
          />

          <Input
            label="Address"
            value="33062 Zboncak isle"
            disabled={!isEditing}
          />

          <Input
            label="Contact Number"
            value="58077.79"
            disabled={!isEditing}
          />

          <div className="grid grid-cols-2 gap-5">
            <Select label="City" disabled={!isEditing} />
            <Select label="State" disabled={!isEditing} />
          </div>

          <Input
            label="Tour Portfolio"
            value="sbdfbnd65sfdvb s"
            disabled={!isEditing}
          />
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-center">

          {/* AVATAR */}
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
              alt="Guide"
              className="w-64 h-96 object-cover rounded-xl shadow-lg"
            />

            {isEditing && (
              <button className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-lg text-sm hover:bg-black">
                Change photo
              </button>
            )}
          </div>

          {/* RATING */}
          <div className="mt-6 text-center">
            <div className="text-4xl font-bold text-gray-800">4.9</div>
            <div className="text-yellow-500 text-3xl mt-1">
              ★★★★★
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Based on 128 reviews
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-14 flex justify-center gap-4">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-8 py-3 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            Change
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-8 py-3 rounded-full border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              className="px-8 py-3 rounded-full bg-orange-500 text-white hover:bg-orange-400 shadow"
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function Input({ label, value, disabled }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        defaultValue={value}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2
          ${disabled ? "bg-gray-100 text-gray-600" : "bg-white"}
        `}
      />
    </div>
  );
}

function Select({ label, disabled }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <select
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2
          ${disabled ? "bg-gray-100 text-gray-600" : "bg-white"}
        `}
      >
        <option>Mehrab</option>
      </select>
    </div>
  );
}
