import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccountDetail } from "@/apis/AccountAPI";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getAccountDetail();

        setUser({
          avatar: data.avatar
            ? `/images/Users/${data.avatar}`
            : "/images/Users/default-avatar.png",
          username: data.username,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          gender: data.gender,
          birth: data.birth,
        });
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [navigate]);

  if (loading)
    return (
      <div className="text-center py-20 text-lg text-gray-500">
        Loading profile...
      </div>
    );

  if (!user)
    return (
      <div className="text-center py-20 text-lg text-gray-500">
        Failed to load profile
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
        Your Profile
      </h1>

      <div className="bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-6 mb-10">
          <img
            src={user.avatar}
            className="w-24 h-24 rounded-full border object-cover"
          />
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">@{user.username}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Info label="Full Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.phone || "—"} />
          <Info label="Address" value={user.address || "—"} />
          <Info
            label="Gender"
            value={
              user.gender === "M"
                ? "Male"
                : user.gender === "F"
                ? "Female"
                : "—"
            }
          />
          <Info label="Date of Birth" value={user.birth || "—"} />
        </div>

        <div className="text-center mt-10">
          <button className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-400">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}
