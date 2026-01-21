import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { popup } from "@/utils/popup";
import { getToken } from "@/utils/auth";

const API_BASE = "http://localhost:8080";
const MY_HOTEL_URL = `${API_BASE}/hotel_manager/my-hotel`;
const CREATE_ROOM_URL = `${API_BASE}/hotel_manager/rooms`;

function readResponseSmart(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json().catch(() => res.text());
  return res.text();
}

function extractHotelId(raw) {
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

function cleanNumberString(v) {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  if (!s) return "";
  return s.replace(/[^\d]/g, "");
}

export default function AddRoom() {
  const navigate = useNavigate();

  const token = getToken();

  const [hotelId, setHotelId] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [hotelError, setHotelError] = useState("");

  // UI form (snake_case)
  const [form, setForm] = useState({
    room_id: "",
    room_number: "",
    room_type: "",
    number_of_guests: "",
    price: "",
    description: "",
    image_bed: "",
    image_wc: "",
  });

  // ✅ Single create images
  const [bedFile, setBedFile] = useState(null);
  const [bedPreview, setBedPreview] = useState("");
  const [wcFile, setWcFile] = useState(null);
  const [wcPreview, setWcPreview] = useState("");

  // ✅ Bulk default images
  const [bulkBedFile, setBulkBedFile] = useState(null);
  const [bulkBedPreview, setBulkBedPreview] = useState("");
  const [bulkWcFile, setBulkWcFile] = useState(null);
  const [bulkWcPreview, setBulkWcPreview] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const excelInputRef = useRef(null);

  const bedInputRef = useRef(null);
  const wcInputRef = useRef(null);

  const bulkBedInputRef = useRef(null);
  const bulkWcInputRef = useRef(null);

  // ✅ Excel rows preview
  const [excelRows, setExcelRows] = useState([]);
  const isBulkMode = excelRows.length > 0;

  /** ===== 1) Fetch hotelId ===== */
  const fetchMyHotel = useCallback(async () => {
    const url = `${MY_HOTEL_URL}?_t=${Date.now()}`;
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    const raw = await readResponseSmart(res);
    console.log("[AddRoom] GET my-hotel", {
      url,
      status: res.status,
      ok: res.ok,
      raw,
    });

    if (!res.ok) throw new Error(`Fetch /my-hotel failed (${res.status})`);

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
  const setField = (key, value) =>
    setForm((p) => ({ ...p, [key]: value ?? "" }));
  const handleChange = (e) => setField(e.target.name, e.target.value);

  /** ===== 3) Excel import ===== */
  const normalizedHeaders = useMemo(
    () => ({
      room_id: ["room_id", "id", "roomid"],
      description: ["description", "desc", "details"],
      image_bed: ["image_bed", "bed_image", "bed", "image bed"],
      image_wc: ["image_wc", "wc_image", "toilet", "image wc"],
      number_of_guests: [
        "number_of_guest",
        "number_of_guests",
        "guests",
        "guest",
        "max_guests",
      ],
      price: ["price", "room_price", "cost"],
      room_number: ["room_number", "roomnumber", "room no", "room_no", "number"],
      room_type: ["room_type", "roomtype", "type"],
    }),
    []
  );

  const handlePickExcel = () => excelInputRef.current?.click();

  const findHeaderKey = (headerRaw) => {
    const h = String(headerRaw ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[_-]/g, "_");

    for (const targetKey of Object.keys(normalizedHeaders)) {
      if (normalizedHeaders[targetKey].includes(h)) return targetKey;
    }

    if (h.includes("room") && h.includes("number")) return "room_number";
    if (h.includes("room") && h.includes("type")) return "room_type";
    if (h.includes("guest")) return "number_of_guests";
    if (h.includes("price")) return "price";
    if (h.includes("image") && h.includes("bed")) return "image_bed";
    if (h.includes("image") && (h.includes("wc") || h.includes("toilet")))
      return "image_wc";
    if (h.includes("desc")) return "description";
    if (h.includes("id")) return "room_id";
    return null;
  };

  const resetBulkState = () => {
    setExcelRows([]);
    setBulkBedFile(null);
    setBulkWcFile(null);
    if (bulkBedPreview) URL.revokeObjectURL(bulkBedPreview);
    if (bulkWcPreview) URL.revokeObjectURL(bulkWcPreview);
    setBulkBedPreview("");
    setBulkWcPreview("");
  };

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

  const clearBed = () =>
    setSingleImage(null, setBedFile, bedPreview, setBedPreview);
  const clearWc = () =>
    setSingleImage(null, setWcFile, wcPreview, setWcPreview);

  const clearBulkBed = () =>
    setSingleImage(null, setBulkBedFile, bulkBedPreview, setBulkBedPreview);
  const clearBulkWc = () =>
    setSingleImage(null, setBulkWcFile, bulkWcPreview, setBulkWcPreview);

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
        throw new Error(
          "Excel must contain a header row and at least one data row."
        );
      }

      const headerRow = rows[0];

      const colIndexByField = {};
      headerRow.forEach((h, idx) => {
        const key = findHeaderKey(h);
        if (key) colIndexByField[key] = idx;
      });

      const parsed = rows
        .slice(1)
        .map((row) => {
          const rec = {
            room_id: "",
            room_number: "",
            room_type: "",
            number_of_guests: "",
            price: "",
            description: "",
            image_bed: "",
            image_wc: "",
          };

          Object.keys(rec).forEach((field) => {
            const idx = colIndexByField[field];
            if (idx === undefined) return;

            const value = row?.[idx];

            if (
              field === "price" ||
              field === "number_of_guests" ||
              field === "room_number" ||
              field === "room_id"
            ) {
              rec[field] = cleanNumberString(value);
              return;
            }

            rec[field] =
              value === null || value === undefined ? "" : String(value).trim();
          });

          if (!String(rec.room_number || "").trim()) return null;
          return rec;
        })
        .filter(Boolean);

      if (parsed.length === 0) throw new Error("No valid rows found in Excel.");

      setExcelRows(parsed);
      setForm((prev) => ({ ...prev, ...parsed[0] }));

      clearBed();
      clearWc();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      popup.error(err?.message || "Import failed. Please check your Excel format.");
    } finally {
      e.target.value = "";
    }
  };

  /** ===== 4) Image pickers ===== */
  const pickBed = () => bedInputRef.current?.click();
  const pickWc = () => wcInputRef.current?.click();
  const pickBulkBed = () => bulkBedInputRef.current?.click();
  const pickBulkWc = () => bulkWcInputRef.current?.click();

  /** ===== 5) Validate ===== */
  const validateOne = (payload) => {
    if (loadingHotel) return "Đang lấy hotelId...";
    if (hotelError) return hotelError;
    if (!hotelId) return "Không lấy được hotelId";

    if (!String(payload.room_number).trim()) return "Room number is required.";
    if (!String(payload.room_type).trim()) return "Room type is required.";
    if (!String(payload.number_of_guests).trim())
      return "Number of guests is required.";
    if (!String(payload.price).trim()) return "Price is required.";
    return null;
  };

  /** ===== 6) Build FormData ===== */
  const buildFormData = (
    { room_number, room_type, number_of_guests, price, description },
    bed,
    wc
  ) => {
    const roomPayload = {
      roomNumber: Number(cleanNumberString(room_number)),
      roomType: String(room_type).trim(),
      numberOfGuest: Number(cleanNumberString(number_of_guests)),
      price: Number(cleanNumberString(price)),
      desc: String(description || "").trim(),
      hotel: { hotelId: Number(hotelId) },
    };

    const fd = new FormData();
    fd.append(
      "room",
      new Blob([JSON.stringify(roomPayload)], { type: "application/json" })
    );
    if (bed) fd.append("bedFile", bed);
    if (wc) fd.append("wcFile", wc);
    return fd;
  };

  /** ===== 7) Submit single ===== */
  const handleSubmit = async () => {
    const err = validateOne(form);
    if (err) return popup.error(err);

    if (isBulkMode) {
      return popup.error(
        "Bạn đã import Excel rồi. Hãy dùng Bulk Create ở trên để tạo hàng loạt."
      );
    }

    if (!bedFile || !wcFile) {
      return popup.error("Single add cần chọn Bed Image và WC Image.");
    }

    const fd = buildFormData(form, bedFile, wcFile);

    try {
      setSubmitting(true);

      const res = await fetch(CREATE_ROOM_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
          `POST /rooms failed (${res.status}) - ${
            typeof raw === "string" ? raw : JSON.stringify(raw)
          }`
        );
      }

      await popup.success("Add room success!");
      navigate(-1);
    } catch (e) {
      popup.error(e?.message || "Add room failed");
    } finally {
      setSubmitting(false);
    }
  };

  /** ===== 8) Bulk create from Excel ===== */
  const handleBulkCreate = async () => {
    if (!excelRows.length) return popup.error("Bạn chưa import Excel.");
    if (!bulkBedFile || !bulkWcFile) {
      return popup.error("Bulk create cần chọn Default Bed Image và Default WC Image.");
    }
    if (!hotelId) return popup.error("Chưa có hotelId.");

    const ok = await popup.confirm(
      `Create ${excelRows.length} rooms from Excel?`,
      "Bulk Create"
    );
    if (!ok) return;

    try {
      setSubmitting(true);

      let success = 0;
      let fail = 0;

      for (let i = 0; i < excelRows.length; i++) {
        const r = excelRows[i];
        const err = validateOne(r);
        if (err) {
          fail++;
          console.warn("[Bulk] skip row invalid", { i, r, err });
          continue;
        }

        const fd = buildFormData(r, bulkBedFile, bulkWcFile);

        const res = await fetch(CREATE_ROOM_URL, {
          method: "POST",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: fd,
        });

        if (res.ok) {
          success++;
        } else {
          fail++;
          const raw = await readResponseSmart(res);
          console.warn("[Bulk] row failed", { i, status: res.status, raw, r });
        }
      }

      await popup.success(`Bulk done ✅ Success: ${success} | Failed: ${fail}`);
      resetBulkState();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      popup.error(e?.message || "Bulk create failed");
    } finally {
      setSubmitting(false);
    }
  };

  /** ===== Row actions ===== */
  const removeExcelRow = (idx) => {
    setExcelRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const useRow = (row) => {
    setForm((prev) => ({ ...prev, ...row }));
    window.scrollTo({ top: 0, behavior: "smooth" });
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

          <div className="flex-1 flex justify-end gap-2">
            <button
              onClick={handlePickExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Import Excel
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
              <span className="text-gray-500">
                Đang lấy thông tin khách sạn...
              </span>
            ) : hotelError ? (
              <span className="text-red-600">Lỗi: {hotelError}</span>
            ) : (
              <span className="text-gray-500"></span>
            )}
          </div>

          {/* ✅ BULK + LIST lên đầu */}
          {excelRows.length > 0 && (
            <div className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    Bulk create from Excel ({excelRows.length} rows)
                  </div>
                  <div className="text-sm text-gray-600">
                    Chọn ảnh mặc định (Bed/WC) rồi bấm Bulk Create.
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => resetBulkState()}
                    disabled={submitting}
                    className={[
                      "px-4 py-2 rounded-xl font-semibold border",
                      submitting
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    Clear Import
                  </button>

                  <button
                    onClick={handleBulkCreate}
                    disabled={submitting}
                    className={[
                      "px-4 py-2 rounded-xl font-semibold",
                      submitting
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white",
                    ].join(" ")}
                  >
                    Bulk Create
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <SingleImage
                  title="Default Bed Image (for bulk)"
                  preview={bulkBedPreview}
                  onPick={pickBulkBed}
                  onClear={clearBulkBed}
                  inputRef={bulkBedInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setSingleImage(
                      f,
                      setBulkBedFile,
                      bulkBedPreview,
                      setBulkBedPreview
                    );
                    e.target.value = "";
                  }}
                />

                <SingleImage
                  title="Default WC Image (for bulk)"
                  preview={bulkWcPreview}
                  onPick={pickBulkWc}
                  onClear={clearBulkWc}
                  inputRef={bulkWcInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setSingleImage(
                      f,
                      setBulkWcFile,
                      bulkWcPreview,
                      setBulkWcPreview
                    );
                    e.target.value = "";
                  }}
                />
              </div>

              {/* ✅ LIST rows + delete */}
              <div className="mt-4 bg-white border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div className="font-semibold">
                    Imported Rooms ({excelRows.length})
                  </div>
                  <div className="text-xs text-gray-500">
                    Click “Use” để đổ dữ liệu xuống form bên dưới.
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-3 text-left">room_number</th>
                        <th className="p-3 text-left">room_type</th>
                        <th className="p-3 text-left">guests</th>
                        <th className="p-3 text-left">price</th>
                        <th className="p-3 text-left">image_bed</th>
                        <th className="p-3 text-left">image_wc</th>
                        <th className="p-3 text-left">description</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelRows.map((r, idx) => (
                        <tr key={idx} className="border-t align-top">
                          <td className="p-3">{r.room_number}</td>
                          <td className="p-3">{r.room_type}</td>
                          <td className="p-3">{r.number_of_guests}</td>
                          <td className="p-3">{r.price}</td>
                          <td className="p-3">{r.image_bed}</td>
                          <td className="p-3">{r.image_wc}</td>
                          <td className="p-3 max-w-[420px]">
                            <div className="line-clamp-2">{r.description}</div>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              className="text-orange-600 hover:underline mr-3"
                              onClick={() => useRow(r)}
                            >
                              Use
                            </button>
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() => removeExcelRow(idx)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {excelRows.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="p-6 text-center text-gray-500"
                          >
                            No rows.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FORM */}
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
                placeholder="e.g. Standard"
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
                placeholder="e.g. 2,500,000"
                inputMode="numeric"
              />
              <div className="text-xs text-gray-500 mt-1">
                Bạn có thể nhập <b>2,500,000</b> hoặc <b>2500000</b> đều được.
              </div>
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

          {/* ✅ Single images: ẨN khi bulk mode */}
          {!isBulkMode && (
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
          )}

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
