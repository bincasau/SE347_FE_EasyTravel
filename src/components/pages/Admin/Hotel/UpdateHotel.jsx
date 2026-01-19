import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateHotel, getHotelById } from "@/apis/Hotel";
import ExtraImagesManager from "@/components/pages/admin/Common/ExtraImagesManager";

const S3_HOTEL_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

function toStr(v) {
  return (v ?? "").toString();
}

function toTrim(v) {
  return toStr(v).trim();
}

function toNumberOrNull(v) {
  const s = toTrim(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

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

        const managerRaw =
          data?.managerId ?? data?.manager_id ?? data?.managerID ?? "";
        const minPriceRaw = data?.minPrice ?? data?.min_price ?? "";

        setForm({
          name: data?.name || "",
          address: data?.address || "",
          description: data?.description || "",
          email: data?.email || "",
          phone_number: data?.phoneNumber || data?.phone_number || "",
          manager_id:
            managerRaw === null || managerRaw === undefined
              ? ""
              : String(managerRaw),
          min_price:
            minPriceRaw === null || minPriceRaw === undefined
              ? ""
              : String(minPriceRaw),
        });

        const img = data?.mainImage || data?.main_image || "";
        if (img) {
          setCurrentImage(
            img.startsWith("http") ? img : `${S3_HOTEL_BASE}/${img}`,
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
    return toTrim(form.name) && toTrim(form.address);
  }, [form.name, form.address]);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    // cho phép chọn lại cùng file
    e.target.value = "";
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
        name: toTrim(form.name),
        address: toTrim(form.address),
        description: toTrim(form.description) || null,
        email: toTrim(form.email) || null,
        phone_number: toTrim(form.phone_number) || null,
        manager_id: toNumberOrNull(form.manager_id),
        min_price: toNumberOrNull(form.min_price),
      };

      await updateHotel(id, payload, file);
      navigate("/admin/hotels");
    } catch (e2) {
      setErr(e2?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = `Update Hotel #${id}`;

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold">{pageTitle}</h2>
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-900 text-white"
            >
              Back
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 text-gray-600">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!initialHotel) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold">{pageTitle}</h2>
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-900 text-white"
            >
              Back
            </button>
          </div>

          <p className="mt-3 text-gray-600">
            {err || "Không có dữ liệu hotel."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold truncate">
              {pageTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Cập nhật thông tin khách sạn và ảnh đại diện.
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/hotels")}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              List
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
            {err}
          </div>
        )}

        {/* Layout responsive */}
        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-12 gap-6">
          {/* Left: fields */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <Field label="Name" required>
              <input
                value={form.name}
                onChange={onChange("name")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Hotel name"
              />
            </Field>

            <Field label="Address" required>
              <input
                value={form.address}
                onChange={onChange("address")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Hotel address"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={onChange("description")}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Short description..."
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Email">
                <input
                  value={form.email}
                  onChange={onChange("email")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="email@example.com"
                />
              </Field>

              <Field label="Phone number">
                <input
                  value={form.phone_number}
                  onChange={onChange("phone_number")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="(optional)"
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

            {/* Actions responsive: stack mobile, inline desktop */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                disabled={saving || !canSubmit}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 text-white disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/hotels")}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right: image (sticky on desktop) */}
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Main image card */}
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="text-sm font-semibold">Main image</div>
                  {(preview || currentImage) && (
                    <a
                      href={preview || currentImage}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
                    >
                      Open
                    </a>
                  )}
                </div>

                <div className="w-full aspect-[16/10] rounded-xl bg-gray-100 overflow-hidden">
                  {preview || currentImage ? (
                    <img
                      src={preview || currentImage}
                      alt="hotel"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                      No image
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">
                    Upload new image (optional)
                  </div>

                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-sm">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
                    <span className="truncate">
                      {file ? file.name : "Choose an image..."}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPickFile}
                      className="hidden"
                    />
                  </label>

                  {file && (
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm text-gray-600 line-clamp-1">
                        Selected: {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="w-full sm:w-auto text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {preview && (
                    <div className="mt-3 text-xs text-gray-500">
                      Preview đang hiển thị ảnh mới. Bấm Save để upload.
                    </div>
                  )}
                </div>
              </div>

              {/* Extra images card (responsive) */}
              <div className="rounded-2xl border border-gray-200 p-3 sm:p-4">
                <ExtraImagesManager
                  type="hotel"
                  ownerId={Number(id)}
                  readOnly={false}
                />
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
