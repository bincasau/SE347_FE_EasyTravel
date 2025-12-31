import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// NOTE: Demo only - bạn thay bằng API thật
async function fakeFetchRoomDetail(hotelId, roomId) {
  // giả lập data (nên replace bằng API get room detail)
  return {
    room_id: Number(roomId),
    hotel_id: Number(hotelId),
    room_number: "A101",
    room_type: "Deluxe",
    number_of_guests: 2,
    price: 59.99,
    description: "Nice room with city view.",
    floor: 10,
    status: "AVAILABLE",
    image_bed: [],
    image_wc: [],
  };
}

export default function RoomEdit() {
  const navigate = useNavigate();
  const { hotelId, roomId } = useParams();

  const [loading, setLoading] = useState(true);

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
  const [bedPreviews, setBedPreviews] = useState([]); // string[] (existing or new blob urls)
  const [wcPreviews, setWcPreviews] = useState([]);
  const [bedFiles, setBedFiles] = useState([]); // File[]
  const [wcFiles, setWcFiles] = useState([]);

  const bedInputRef = useRef(null);
  const wcInputRef = useRef(null);

  // ----------------------------
  // Load room detail
  // ----------------------------
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await fakeFetchRoomDetail(hotelId, roomId);

        const nextForm = {
          room_number: data.room_number ?? "",
          room_type: data.room_type ?? "",
          number_of_guests:
            data.number_of_guests === null || data.number_of_guests === undefined
              ? ""
              : String(data.number_of_guests),
          price:
            data.price === null || data.price === undefined
              ? ""
              : String(data.price),
          description: data.description ?? "",
          floor:
            data.floor === null || data.floor === undefined
              ? ""
              : String(data.floor),
          status: data.status ?? "AVAILABLE",
        };

        setForm(nextForm);
        setOriginal({
          form: nextForm,
          bedPreviews: normalizeToUrls(data.image_bed),
          wcPreviews: normalizeToUrls(data.image_wc),
        });

        setBedPreviews(normalizeToUrls(data.image_bed));
        setWcPreviews(normalizeToUrls(data.image_wc));
      } catch (e) {
        alert("Failed to load room detail.");
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, roomId]);

  function normalizeToUrls(images) {
    // backend có thể trả string hoặc array string
    // ở demo: nếu empty => []
    if (!images) return [];
    if (Array.isArray(images)) return images;
    return [images];
  }

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
  // Image helpers (bed/wc)
  // ----------------------------
  const pickBedImages = () => isEditing && bedInputRef.current?.click();
  const pickWcImages = () => isEditing && wcInputRef.current?.click();

  const addImages = (files, setFiles, setUrls) => {
    const arr = Array.from(files || []);
    if (arr.length === 0) return;

    setFiles((prev) => [...prev, ...arr]);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setUrls((prev) => [...prev, ...urls]);
  };

  const removeAt = (idx, setFiles, previews, setPreviews) => {
    // allow remove only in edit mode
    if (!isEditing) return;

    // If this preview is a blob url created from File => revoke
    setPreviews((prev) => {
      const url = prev[idx];
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });

    // remove corresponding file if it was newly added
    // (naive approach: remove by index in new files list if possible)
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAll = (filesSetter, previews, previewsSetter) => {
    if (!isEditing) return;
    previews.forEach((u) => {
      if (u && u.startsWith("blob:")) URL.revokeObjectURL(u);
    });
    filesSetter([]);
    previewsSetter([]);
  };

  // ----------------------------
  // Validate & actions
  // ----------------------------
  const validate = () => {
    if (!hotelId || !roomId) return "Missing hotelId/roomId in URL.";
    if (!String(form.room_number).trim()) return "Room number is required.";
    if (!String(form.room_type).trim()) return "Room type is required.";
    if (!String(form.number_of_guests).trim())
      return "Number of guests is required.";
    if (!String(form.price).trim()) return "Price is required.";
    return null;
  };

  const onClickChange = () => setIsEditing(true);

  const onCancel = () => {
    if (!original) return setIsEditing(false);

    // reset form
    setForm(original.form);

    // reset previews (revoke blob urls currently in use)
    bedPreviews.forEach((u) => u.startsWith("blob:") && URL.revokeObjectURL(u));
    wcPreviews.forEach((u) => u.startsWith("blob:") && URL.revokeObjectURL(u));

    setBedPreviews(original.bedPreviews);
    setWcPreviews(original.wcPreviews);

    // reset files
    setBedFiles([]);
    setWcFiles([]);

    setIsEditing(false);
  };

  const onSave = async () => {
    const err = validate();
    if (err) return alert(err);

    // payload
    const payload = {
      hotel_id: Number(hotelId),
      room_id: Number(roomId),
      ...form,
      number_of_guests: Number(form.number_of_guests),
      price: Number(form.price),
      floor: form.floor === "" ? null : Number(form.floor),
    };

    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      fd.append(k, String(v));
    });

    // new images
    bedFiles.forEach((f) => fd.append("image_bed", f));
    wcFiles.forEach((f) => fd.append("image_wc", f));

    // TODO: call API update
    // await axios.put(`/api/hotels/${hotelId}/rooms/${roomId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });

    console.log("SAVE room:", payload);
    console.log("New bed files:", bedFiles);
    console.log("New wc files:", wcFiles);

    alert("Saved (demo).");

    // after save: lock again + update original snapshot
    const newOriginal = {
      form: { ...form },
      bedPreviews: [...bedPreviews],
      wcPreviews: [...wcPreviews],
    };
    setOriginal(newOriginal);
    setIsEditing(false);
  };

  const onDelete = async () => {
    if (!confirm("Delete this room? This action cannot be undone.")) return;

    // TODO: call API delete
    // await axios.delete(`/api/hotels/${hotelId}/rooms/${roomId}`);

    alert("Deleted (demo).");
    navigate(`/hotel-manager/hotels/${hotelId}`);
  };

  // ----------------------------
  // UI helpers
  // ----------------------------
  const readonlyCls = isEditing
    ? ""
    : "pointer-events-none select-none opacity-95";

  const inputBase =
    "w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200";
  const inputReadonly = isEditing
    ? ""
    : "bg-gray-50 text-gray-700 border-gray-200";

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading room...</div>
      </div>
    );
  }

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

      {/* Form */}
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

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${readonlyCls}`}>
            <Field label="Room Number" required>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                placeholder="e.g. A101"
                disabled={!isEditing}
              />
            </Field>

            <Field label="Room Type" required>
              <input
                name="room_type"
                value={form.room_type}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                placeholder="e.g. Deluxe, Standard..."
                disabled={!isEditing}
              />
            </Field>

            <Field label="Number of Guests" required>
              <input
                name="number_of_guests"
                value={form.number_of_guests}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                placeholder="e.g. 2"
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
                placeholder="e.g. 59.99"
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
                placeholder="e.g. 10"
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
                placeholder="Room description..."
                disabled={!isEditing}
              />
            </Field>
          </div>

          {/* Upload images at bottom */}
          <div className="mt-8 border-t pt-6 space-y-6">
            <ImageSection
              title="Bed Images"
              subtitle='Upload will be sent as "image_bed[]"'
              pickLabel="Choose Bed Images"
              onPick={pickBedImages}
              onClear={() => clearAll(setBedFiles, bedPreviews, setBedPreviews)}
              previews={bedPreviews}
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
              subtitle='Upload will be sent as "image_wc[]"'
              pickLabel="Choose WC Images"
              onPick={pickWcImages}
              onClear={() => clearAll(setWcFiles, wcPreviews, setWcPreviews)}
              previews={wcPreviews}
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

          {/* Bottom actions */}
          <div className="mt-8 flex justify-end gap-2">
            {!isEditing ? (
              <button
                onClick={onClickChange}
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
                  onClick={onDelete}
                  className="px-5 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete
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
          Tip: Click <span className="font-semibold">Change</span> to unlock
          editing.
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
                <img src={src} alt={`preview-${idx}`} className="w-full h-28 object-cover" />
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
