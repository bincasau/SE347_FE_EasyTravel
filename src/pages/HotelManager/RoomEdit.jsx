import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const S3_ROOM_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";
const FALLBACK_IMAGE = `${S3_ROOM_BASE}/standard_bed.jpg`;

export default function RoomEdit() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ lấy room từ state (MyRooms/Card -> navigate("/hotel-manager/rooms/edit", { state:{ room } }))
  const room = location.state?.room;

  // nếu refresh trang → mất state → quay về danh sách
  useEffect(() => {
    if (!room) navigate(-1, { replace: true });
  }, [room, navigate]);

  // ✅ Read-only by default
  const [isEditing, setIsEditing] = useState(false);

  // ✅ store original to revert on Cancel
  const [original, setOriginal] = useState(null);

  const [form, setForm] = useState({
    room_number: "",
    room_type: "",
    number_of_guests: "",
    price: "",
    description: "",
    floor: "",
    status: "AVAILABLE",
  });

  // ✅ images: existing + new upload
  const [bedPreviews, setBedPreviews] = useState([]); // string[] (aws urls or blob)
  const [wcPreviews, setWcPreviews] = useState([]);
  const [bedFiles, setBedFiles] = useState([]); // File[]
  const [wcFiles, setWcFiles] = useState([]);

  const bedInputRef = useRef(null);
  const wcInputRef = useRef(null);

  const toAwsUrl = (v) => {
    if (!v) return "";
    const s = String(v);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    return `${S3_ROOM_BASE}/${s}`;
  };

  const normalizeToAwsUrls = (images) => {
    if (!images) return [];
    const arr = Array.isArray(images) ? images : [images];
    return arr.map(toAwsUrl).filter(Boolean);
  };

  // ----------------------------
  // Load from room state ONLY
  // ----------------------------
  useEffect(() => {
    if (!room) return;

    // room có thể là snake_case (room_number...) hoặc camelCase (roomNumber...)
    const nextForm = {
      room_number: room.room_number ?? room.roomNumber ?? "",
      room_type: room.room_type ?? room.roomType ?? "",
      number_of_guests:
        room.number_of_guests ?? room.numberOfGuest ?? room.numberOfGuest === 0
          ? String(room.number_of_guests ?? room.numberOfGuest)
          : "",
      price:
        room.price === null || room.price === undefined ? "" : String(room.price),
      description: room.description ?? room.desc ?? "",
      floor:
        room.floor === null || room.floor === undefined ? "" : String(room.floor),
      status: room.status ?? "AVAILABLE",
    };

    const bedUrls = normalizeToAwsUrls(room.image_bed ?? room.imageBed);
    const wcUrls = normalizeToAwsUrls(room.image_wc ?? room.imageWC);

    setForm(nextForm);

    setOriginal({
      form: nextForm,
      bedPreviews: bedUrls,
      wcPreviews: wcUrls,
    });

    setBedPreviews(bedUrls);
    setWcPreviews(wcUrls);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  // ----------------------------
  // Form handlers
  // ----------------------------
  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value ?? "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  // ----------------------------
  // Image helpers
  // ----------------------------
  const addImages = (files, setFiles, setUrls) => {
    const arr = Array.from(files || []);
    if (arr.length === 0) return;

    setFiles((prev) => [...prev, ...arr]);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setUrls((prev) => [...prev, ...urls]);
  };

  const removeAt = (idx, setFiles, previews, setPreviews) => {
    if (!isEditing) return;

    setPreviews((prev) => {
      const url = prev[idx];
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });

    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAll = (filesSetter, previews, previewsSetter) => {
    if (!isEditing) return;
    previews.forEach((u) => u?.startsWith("blob:") && URL.revokeObjectURL(u));
    filesSetter([]);
    previewsSetter([]);
  };

  // ----------------------------
  // Actions (demo only)
  // ----------------------------
  const onCancel = () => {
    if (!original) return setIsEditing(false);

    setForm(original.form);

    bedPreviews.forEach((u) => u.startsWith("blob:") && URL.revokeObjectURL(u));
    wcPreviews.forEach((u) => u.startsWith("blob:") && URL.revokeObjectURL(u));

    setBedPreviews(original.bedPreviews);
    setWcPreviews(original.wcPreviews);

    setBedFiles([]);
    setWcFiles([]);

    setIsEditing(false);
  };

  const onSave = async () => {
    // demo: chỉ log
    const payload = {
      ...form,
      number_of_guests:
        form.number_of_guests === "" ? null : Number(form.number_of_guests),
      price: form.price === "" ? null : Number(form.price),
      floor: form.floor === "" ? null : Number(form.floor),
    };

    console.log("[SAVE DEMO payload]", payload);
    console.log("[NEW bed files]", bedFiles);
    console.log("[NEW wc files]", wcFiles);

    alert("Saved (demo only - chưa call API).");

    setOriginal({
      form: { ...form },
      bedPreviews: [...bedPreviews],
      wcPreviews: [...wcPreviews],
    });

    setIsEditing(false);
  };

  const readonlyCls = isEditing
    ? ""
    : "pointer-events-none select-none opacity-95";

  const inputBase =
    "w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200";
  const inputReadonly = isEditing
    ? ""
    : "bg-gray-50 text-gray-700 border-gray-200";

  if (!room) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <div className="flex-1">
            <button
              onClick={() => navigate(-1)}
              className="text-sm px-3 py-2 rounded-xl border hover:bg-gray-50"
            >
              ← Back
            </button>
          </div>

          <h1 className="flex-1 text-center text-xl font-semibold text-gray-900">
            Room Detail
          </h1>

          <div className="flex-1" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          {/* lock badge */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div className="text-sm text-gray-600">
              Mode:{" "}
              <span
                className={`px-2 py-1 rounded-full border text-xs font-semibold ${
                  isEditing
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {isEditing ? "Editing" : "Read-only"}
              </span>
            </div>
          </div>

          {/* form */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${readonlyCls}`}>
            <Field label="Room Number" required>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                disabled={!isEditing}
              />
            </Field>

            <Field label="Room Type" required>
              <input
                name="room_type"
                value={form.room_type}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                disabled={!isEditing}
              />
            </Field>

            <Field label="Number of Guests" required>
              <input
                name="number_of_guests"
                value={form.number_of_guests}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                inputMode="numeric"
                disabled={!isEditing}
              />
            </Field>

            <Field label="Price" required>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                inputMode="decimal"
                disabled={!isEditing}
              />
            </Field>

            <Field label="Floor">
              <input
                name="floor"
                value={form.floor}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                inputMode="numeric"
                disabled={!isEditing}
              />
            </Field>

            <Field label="Status">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                disabled={!isEditing}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BOOKED">BOOKED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </Field>

            <Field label="Description" className="md:col-span-2">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly} min-h-[120px]`}
                disabled={!isEditing}
              />
            </Field>
          </div>

          {/* images */}
          <div className="mt-8 border-t pt-6 space-y-6">
            <ImageSection
              title="Bed Images"
              subtitle='(demo) existing = AWS URL, new upload = blob URL'
              pickLabel="Choose Bed Images"
              onPick={() => isEditing && bedInputRef.current?.click()}
              onClear={() => clearAll(setBedFiles, bedPreviews, setBedPreviews)}
              previews={bedPreviews.length ? bedPreviews : [FALLBACK_IMAGE]}
              onRemove={(idx) =>
                removeAt(idx, setBedFiles, bedPreviews, setBedPreviews)
              }
              inputRef={bedInputRef}
              onChange={(e) => {
                if (!isEditing) return;
                addImages(e.target.files, setBedFiles, setBedPreviews);
                e.target.value = "";
              }}
              disabled={!isEditing}
            />

            <ImageSection
              title="WC Images"
              subtitle='(demo) existing = AWS URL, new upload = blob URL'
              pickLabel="Choose WC Images"
              onPick={() => isEditing && wcInputRef.current?.click()}
              onClear={() => clearAll(setWcFiles, wcPreviews, setWcPreviews)}
              previews={wcPreviews.length ? wcPreviews : [FALLBACK_IMAGE]}
              onRemove={(idx) =>
                removeAt(idx, setWcFiles, wcPreviews, setWcPreviews)
              }
              inputRef={wcInputRef}
              onChange={(e) => {
                if (!isEditing) return;
                addImages(e.target.files, setWcFiles, setWcPreviews);
                e.target.value = "";
              }}
              disabled={!isEditing}
            />
          </div>

          {/* actions */}
          <div className="mt-8 flex justify-end gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow"
              >
                Change
              </button>
            ) : (
              <>
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-xl border hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={onSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          *Hiện tại chỉ hiển thị dữ liệu từ <span className="font-semibold">room state</span>{" "}
          (không fetch, không push).
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-sm font-semibold text-gray-800">{label}</label>
        {required && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
            Required
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ImageSection({
  title,
  subtitle,
  pickLabel,
  onPick,
  onClear,
  previews,
  onRemove,
  inputRef,
  onChange,
  disabled,
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPick}
            disabled={disabled}
            className={[
              "border px-4 py-2 rounded-xl font-medium",
              disabled
                ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-orange-500 text-orange-600 hover:bg-orange-50",
            ].join(" ")}
          >
            {pickLabel}
          </button>

          {previews.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className={[
                "border px-4 py-2 rounded-xl",
                disabled
                  ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              Clear
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onChange}
          disabled={disabled}
        />
      </div>

      <div className="w-full mt-3">
        {previews.length === 0 ? (
          <div className="w-full h-[120px] rounded-xl border bg-gray-50 flex items-center justify-center">
            <span className="text-sm text-gray-400">No images</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map((src, idx) => (
              <div
                key={src + idx}
                className="relative rounded-xl overflow-hidden border bg-gray-50"
              >
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="w-full h-28 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  disabled={disabled}
                  className={[
                    "absolute top-2 right-2 text-xs px-2 py-1 rounded-lg",
                    disabled
                      ? "bg-black/30 text-white cursor-not-allowed"
                      : "bg-black/60 text-white hover:bg-black/75",
                  ].join(" ")}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
