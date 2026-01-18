import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addHotel } from "@/apis/Hotel";
import { getUsers } from "@/apis/User";

export default function AddHotel() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    description: "",
    minPrice: "",
  });

  // Lưu username để submit (backend nhận managerUsername)
  const [managerUsername, setManagerUsername] = useState("");
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // popup success
  const [openSuccess, setOpenSuccess] = useState(false);

  // Load danh sách user role HOTEL_MANAGER
  useEffect(() => {
    (async () => {
      try {
        setLoadingManagers(true);

        const data = await getUsers({
          page: 1,
          size: 9999,
          role: "HOTEL_MANAGER",
          status: "activated",
        });

        // Spring Data REST: _embedded.{resourceName}[]
        const embedded = data?._embedded;
        let list = [];
        if (embedded && typeof embedded === "object") {
          const firstKey = Object.keys(embedded)[0];
          list = embedded[firstKey] ?? [];
        }

        setManagers(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Load managers failed:", e);
        setManagers([]);
      } finally {
        setLoadingManagers(false);
      }
    })();
  }, []);

  // cleanup preview url
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onPickImage = (e) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);

    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const resetForm = () => {
    setForm({
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      description: "",
      minPrice: "",
    });
    setManagerUsername("");
    setImageFile(null);

    if (preview) URL.revokeObjectURL(preview);
    setPreview("");

    setMsg("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const hotelData = {
      name: form.name.trim(),
      address: form.address.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      description: form.description.trim(),
      minPrice: Number(form.minPrice || 0),
    };

    if (!hotelData.name || !hotelData.address) {
      setMsg("Vui lòng nhập Tên khách sạn và Địa chỉ.");
      return;
    }

    if (!managerUsername.trim()) {
      setMsg("Vui lòng chọn quản lý khách sạn.");
      return;
    }

    try {
      setLoading(true);

      // Gửi managerUsername đúng contract API
      await addHotel({
        hotelData,
        imageFile,
        managerUsername: managerUsername.trim(),
      });

      // mở popup thành công
      setOpenSuccess(true);
    } catch (err) {
      setMsg(err?.message || "Thêm khách sạn thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6">Thêm khách sạn</h1>

        {/* chỉ show msg khi lỗi/validation */}
        {msg && (
          <div className="mb-4 p-3 rounded-xl bg-gray-50 border text-sm break-words">
            {msg}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* LEFT */}
          <div className="space-y-4 min-w-0">
            <Field
              label="Tên khách sạn"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />

            <Field
              label="Địa chỉ"
              name="address"
              value={form.address}
              onChange={onChange}
              required
            />

            <Field
              label="Số điện thoại"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={onChange}
              inputMode="tel"
            />

            <Field
              label="Email"
              name="email"
              value={form.email}
              onChange={onChange}
              type="email"
            />

            <Field
              label="Giá thấp nhất"
              name="minPrice"
              value={form.minPrice}
              onChange={onChange}
              type="number"
              inputMode="numeric"
            />

            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={5}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            {/* Manager select: hiển thị ID - Name (username), submit username */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Quản lý khách sạn <span className="text-red-500">*</span>
              </label>

              <select
                value={managerUsername}
                onChange={(e) => setManagerUsername(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 bg-white"
                disabled={loadingManagers}
              >
                <option value="">
                  {loadingManagers
                    ? "Đang tải danh sách quản lý..."
                    : "— Chọn hotel manager —"}
                </option>

                {managers.map((u) => {
                  const id = u.userId ?? u.id;
                  const username = u.username ?? "";
                  const name = u.name || u.fullName || "";
                  return (
                    <option key={id ?? username} value={username}>
                      {id ? `${id} - ` : ""}
                      {name}
                      {username ? ` (${username})` : ""}
                    </option>
                  );
                })}
              </select>

              <p className="text-xs text-gray-500 mt-1">
                Hiển thị ID và tên để dễ chọn, khi lưu chỉ gửi username.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4 min-w-0">
            <div className="border rounded-2xl p-4">
              <label className="block text-sm font-medium mb-2">
                Ảnh khách sạn
              </label>

              {/* input file nhìn gọn hơn */}
              <label className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border hover:bg-gray-50 cursor-pointer">
                <span>Chọn ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickImage}
                  className="hidden"
                />
              </label>

              <div className="mt-4">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-56 sm:h-64 object-cover rounded-2xl bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-56 sm:h-64 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
                    Chưa chọn ảnh
                  </div>
                )}
              </div>

              {imageFile && (
                <div className="mt-2 text-xs text-gray-600 break-words">
                  File: <span className="font-medium">{imageFile.name}</span>
                </div>
              )}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-2xl bg-black text-white py-3 font-semibold disabled:opacity-60 active:scale-[0.99]"
            >
              {loading ? "Đang thêm..." : "Tạo khách sạn"}
            </button>
          </div>
        </form>
      </div>

      {/* SUCCESS MODAL */}
      {openSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenSuccess(false)}
          />

          {/* modal */}
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xl font-semibold">Thêm khách sạn thành công</div>
            <div className="mt-2 text-sm text-gray-600">
              Bạn muốn quay về danh sách khách sạn hay tiếp tục tạo mới?
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="w-full sm:flex-1 rounded-xl border border-gray-200 py-2.5 hover:bg-gray-50"
                onClick={() => {
                  setOpenSuccess(false);
                  navigate("/admin/hotels");
                }}
              >
                Về trang hotel
              </button>

              <button
                type="button"
                className="w-full sm:flex-1 rounded-xl bg-black text-white py-2.5"
                onClick={() => {
                  setOpenSuccess(false);
                  resetForm();
                }}
              >
                Tiếp tục tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  inputMode,
}) {
  return (
    <div className="min-w-0">
      <label className="block text-sm font-medium mb-1">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        inputMode={inputMode}
        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}
