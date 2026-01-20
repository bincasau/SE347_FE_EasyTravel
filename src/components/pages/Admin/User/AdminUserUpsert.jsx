import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminCreateUser, adminUpdateUser, getUserById } from "@/apis/User";

const S3_USER_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/user";

function normalizeDate(d) {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  return "";
}

function buildEmptyForm() {
  return {
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    dob: "",
    gender: "M",
    role: "CUSTOMER",
    status: "Activated",
    password: "",
    avatar: "user_default.jpg",
  };
}

function genderLabel(v) {
  if (v === "M") return "Nam";
  if (v === "F") return "Nữ";
  return "Khác";
}

export default function AdminUserUpsert() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState(buildEmptyForm());

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [currentAvatar, setCurrentAvatar] = useState("");

  // tạo preview + revoke để không leak
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const avatarSrc = useMemo(() => {
    if (preview) return preview;
    const v = currentAvatar || form.avatar;
    if (!v) return "";
    return v.startsWith("http") ? v : `${S3_USER_BASE}/${v}`;
  }, [preview, currentAvatar, form.avatar]);

  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await getUserById(id);
        if (!mounted) return;

        setForm((prev) => ({
          ...prev,
          name: data?.name ?? "",
          username: data?.username ?? "",
          email: data?.email ?? "",
          phoneNumber: data?.phoneNumber ?? "",
          address: data?.address ?? "",
          dob: normalizeDate(data?.dob),
          gender: data?.gender ?? "M",
          role: data?.role ?? "CUSTOMER",
          status: data?.status ?? "Activated",
          password: "",
          avatar: data?.avatar ?? "user_default.jpg",
        }));

        setCurrentAvatar(data?.avatar ?? "");
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Không thể tải thông tin người dùng");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function onPickFile(e) {
    const f = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng file
    setFile(f || null);
  }

  function clearPickedFile() {
    setFile(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      setSaving(true);

      const payload = {
        ...form,
        dob: form.dob || null,
      };

      if (!payload.avatar) payload.avatar = "user_default.jpg";
      if (file?.name) payload.avatar = file.name;

      if (isEdit) {
        if (!payload.password) delete payload.password;
        await adminUpdateUser(id, payload, file);
      } else {
        if (!payload.password) throw new Error("Vui lòng nhập mật khẩu");
        await adminCreateUser(payload, file);
      }

      navigate("/admin/users");
    } catch (e2) {
      setErr(e2?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className=" mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">
            {isEdit ? "Cập nhật người dùng" : "Thêm người dùng"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? `User ID: ${id}` : "Tạo user mới và gán quyền truy cập"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-md p-4 sm:p-6"
      >
        {err ? (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
            {err}
          </div>
        ) : null}

        {loading ? (
          <div className="p-6 text-gray-600 flex items-center gap-3">
            <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            Đang tải...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-5">
              <Section title="Thông tin cơ bản">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Họ và tên">
                    <input
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      className="w-full input"
                      required
                      placeholder="Nhập họ và tên"
                    />
                  </Field>

                  <Field label="Tên đăng nhập">
                    <input
                      value={form.username}
                      onChange={(e) => setField("username", e.target.value)}
                      className="w-full input disabled:bg-gray-50 disabled:text-gray-500"
                      required
                      disabled={isEdit}
                      placeholder="Nhập tên đăng nhập"
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Thông tin liên hệ">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className="w-full input"
                      required
                      placeholder="example@gmail.com"
                    />
                  </Field>

                  <Field label="Số điện thoại">
                    <input
                      value={form.phoneNumber}
                      onChange={(e) => setField("phoneNumber", e.target.value)}
                      className="w-full input"
                      placeholder="Nhập số điện thoại"
                    />
                  </Field>
                </div>

                <Field label="Địa chỉ">
                  <input
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className="w-full input"
                    placeholder="Nhập địa chỉ"
                  />
                </Field>
              </Section>

              <Section title="Thông tin cá nhân">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Ngày sinh">
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setField("dob", e.target.value)}
                      className="w-full input"
                    />
                  </Field>

                  <Field label="Giới tính">
                    <select
                      value={form.gender}
                      onChange={(e) => setField("gender", e.target.value)}
                      className="w-full input"
                    >
                      <option value="M">{genderLabel("M")}</option>
                      <option value="F">{genderLabel("F")}</option>
                      <option value="O">{genderLabel("O")}</option>
                    </select>
                  </Field>
                </div>
              </Section>

              <Section title="Phân quyền & trạng thái">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Vai trò">
                    <select
                      value={form.role}
                      onChange={(e) => setField("role", e.target.value)}
                      className="w-full input"
                    >
                      <option value="CUSTOMER">Khách hàng</option>
                      <option value="TOUR_GUIDE">Hướng dẫn viên</option>
                      <option value="HOTEL_MANAGER">Quản lý khách sạn</option>
                      <option value="ADMIN">Quản trị viên</option>
                    </select>
                  </Field>

                  <Field label="Trạng thái">
                    <select
                      value={form.status}
                      onChange={(e) => setField("status", e.target.value)}
                      className="w-full input"
                    >
                      <option value="Activated">Đang hoạt động</option>
                      <option value="Not activated">Không hoạt động</option>
                    </select>
                  </Field>
                </div>
              </Section>

              <Section title="Bảo mật">
                <Field
                  label={isEdit ? "Mật khẩu mới (không bắt buộc)" : "Mật khẩu"}
                >
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    className="w-full input"
                    placeholder={
                      isEdit
                        ? "Để trống nếu không đổi mật khẩu"
                        : "Nhập mật khẩu"
                    }
                    required={!isEdit}
                  />
                </Field>
              </Section>
            </div>

            {/* Right: Avatar + submit (sticky desktop) */}
            <div className="space-y-4 lg:sticky lg:top-6 h-fit">
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-sm font-medium">Ảnh đại diện</div>
                  {avatarSrc ? (
                    <a
                      href={avatarSrc}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
                    >
                      Open
                    </a>
                  ) : null}
                </div>

                <div className="w-full aspect-square rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `${S3_USER_BASE}/user_default.jpg`;
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 text-sm">Chưa có ảnh</div>
                  )}
                </div>

                {/* File input đẹp hơn */}
                <div className="mt-3 space-y-2">
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-sm">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
                    <span className="truncate">
                      {file ? file.name : "Chọn ảnh mới..."}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPickFile}
                      className="hidden"
                    />
                  </label>

                  {file ? (
                    <button
                      type="button"
                      onClick={clearPickedFile}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"
                    >
                      Bỏ ảnh đã chọn
                    </button>
                  ) : null}

                  {file ? (
                    <div className="text-xs text-gray-500">
                      Preview đang hiển thị ảnh mới. Bấm{" "}
                      {isEdit ? "Cập nhật" : "Tạo mới"} để lưu.
                    </div>
                  ) : null}
                </div>
              </div>

              <button
                disabled={saving}
                className="w-full px-4 py-3 rounded-2xl bg-black text-white hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                    Đang lưu...
                  </>
                ) : isEdit ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </form>

      <style>{`
        .input{
          border:1px solid rgb(229 231 235);
          border-radius: 0.75rem;
          padding: 0.65rem 0.8rem;
          outline: none;
          background: white;
        }
        .input:focus{
          border-color: rgb(156 163 175);
          box-shadow: 0 0 0 3px rgba(156,163,175,0.2);
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm text-gray-700 mb-1">{label}</div>
      {children}
    </label>
  );
}
