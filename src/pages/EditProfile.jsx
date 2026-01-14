import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccountDetail, changePasswordApi } from "@/apis/AccountAPI";
import { updateMyProfileApi, deleteMineApi } from "@/apis/ProfileAPI";
import { logout } from "@/apis/AccountAPI";
import { popup } from "@/utils/popup";

const S3_USER_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/user";

/** ===== Password Rules =====
 * - >= 8 chars
 * - at least 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
function validatePassword(password) {
  if (!password || password.length < 8) {
    return "Mật khẩu mới phải có ít nhất 8 ký tự.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Mật khẩu mới phải chứa ít nhất 1 chữ hoa (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return "Mật khẩu mới phải chứa ít nhất 1 chữ thường (a-z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Mật khẩu mới phải chứa ít nhất 1 số (0-9).";
  }
  if (!/[!@#$%^&*(),.?\":{}|<>_\-+=/\\[\]~`;'@]/.test(password)) {
    return "Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: !@#$%^&*).";
  }
  return "";
}

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ thêm modal change password
  const [openChangePw, setOpenChangePw] = useState(false);

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

      await popup.success("Cập nhật profile thành công!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      popup.error(err?.message || "Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // ✅ popup confirm đẹp
    const ok = await popup.confirmDanger(
      "Bạn chắc chắn muốn xoá tài khoản? Hành động này không thể hoàn tác.",
      "Xoá tài khoản"
    );
    if (!ok) return;

    try {
      await deleteMineApi();
      logout();

      await popup.success("Đã xoá tài khoản.");
      navigate("/");
    } catch (err) {
      console.error(err);
      popup.error(err?.message || "Xoá tài khoản thất bại!");
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
              <div className="font-medium text-gray-900 mb-2">
                Change Avatar
              </div>
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

        {/* ✅ Security: Change password */}
        <div className="mt-10 pt-6 border-t">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-gray-900">Security</div>
              <div className="text-sm text-gray-500">
                Đổi mật khẩu tài khoản của bạn.
              </div>
            </div>

            <button
              onClick={() => setOpenChangePw(true)}
              className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 pt-6 border-t">
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

      {/* ✅ Modal Change Password */}
      {openChangePw && (
        <ChangePasswordModal onClose={() => setOpenChangePw(false)} />
      )}
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

function ChangePasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const pwdError = useMemo(() => validatePassword(newPassword), [newPassword]);

  const confirmError = useMemo(() => {
    if (!confirmPw) return "";
    if (newPassword !== confirmPw) return "Xác nhận mật khẩu không khớp!";
    return "";
  }, [newPassword, confirmPw]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (pwdError) return setErr(pwdError);
    if (newPassword !== confirmPw) return setErr("Xác nhận mật khẩu không khớp!");

    setLoading(true);
    try {
      await changePasswordApi({ oldPassword, newPassword });
      await popup.success("Đổi mật khẩu thành công!");
      onClose?.();
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
          type="button"
        >
          ✕
        </button>

        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Change Password
        </h3>

        {err && <p className="text-sm text-red-600 mb-3">{err}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CURRENT */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* NEW */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* CONFIRM */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-orange-400"
            />

            {confirmError && (
              <p className="text-xs text-red-600 mt-1">{confirmError}</p>
            )}
          </div>

          {/* ✅ RULES ĐƯA XUỐNG DƯỚI CONFIRM */}
          <div className="text-xs text-gray-500 space-y-1 mt-2">
            <p className="font-medium text-gray-600">Yêu cầu mật khẩu:</p>
            <ul className="list-disc ml-5">
              <li>Ít nhất 8 ký tự</li>
              <li>Có chữ hoa (A-Z)</li>
              <li>Có chữ thường (a-z)</li>
              <li>Có số (0-9)</li>
              <li>Có ký tự đặc biệt (ví dụ: !@#$%^&*)</li>
            </ul>

            {newPassword && pwdError && (
              <p className="text-red-600 mt-1">{pwdError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-60"
              disabled={loading || !!pwdError || !!confirmError}
            >
              {loading ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}