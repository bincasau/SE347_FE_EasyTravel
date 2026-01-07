import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const API_BASE = "http://localhost:8080";
const MY_HOTEL_URL = `${API_BASE}/hotel_manager/my-hotel`;
const CREATE_ROOM_URL = `${API_BASE}/hotel_manager/rooms`;

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function readResponseSmart(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json().catch(() => res.text());
  return res.text();
}

function extractHotelId(raw) {
  // tùy response BE bạn
  const id =
    raw?.hotelId ??
    raw?.hotel_id ??
    raw?.id ??
    raw?.hotel?.hotelId ??
    raw?.hotel?.hotel_id ??
    raw?.hotel?.id;

  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function AddRoom() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const [hotelId, setHotelId] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [hotelError, setHotelError] = useState("");

  // UI form (snake_case) nhưng khi gửi lên BE sẽ map sang camelCase theo entity
  const [form, setForm] = useState({
    room_number: "",
    room_type: "",
    number_of_guests: "",
    price: "",
    description: "",
  });

  // ✅ BE đang yêu cầu 2 file: bedFile, wcFile (mỗi loại 1 file)
  const [bedFile, setBedFile] = useState(null);
  const [bedPreview, setBedPreview] = useState("");
  const [wcFile, setWcFile] = useState(null);
  const [wcPreview, setWcPreview] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const excelInputRef = useRef(null);
  const bedInputRef = useRef(null);
  const wcInputRef = useRef(null);

  /** ===== 1) Fetch hotelId từ /hotel_manager/my-hotel ===== */
  const fetchMyHotel = useCallback(async () => {
    if (!token) throw new Error("NO_TOKEN (Bạn chưa đăng nhập)");

    const url = `${MY_HOTEL_URL}?_t=${Date.now()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const raw = await readResponseSmart(res);
    console.log("[AddRoom] GET my-hotel", { url, status: res.status, ok: res.ok, raw });

    if (!res.ok) {
      throw new Error(`Fetch /my-hotel failed (${res.status})`);
    }

    const id = extractHotelId(raw);
    if (!id) throw new Error("Không lấy được hotelId từ /my-hotel");
    return id;
  }, [token]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingHotel(true);
        setHotelError("");

        const id = await fetchMyHotel();
        if (alive) setHotelId(id);
      } catch (e) {
        if (alive) {
          setHotelId(null);
          setHotelError(e?.message || "Fetch /my-hotel failed");
        }
      } finally {
        if (alive) setLoadingHotel(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [fetchMyHotel]);

  /** ===== 2) Form helpers ===== */
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value ?? "" }));
  const handleChange = (e) => setField(e.target.name, e.target.value);

  /** ===== 3) Excel import (optional) ===== */
  const normalizedHeaders = useMemo(
    () => ({
      room_number: ["room_number", "roomnumber", "room no", "room_no", "number"],
      room_type: ["room_type", "roomtype", "type"],
      number_of_guests: ["number_of_guests", "guests", "guest", "max_guests", "max guests"],
      price: ["price", "room_price", "cost"],
      description: ["description", "desc", "details"],
    }),
    []
  );

  const handlePickExcel = () => excelInputRef.current?.click();

  const findHeaderKey = (headerRaw) => {
    const h = String(headerRaw ?? "").trim().toLowerCase();
    for (const targetKey of Object.keys(normalizedHeaders)) {
      if (normalizedHeaders[targetKey].includes(h)) return targetKey;
    }
    return null;
  };

  const handleExcelFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheetName = wb.SheetNames?.[0];
      if (!sheetName) throw new Error("No sheet found in Excel file.");

      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

      if (!rows || rows.length < 2) {
        throw new Error("Excel must contain a header row and at least one data row.");
      }

      const headerRow = rows[0];
      const dataRow = rows[1];

      const colIndexByField = {};
      headerRow.forEach((h, idx) => {
        const key = findHeaderKey(h);
        if (key) colIndexByField[key] = idx;
      });

      const next = { ...form };
      Object.keys(normalizedHeaders).forEach((field) => {
        const idx = colIndexByField[field];
        if (idx === undefined) return;

        const value = dataRow?.[idx];

        if (["number_of_guests", "price"].includes(field)) {
          next[field] =
            value === null || value === undefined || value === ""
              ? ""
              : String(value).replace(/[^\d.]/g, "");
          return;
        }

        next[field] = value === null || value === undefined ? "" : String(value);
      });

      setForm(next);
    } catch (err) {
      alert(err?.message || "Import failed. Please check your Excel format.");
    } finally {
      e.target.value = "";
    }
  };

  /** ===== 4) Image pickers (single file each) ===== */
  const pickBed = () => bedInputRef.current?.click();
  const pickWc = () => wcInputRef.current?.click();

  const setSingleImage = (file, setFile, preview, setPreview) => {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setFile(null);
      setPreview("");
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearBed = () => setSingleImage(null, setBedFile, bedPreview, setBedPreview);
  const clearWc = () => setSingleImage(null, setWcFile, wcPreview, setWcPreview);

  /** ===== 5) Validate ===== */
  const validate = () => {
    if (!token) return "NO_TOKEN (Bạn chưa đăng nhập)";
    if (loadingHotel) return "Đang lấy hotelId...";
    if (hotelError) return hotelError;
    if (!hotelId) return "Không lấy được hotelId";

    if (!String(form.room_number).trim()) return "Room number is required.";
    if (!String(form.room_type).trim()) return "Room type is required.";
    if (!String(form.number_of_guests).trim()) return "Number of guests is required.";
    if (!String(form.price).trim()) return "Price is required.";
    return null;
  };

  /** ===== 6) Submit: đúng @RequestPart("room") Room + bedFile + wcFile ===== */
  const handleSubmit = async () => {
    const err = validate();
    if (err) return alert(err);

    // ✅ map đúng field của entity Room (camelCase)
    const roomPayload = {
      roomNumber: Number(form.room_number),
      roomType: String(form.room_type).trim(),
      numberOfGuest: Number(form.number_of_guests),
      price: Number(form.price),
      desc: String(form.description || "").trim(),
      hotel: { hotelId: Number(hotelId) }, // ✅ quan trọng: entity có Hotel hotel
    };

    const fd = new FormData();

    // ✅ Spring @RequestPart("room") Room room => phải gửi JSON part
    fd.append("room", new Blob([JSON.stringify(roomPayload)], { type: "application/json" }));

    // ✅ đúng key backend yêu cầu
    if (bedFile) fd.append("bedFile", bedFile);
    if (wcFile) fd.append("wcFile", wcFile);

    try {
      setSubmitting(true);

      const res = await fetch(CREATE_ROOM_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ không set Content-Type khi dùng FormData
        },
        body: fd,
      });

      const raw = await readResponseSmart(res);
      console.log("[AddRoom] POST rooms", {
        url: CREATE_ROOM_URL,
        status: res.status,
        ok: res.ok,
        raw,
      });

      if (!res.ok) {
        throw new Error(
          `POST /rooms failed (${res.status}) - ${typeof raw === "string" ? raw : JSON.stringify(raw)}`
        );
      }

      alert("Add room success!");
      navigate(-1);
    } catch (e) {
      alert(e?.message || "Add room failed");
    } finally {
      setSubmitting(false);
    }
  };

  /** ===== UI ===== */
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <div className="flex-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium"
            >
              ← Back
            </button>
          </div>

          <h1 className="flex-1 text-center text-xl font-semibold text-gray-900">
            Add Room
          </h1>

          <div className="flex-1 flex justify-end">
            <button
              onClick={handlePickExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Import from Excel
            </button>

            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleExcelFile}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="mb-3 text-sm">
            {loadingHotel ? (
              <span className="text-gray-500">Đang lấy thông tin khách sạn...</span>
            ) : hotelError ? (
              <span className="text-red-600">Lỗi: {hotelError}</span>
            ) : (
              <span className="text-gray-500">Hotel loaded.</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Room Number" required>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="e.g. 101"
                inputMode="numeric"
              />
            </Field>

            <Field label="Room Type" required>
              <input
                name="room_type"
                value={form.room_type}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="e.g. Deluxe"
              />
            </Field>

            <Field label="Number of Guests" required>
              <input
                name="number_of_guests"
                value={form.number_of_guests}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="e.g. 2"
                inputMode="numeric"
              />
            </Field>

            <Field label="Price" required>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="e.g. 590000"
                inputMode="decimal"
              />
            </Field>

            <Field label="Description" className="md:col-span-2">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 min-h-[120px]"
                placeholder="Room description..."
              />
            </Field>
          </div>

          {/* images */}
          <div className="mt-8 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SingleImage
              title="Bed Image (bedFile)"
              preview={bedPreview}
              onPick={pickBed}
              onClear={clearBed}
              inputRef={bedInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setSingleImage(f, setBedFile, bedPreview, setBedPreview);
                e.target.value = "";
              }}
            />

            <SingleImage
              title="WC Image (wcFile)"
              preview={wcPreview}
              onPick={pickWc}
              onClear={clearWc}
              inputRef={wcInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setSingleImage(f, setWcFile, wcPreview, setWcPreview);
                e.target.value = "";
              }}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || loadingHotel}
              className={[
                "px-6 py-2.5 rounded-xl font-semibold shadow",
                submitting || loadingHotel
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white",
              ].join(" ")}
            >
              {submitting ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium">Excel format:</span>{" "}
          <code>room_number, room_type, number_of_guests, price, description</code>
        </div>
      </div>
    </div>
  );
}

/** ===== components ===== */
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

function SingleImage({ title, preview, onPick, onClear, inputRef, onChange }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-gray-900">{title}</div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPick}
            className="border border-orange-500 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 font-medium"
          >
            Choose
          </button>

          {preview && (
            <button
              type="button"
              onClick={onClear}
              className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Clear
            </button>
          )}
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
        {!preview ? (
          <div className="h-[140px] rounded-lg border bg-white flex items-center justify-center text-sm text-gray-400">
            No image selected
          </div>
        ) : (
          <img
            src={preview}
            alt="preview"
            className="w-full h-[140px] object-cover rounded-lg border bg-white"
          />
        )}
      </div>
    </div>
  );
}
