import { useEffect, useMemo, useRef, useState } from "react";
import { getToken } from "@/utils/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { popup } from "@/utils/popup";

const API_BASE = "http://localhost:8080";
const UPDATE_ROOM_URL = `${API_BASE}/hotel_manager/rooms`; // BE saveOrUpdateRoom mapping "/rooms"

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

// parse VND input: "7.200.000₫" -> 7200000
function parseVNDToNumber(v) {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim();
  if (!s) return NaN;
  const cleaned = s.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

// format: 7200000 -> "7.200.000₫"
function formatVND(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  return `${n.toLocaleString("vi-VN")}₫`;
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
      // không set Content-Type khi FormData
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

    const err = new Error(
      `${method} ${url} thất bại (${res.status})${msg ? ` - ${msg}` : ""}`
    );
    err.status = res.status;
    err.raw = raw;
    throw err;
  }

  return raw;
}

export default function RoomEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();

  // room từ state
  const room = location.state?.room;

  const [isEditing, setIsEditing] = useState(false);
  const [original, setOriginal] = useState(null);

  // form UI snake_case
  const [form, setForm] = useState({
    room_id: "",
    room_number: "",
    room_type: "",
    number_of_guests: "",
    price: "",
    description: "",
  });

  // image files
  const [bedFile, setBedFile] = useState(null);
  const [wcFile, setWcFile] = useState(null);

  // preview: blob ưu tiên, không có thì aws
  const [bedPreview, setBedPreview] = useState("");
  const [wcPreview, setWcPreview] = useState("");

  const bedInputRef = useRef(null);
  const wcInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);

  /** ---------- nếu không có room thì báo lỗi + quay lại ---------- */
  useEffect(() => {
    if (room) return;

    (async () => {
      await popup.error("Không tìm thấy dữ liệu phòng. Không thể chỉnh sửa.");
      navigate(-1, { replace: true });
    })();
  }, [room, navigate]);

  /** ---------- init from state ---------- */
  useEffect(() => {
    if (!room) return;

    const roomId = room.room_id ?? room.roomId ?? room.roomID ?? room.id ?? "";

    const nextForm = {
      room_id: String(roomId ?? ""),
      room_number: String(room.room_number ?? room.roomNumber ?? ""),
      room_type: String(room.room_type ?? room.roomType ?? ""),
      number_of_guests: String(room.number_of_guests ?? room.numberOfGuest ?? ""),
      price:
        room.price === null || room.price === undefined ? "" : String(room.price),
      description: String(room.description ?? room.desc ?? ""),
    };

    const bedOld = toAwsUrl(room.image_bed ?? room.imageBed);
    const wcOld = toAwsUrl(room.image_wc ?? room.imageWC);

    // thu hồi blob cũ nếu có
    setBedPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return bedOld || FALLBACK_IMAGE;
    });
    setWcPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return wcOld || FALLBACK_IMAGE;
    });

    setForm(nextForm);
    setOriginal({ form: nextForm, bedOld, wcOld });

    setBedFile(null);
    setWcFile(null);
  }, [room]);

  /** ---------- cleanup blob khi unmount ---------- */
  useEffect(() => {
    return () => {
      if (bedPreview?.startsWith("blob:")) URL.revokeObjectURL(bedPreview);
      if (wcPreview?.startsWith("blob:")) URL.revokeObjectURL(wcPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---------- handlers ---------- */
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value ?? "" }));
  const handleChange = (e) => setField(e.target.name, e.target.value);

  // price: chỉ giữ số
  const handlePriceChange = (e) => {
    const v = e.target.value ?? "";
    const cleaned = String(v).replace(/[^\d]/g, "");
    setField("price", cleaned);
  };

  const pickBed = () => {
    if (!isEditing) return;
    bedInputRef.current?.click();
  };

  const pickWc = () => {
    if (!isEditing) return;
    wcInputRef.current?.click();
  };

  const setSingleImage = (file, setFile, setPreview) => {
    if (!file) return;
    setFile(file);
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const clearBed = () => {
    if (!isEditing) return;
    setBedFile(null);
    setBedPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return original?.bedOld || FALLBACK_IMAGE;
    });
  };

  const clearWc = () => {
    if (!isEditing) return;
    setWcFile(null);
    setWcPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return original?.wcOld || FALLBACK_IMAGE;
    });
  };

  const onCancel = () => {
    if (!original) {
      setIsEditing(false);
      return;
    }

    setForm(original.form);

    setBedFile(null);
    setWcFile(null);

    setBedPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return original.bedOld || FALLBACK_IMAGE;
    });
    setWcPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return original.wcOld || FALLBACK_IMAGE;
    });

    setIsEditing(false);
  };

  /** ---------- VALIDATE ---------- */
  const validate = () => {
    if (!form.room_id) return "Thiếu roomId (state room bị thiếu id).";
    if (!String(form.room_number).trim()) return "Vui lòng nhập số phòng.";
    if (!String(form.room_type).trim()) return "Vui lòng nhập loại phòng.";
    if (!String(form.number_of_guests).trim())
      return "Vui lòng nhập số khách tối đa.";
    if (!String(form.price).trim()) return "Vui lòng nhập giá phòng.";
    return null;
  };

  /** ---------- SAVE (UPDATE) ---------- */
  const onSave = async () => {
    const err = validate();
    if (err) return popup.error(err);

    const priceNum = parseVNDToNumber(form.price);
    if (!Number.isFinite(priceNum)) return popup.error("Giá phòng không hợp lệ.");

    const ok = await popup.confirm("Bạn có chắc muốn lưu thay đổi?", "Xác nhận");
    if (!ok) return;

    const roomPayload = {
      roomId: safeNumber(form.room_id, 0),
      roomNumber: safeNumber(form.room_number, 0),
      roomType: String(form.room_type).trim(),
      numberOfGuest: safeNumber(form.number_of_guests, 0),
      price: priceNum,
      desc: String(form.description || "").trim(),
      ...(room?.hotel?.hotelId
        ? { hotel: { hotelId: Number(room.hotel.hotelId) } }
        : room?.hotelId
        ? { hotel: { hotelId: Number(room.hotelId) } }
        : {}),
    };

    const fd = new FormData();
    fd.append(
      "room",
      new Blob([JSON.stringify(roomPayload)], { type: "application/json" })
    );
    if (bedFile) fd.append("bedFile", bedFile);
    if (wcFile) fd.append("wcFile", wcFile);

    try {
      setSubmitting(true);

      await apiFetch(UPDATE_ROOM_URL, {
        token,
        method: "POST",
        body: fd,
      });

      await popup.success("Cập nhật phòng thành công!");

      // cập nhật original để Cancel lần sau đúng
      setOriginal((prev) => ({
        form: { ...form },
        bedOld: prev?.bedOld || "",
        wcOld: prev?.wcOld || "",
      }));

      setIsEditing(false);
    } catch (e) {
      console.error(e);
      if (e?.status === 403) {
        popup.error(
          "403 Forbidden khi cập nhật /hotel_manager/rooms.\n" +
            "=> BE chưa nhận JWT / role HOTEL_MANAGER chưa đúng / CORS/OPTIONS bị chặn."
        );
      } else {
        popup.error(e?.message || "Cập nhật thất bại");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) return null;

  const readonlyCls = isEditing
    ? ""
    : "pointer-events-none select-none opacity-95";
  const inputBase =
    "w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200";
  const inputReadonly = isEditing ? "" : "bg-gray-50 text-gray-700 border-gray-200";

  const priceDisplay = useMemo(() => {
    const n = parseVNDToNumber(form.price);
    return Number.isFinite(n) ? formatVND(n) : "--";
  }, [form.price]);

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
              ← Quay lại
            </button>
          </div>

          <h1 className="flex-1 text-center text-xl font-semibold text-gray-900">
            Chi tiết phòng
          </h1>

          <div className="flex-1" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          {/* Mode */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div className="text-sm text-gray-600">
              Chế độ:{" "}
              <span
                className={`px-2 py-1 rounded-full border text-xs font-semibold ${
                  isEditing
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {isEditing ? "Đang chỉnh sửa" : "Chỉ xem"}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${readonlyCls}`}>
            <Field label="Số phòng" required>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                disabled={!isEditing}
                inputMode="numeric"
                placeholder="VD: 101"
              />
            </Field>

            <Field label="Loại phòng" required>
              <input
                name="room_type"
                value={form.room_type}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                disabled={!isEditing}
                placeholder="VD: Standard"
              />
            </Field>

            <Field label="Số khách tối đa" required>
              <input
                name="number_of_guests"
                value={form.number_of_guests}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly}`}
                disabled={!isEditing}
                inputMode="numeric"
                placeholder="VD: 2"
              />
            </Field>

            <Field label="Giá" required>
              {isEditing ? (
                <input
                  name="price"
                  value={form.price}
                  onChange={handlePriceChange}
                  className={`${inputBase} ${inputReadonly}`}
                  inputMode="numeric"
                  placeholder="VD: 7200000"
                />
              ) : (
                <div className={`${inputBase} ${inputReadonly} flex items-center`}>
                  <span className="font-semibold text-orange-600">
                    {priceDisplay}
                  </span>
                </div>
              )}
              {isEditing ? (
                <div className="text-xs text-gray-500 mt-1">
                  Xem trước: <span className="font-medium">{priceDisplay}</span>
                </div>
              ) : null}
            </Field>

            <Field label="Mô tả" className="md:col-span-2">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`${inputBase} ${inputReadonly} min-h-[120px]`}
                disabled={!isEditing}
                placeholder="Nhập mô tả..."
              />
            </Field>
          </div>

          {/* Images */}
          <div className="mt-8 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SingleImage
              title="Ảnh giường (bedFile)"
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
              title="Ảnh WC (wcFile)"
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
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={onCancel}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border hover:bg-gray-50 disabled:opacity-60"
                >
                  Huỷ
                </button>

                <button
                  onClick={onSave}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Lưu"}
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
            Bắt buộc
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SingleImage({
  title,
  preview,
  onPick,
  onClear,
  inputRef,
  onChange,
  disabled,
}) {
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
            Chọn
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
            Xoá
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
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
