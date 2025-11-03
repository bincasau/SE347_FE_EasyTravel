import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    gender: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your full name.";
    if (!form.address.trim()) e.address = "Please enter your address.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email.";
    if (!form.gender) e.gender = "Select your gender.";
    if (!/^[a-zA-Z0-9._-]{4,}$/.test(form.username))
      e.username = "Username must be 4+ chars (letters/numbers/_ . -).";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    console.log("SIGNUP PAYLOAD:", form);
    // TODO: call your API here
    // fetch('/api/auth/register', {method:'POST', body: JSON.stringify(form)})
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header area (breadcrumb / title) */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Create Account
          </h1>
          <p className="mt-2 text-gray-600">
            Please fill in your information below.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter your name"
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-amber-400"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-amber-400"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Address (full width on md: span 2) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Street, ward, district, city"
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.address
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-amber-400"
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Gender */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={onChange}
                className={`w-full rounded-xl border px-4 py-2.5 bg-white focus:outline-none focus:ring-2 ${
                  errors.gender
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-amber-400"
                }`}
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
              )}
            </div>

            {/* Username */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="username"
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.username
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-amber-400"
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Password (full width on md: span 2) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="At least 6 characters"
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-amber-400"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-6 py-3 hover:brightness-105 active:brightness-95 shadow"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
