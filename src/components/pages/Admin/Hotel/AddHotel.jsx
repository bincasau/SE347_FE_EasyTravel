import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addHotel } from "@/apis/Hotel";
import { getUsers } from "@/apis/User";
import { popup } from "@/utils/popup";

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

  // Load danh sách user role HOTEL_MANAGER
  useEffect(() => {
    (async () => {
      const close = popup.loading("Đang tải danh sách quản lý khách sạn...");
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
        popup.error(e?.message || "Tải danh sách quản lý thất bại");
      } finally {
        close?.();
        setLoadingManagers(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const hotelData = {
      name: form.name.trim(),
      address: form.address.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      description: form.description.trim(),
      minPrice: Number(form.minPrice || 0),
    };

    if (!hotelData.name || !hotelData.address) {
      popup.error("Vui lòng nhập Tên khách sạn và Địa chỉ.");
      return;
    }

    if (!managerUsername.trim()) {
      popup.error("Vui lòng chọn quản lý khách sạn.");
      return;
    }

    try {
      setLoading(true);
      const close = popup.loading("Đang thêm khách sạn...");

      // Gửi managerUsername đúng contract API
      await addHotel({
        hotelData,
        imageFile,
        managerUsername: managerUsername.trim(),
      });

      close?.();

      const goList = await popup.confirm(
        "Thêm khách sạn thành công.\nBạn có muốn quay về danh sách khách sạn không?",
        "Thành công",
      );

      if (goList) {
        navigate("/admin/hotels");
      } else {
        resetForm();
      }
    } catch (err) {
      popup.error(err?.message || "Thêm khách sạn thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-6">
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">Thêm khách sạn</h1>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-auto px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>

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

            {/* Manager select */}
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
                    : "— Chọn quản lý khách sạn —"}
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
