import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";
const UPDATE_ROOM_URL = `${API_BASE}/hotel_manager/rooms`; // ✅ BE saveOrUpdateRoom mapping "/rooms"
const S3_ROOM_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";
const FALLBACK_IMAGE = `${S3_ROOM_BASE}/standard_bed.jpg`;

/** ---------- helpers ---------- */
function toAwsUrl(v) {
  if (!v) return "";
  const s = String(v);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `${S3_ROOM_BASE}/${s}`;
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

async function readResponseSmart(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json().catch(() => res.text());
  }
  return res.text();
}

async function apiFetch(url, { token, method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    mode: "cors",
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // ❌ không set Content-Type khi FormData
    },
    cache: "no-store",
    body,
  });

  const raw = await readResponseSmart(res);
  console.log("[apiFetch]", { method, url, status: res.status, ok: res.ok, raw });

  if (!res.ok) {
    const msg =
      typeof raw === "string" && raw.trim()
        ? raw
        : typeof raw === "object"
        ? JSON.stringify(raw)
        : "";
    const err = new Error(`${method} ${url} failed (${res.status})${msg ? ` - ${msg}` : ""}`);
    err.status = res.status;
    err.raw = raw;
    throw err;
  }

  return raw;
}

export default function RoomEdit() {
  const navigate = useNavigate();
  const location = useLocation();

  const token =
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  // room từ state
  const room = location.state?.room;

  useEffect(() => {
    if (!room) navigate(-1, { replace: true });
  }, [room, navigate]);

  const [isEditing, setIsEditing] = useState(false);
  const [original, setOriginal] = useState(null);

  // ✅ form theo UI snake_case, nhưng lúc gửi BE -> camelCase
  const [form, setForm] = useState({
    room_id: "",
    room_number: "",
    room_type: "",
    number_of_guests: "",
    price: "",
    description: "",
    status: "AVAILABLE", // UI có thì giữ, BE có thể ignore
  });

  // ✅ single image (bedFile/wcFile)
  const [bedFile, setBedFile] = useState(null);
  const [wcFile, setWcFile] = useState(null);

  // preview: ưu tiên ảnh mới (blob), không có thì ảnh cũ (aws)
  const [bedPreview, setBedPreview] = useState("");
  const [wcPreview, setWcPreview] = useState("");

  const bedInputRef = useRef(null);
  const wcInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);

  /** ---------- init from state ---------- */
  useEffect(() => {
    if (!room) return;

    const roomId = room.room_id ?? room.roomId ?? room.roomID ?? room.id ?? "";

    const nextForm = {
      room_id: String(roomId ?? ""),
      room_number: String(room.room_number ?? room.roomNumber ?? ""),
      room_type: String(room.room_type ?? room.roomType ?? ""),
      number_of_guests: String(room.number_of_guests ?? room.numberOfGuest ?? ""),
      price: room.price === null || room.price === undefined ? "" : String(room.price),
      description: String(room.description ?? room.desc ?? ""),
      status: String(room.status ?? "AVAILABLE"),
    };

    // ảnh cũ
    const bedOld = toAwsUrl(room.image_bed ?? room.imageBed);
    const wcOld = toAwsUrl(room.image_wc ?? room.imageWC);

    setForm(nextForm);

    setOriginal({
      form: nextForm,
      bedOld,
      wcOld,
    });

    setBedPreview(bedOld || FALLBACK_IMAGE);
    setWcPreview(wcOld || FALLBACK_IMAGE);

    // reset file mới
    setBedFile(null);
    setWcFile(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  /** ---------- handlers ---------- */
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value ?? "" }));
  const handleChange = (e) => setField(e.target.name, e.target.value);

  const pickBed = () => isEditing && bedInputRef.current?.click();
  const pickWc = () => isEditing && wcInputRef.current?.click();

  const setSingleImage = (file, setFile, previewSetter) => {
    if (!file) {
      setFile(null);
      // preview giữ ảnh cũ, không reset ở đây
      return;
    }
    setFile(file);
    previewSetter(URL.createObjectURL(file));
  };

  const clearBed = () => {
    if (!isEditing) return;
    if (bedPreview?.startsWith("blob:")) URL.revokeObjectURL(bedPreview);
    setBedFile(null);
    setBedPreview(original?.bedOld || FALLBACK_IMAGE);
  };

  const clearWc = () => {
    if (!isEditing) return;
    if (wcPreview?.startsWith("blob:")) URL.revokeObjectURL(wcPreview);
    setWcFile(null);
    setWcPreview(original?.wcOld || FALLBACK_IMAGE);
  };

  const onCancel = () => {
    if (!original) return setIsEditing(false);

    // revoke blob previews
    if (bedPreview?.startsWith("blob:")) URL.revokeObjectURL(bedPreview);
    if (wcPreview?.startsWith("blob:")) URL.revokeObjectURL(wcPreview);

    setForm(original.form);
    setBedFile(null);
    setWcFile(null);
    setBedPreview(original.bedOld || FALLBACK_IMAGE);
    setWcPreview(original.wcOld || FALLBACK_IMAGE);
    setIsEditing(false);
  };

  /** ---------- VALIDATE ---------- */
  const validate = () => {
    if (!token) return "NO_TOKEN (Bạn chưa đăng nhập)";
    if (!form.room_id) return "Missing roomId (state room bị thiếu id)";
    if (!String(form.room_number).trim()) return "Room number is required.";
    if (!String(form.room_type).trim()) return "Room type is required.";
    if (!String(form.number_of_guests).trim()) return "Number of guests is required.";
    if (!String(form.price).trim()) return "Price is required.";
    return null;
  };

  /** ---------- SAVE (UPDATE) ---------- */
  const onSave = async () => {
    const err = validate();
    if (err) return alert(err);

    // ✅ JSON gửi vào @RequestPart("room") phải match entity Room
    const roomPayload = {
      roomId: safeNumber(form.room_id, 0),
      roomNumber: safeNumber(form.room_number, 0),
      roomType: String(form.room_type).trim(),
      numberOfGuest: safeNumber(form.number_of_guests, 0),
      price: safeNumber(form.price, 0),
      desc: String(form.description || "").trim(),
      // ✅ hotel bắt buộc trong entity, nên gửi lại nếu có
      // nếu room state có hotelId thì dùng, không thì bỏ (BE có thể tự map theo roomId)
      ...(room?.hotel?.hotelId
        ? { hotel: { hotelId: Number(room.hotel.hotelId) } }
        : room?.hotelId
        ? { hotel: { hotelId: Number(room.hotelId) } }
        : {}),
    };

    const fd = new FormData();
    fd.append("room", new Blob([JSON.stringify(roomPayload)], { type: "application/json" }));

    // ✅ đúng tên backend
    if (bedFile) fd.append("bedFile", bedFile);
    if (wcFile) fd.append("wcFile", wcFile);

    try {
      setSubmitting(true);

      // ✅ đa số BE dùng POST để saveOrUpdate (như bạn gửi screenshot: @PostMapping("/rooms"))
      // Nếu BE bạn là PUT mapping thì đổi method: "PUT"
      await apiFetch(UPDATE_ROOM_URL, {
        token,
        method: "POST",
        body: fd,
      });

      alert("Updated room success!");

      // cập nhật original
      const bedOld = bedPreview?.startsWith("blob:") ? bedPreview : (original?.bedOld || "");
      const wcOld = wcPreview?.startsWith("blob:") ? wcPreview : (original?.wcOld || "");

      setOriginal({
        form: { ...form },
        bedOld: bedOld || original?.bedOld || "",
        wcOld: wcOld || original?.wcOld || "",
      });

      setIsEditing(false);
    } catch (e) {
      console.error(e);
      if (e?.status === 403) {
        alert(
          "403 Forbidden khi update /hotel_manager/rooms.\n" +
            "=> BE chưa nhận JWT / role HOTEL_MANAGER chưa đúng / OPTIONS bị chặn."
        );
      } else {
        alert(e?.message || "Update failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) return null;

  const readonlyCls = isEditing ? "" : "pointer-events-none select-none opacity-95";
  const inputBase =
    "w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200";
  const inputReadonly = isEditing ? "" : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Header */}
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
          {/* Mode */}
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

          {/* Form */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${readonlyCls}`}>
            <Field label="Room Number" required>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                disabled={!isEditing}
                inputMode="numeric"
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
                disabled={!isEditing}
                inputMode="numeric"
              />
            </Field>

            <Field label="Price" required>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                disabled={!isEditing}
                inputMode="decimal"
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

          {/* Images */}
          <div className="mt-8 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SingleImage
              title="Bed Image (bedFile)"
              preview={bedPreview || FALLBACK_IMAGE}
              onPick={pickBed}
              onClear={clearBed}
              inputRef={bedInputRef}
              onChange={(e) => {
                if (!isEditing) return;
                const f = e.target.files?.[0] || null;
                if (f) setSingleImage(f, setBedFile, setBedPreview);
                e.target.value = "";
              }}
              disabled={!isEditing}
            />

            <SingleImage
              title="WC Image (wcFile)"
              preview={wcPreview || FALLBACK_IMAGE}
              onPick={pickWc}
              onClear={clearWc}
              inputRef={wcInputRef}
              onChange={(e) => {
                if (!isEditing) return;
                const f = e.target.files?.[0] || null;
                if (f) setSingleImage(f, setWcFile, setWcPreview);
                e.target.value = "";
              }}
              disabled={!isEditing}
            />
          </div>

          {/* Actions */}
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
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  onClick={onSave}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- components ---------- */
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

function SingleImage({ title, preview, onPick, onClear, inputRef, onChange, disabled }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-gray-900">{title}</div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPick}
            disabled={disabled}
            className={[
              "border px-3 py-1.5 rounded-lg font-medium",
              disabled
                ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-orange-500 text-orange-600 hover:bg-orange-50",
            ].join(" ")}
          >
            Choose
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className={[
              "border px-3 py-1.5 rounded-lg",
              disabled
                ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            Clear
          </button>
        </div>

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      </div>

      <div className="mt-3">
        <img
          src={preview || FALLBACK_IMAGE}
          alt="preview"
          className="w-full h-[140px] object-cover rounded-lg border bg-white"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>
    </div>
  );
}
