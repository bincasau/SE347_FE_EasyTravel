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

function todayYMD() {
  return new Date().toISOString().slice(0, 10);
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

  const avatarSrc = useMemo(() => {
    if (preview) return preview;
    const v = currentAvatar || form.avatar;
    if (!v) return "";
    return v.startsWith("http") ? v : `${S3_USER_BASE}/${v}`;
  }, [preview, currentAvatar, form.avatar]);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await getUserById(id);

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
        setErr(e?.message || "Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function onPickFile(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
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

      // nếu có chọn file thì set avatar theo tên file (để object có avatar như yêu cầu)
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
    <div className="max-w-5xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Cập nhật người dùng" : "Thêm người dùng"}
        </h1>

        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 rounded-xl border hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-md p-6">
        {err ? (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
            {err}
          </div>
        ) : null}

        {loading ? (
          <div className="p-6 text-gray-600">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      className="w-full input"
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

              {/* <Section title="Mã người dùng">
                <Field label="Code">
                  <input
                    value={form.code}
                    onChange={(e) => setField("code", e.target.value)}
                    className="w-full input"
                    placeholder="VD: AD001"
                  />
                </Field>
              </Section> */}
            </div>

            <div className="space-y-4">
              <div className="border rounded-2xl p-4">
                <div className="text-sm font-medium mb-2">Ảnh đại diện</div>

                <div className="w-full aspect-square rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-sm">Chưa có ảnh</div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                  className="mt-3 w-full text-sm"
                />
              </div>

              <button
                disabled={saving}
                className="w-full px-4 py-3 rounded-2xl bg-black text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
              </button>

              
            </div>
          </div>
        )}
      </form>

      <style>{`
        .input{
          border:1px solid rgb(229 231 235);
          border-radius: 0.75rem;
          padding: 0.6rem 0.75rem;
          outline: none;
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
