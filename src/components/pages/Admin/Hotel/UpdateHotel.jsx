import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateHotel, getHotelById } from "@/apis/Hotel";

const S3_HOTEL_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

export default function AdminHotelEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialHotel, setInitialHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
    email: "",
    phone_number: "",
    manager_id: "",
    min_price: "",
  });

  const [currentImage, setCurrentImage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await getHotelById(id);
        if (!mounted) return;

        setInitialHotel(data);

        setForm({
          name: data?.name || "",
          address: data?.address || "",
          description: data?.description || "",
          email: data?.email || "",
          phone_number: data?.phoneNumber || data?.phone_number || "",
          manager_id:
            data?.managerId ?? data?.manager_id ?? data?.managerID ?? ""
              ? String(data?.managerId ?? data?.manager_id ?? data?.managerID)
              : "",
          min_price:
            data?.minPrice ?? data?.min_price ?? null
              ? String(data?.minPrice ?? data?.min_price)
              : "",
        });

        const img = data?.mainImage || data?.main_image || "";
        if (img) {
          setCurrentImage(
            img.startsWith("http") ? img : `${S3_HOTEL_BASE}/${img}`
          );
        } else {
          setCurrentImage("");
        }
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Không tải được dữ liệu hotel");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!file) return setPreview("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canSubmit = useMemo(() => {
    return form.name.trim() && form.address.trim();
  }, [form.name, form.address]);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!canSubmit) {
      setErr("Vui lòng nhập Name và Address.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.description?.trim() || null,
        email: form.email?.trim() || null,
        phone_number: form.phone_number?.trim() || null,
        manager_id: form.manager_id === "" ? null : Number(form.manager_id),
        min_price: form.min_price === "" ? null : Number(form.min_price),
      };

      await updateHotel(id, payload, file);
      navigate("/admin/hotels");
    } catch (e2) {
      setErr(e2?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold">Update Hotel #{id}</h2>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!initialHotel) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold">Update Hotel #{id}</h2>
          <p className="mt-2 text-gray-600">
            {err || "Không có dữ liệu hotel."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Update Hotel #{id}</h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        {err && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <Field label="Name" required>
              <input
                value={form.name}
                onChange={onChange("name")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
              />
            </Field>

            <Field label="Address" required>
              <input
                value={form.address}
                onChange={onChange("address")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={onChange("description")}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Email">
                <input
                  value={form.email}
                  onChange={onChange("email")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                />
              </Field>

              <Field label="Phone number">
                <input
                  value={form.phone_number}
                  onChange={onChange("phone_number")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Manager ID">
                <input
                  value={form.manager_id}
                  onChange={onChange("manager_id")}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="(optional)"
                />
              </Field>

              <Field label="Min price">
                <input
                  value={form.min_price}
                  onChange={onChange("min_price")}
                  inputMode="decimal"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="(optional)"
                />
              </Field>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={saving || !canSubmit}
                className="px-5 py-3 rounded-xl bg-gray-900 text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/hotels")}
                className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="text-sm font-semibold mb-3">Main image</div>

              <div className="w-full aspect-[16/10] rounded-xl bg-gray-100 overflow-hidden">
                {preview || currentImage ? (
                  <img
                    src={preview || currentImage}
                    alt="hotel"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    No image
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Upload new image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                  className="w-full text-sm"
                />
                {file && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-600 line-clamp-1">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      {children}
    </div>
  );
}
