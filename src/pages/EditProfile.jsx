import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccountDetail } from "@/apis/AccountAPI";
import { updateMyProfileApi, deleteMineApi } from "@/apis/ProfileAPI";
import { logout } from "@/apis/AccountAPI";

const S3_USER_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/user";

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ form dùng đúng field entity
  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    phoneNumber: "",
    address: "",
    gender: "", // "M" | "F" | ""
    dob: "", // "YYYY-MM-DD"
    avatar: "",
  });

  const [file, setFile] = useState(null);

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return form.avatar
      ? `${S3_USER_BASE}/${form.avatar}`
      : `${S3_USER_BASE}/user_default.jpg`;
  }, [file, form.avatar]);

  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAccountDetail();

        setForm({
          username: data.username || "",
          email: data.email || "",
          name: data.name || "",
          phoneNumber: data.phone || "", // ✅ phone -> phoneNumber
          address: data.address || "",
          gender: data.gender || "",
          dob: data.birth ? String(data.birth).slice(0, 10) : "", // ✅ birth -> dob
          avatar: data.avatar || "",
        });
      } catch (e) {
        console.error(e);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const onChange = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ payload gửi theo entity User (đúng tên field BE)
    const payloadUser = {
      username: form.username,
      email: form.email,
      name: form.name,
      phoneNumber: form.phoneNumber,
      address: form.address,
      gender: form.gender || null,
      dob: form.dob || null,
    };

    setSaving(true);
    try {
      await updateMyProfileApi({ user: payloadUser, file });
      alert("Cập nhật profile thành công!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert(`Update lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn chắc chắn muốn xoá tài khoản?")) return;
    try {
      await deleteMineApi();
      logout();
      alert("Đã xoá tài khoản.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(`Delete lỗi: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-lg text-gray-500">
        Loading edit profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
        Edit Profile
      </h1>

      <div className="bg-white rounded-2xl shadow p-8">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="flex items-center gap-6">
            <img
              src={previewUrl}
              className="w-24 h-24 rounded-full border object-cover"
              alt="avatar"
            />
            <div>
              <div className="font-medium text-gray-900 mb-2">Change Avatar</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Không chọn ảnh thì giữ avatar cũ.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Full Name">
              <input
                value={form.name}
                onChange={onChange("name")}
                className="w-full border rounded-xl px-4 py-2"
                required
              />
            </Field>

            <Field label="Phone Number">
              <input
                value={form.phoneNumber}
                onChange={onChange("phoneNumber")}
                className="w-full border rounded-xl px-4 py-2"
                placeholder="090..."
              />
            </Field>

            <Field label="Address">
              <input
                value={form.address}
                onChange={onChange("address")}
                className="w-full border rounded-xl px-4 py-2"
              />
            </Field>

            <Field label="Gender">
              <select
                value={form.gender}
                onChange={onChange("gender")}
                className="w-full border rounded-xl px-4 py-2 bg-white"
              >
                <option value="">—</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                value={form.dob}
                onChange={onChange("dob")}
                className="w-full border rounded-xl px-4 py-2"
              />
            </Field>

            <Field label="Email (read-only)">
              <input
                value={form.email}
                disabled
                className="w-full border rounded-xl px-4 py-2 bg-gray-50 text-gray-500"
              />
            </Field>

            <Field label="Username (read-only)">
              <input
                value={form.username}
                disabled
                className="w-full border rounded-xl px-4 py-2 bg-gray-50 text-gray-500"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 py-3 rounded-full border hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-gray-900">Danger Zone</div>
              <div className="text-sm text-gray-500">
                Xoá tài khoản sẽ mất dữ liệu liên quan (booking/payment).
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-full border border-red-400 text-red-500 hover:bg-red-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-500">{label}</div>
      {children}
    </div>
  );
}
