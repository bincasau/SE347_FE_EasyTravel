import { useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AddRoom() {
  // ✅ get hotelId from route
  const { hotelId } = useParams(); // string
  const navigate = useNavigate(); // ✅ back

  const [form, setForm] = useState({
    room_number: "",
    room_type: "",
    number_of_guests: "",
    price: "",
    description: "",
  });

  // ✅ multiple images: bed & wc (separate)
  const [bedImages, setBedImages] = useState([]); // File[]
  const [bedPreviews, setBedPreviews] = useState([]); // string[]
  const [wcImages, setWcImages] = useState([]); // File[]
  const [wcPreviews, setWcPreviews] = useState([]); // string[]

  const excelInputRef = useRef(null);
  const bedInputRef = useRef(null);
  const wcInputRef = useRef(null);

  // ✅ excel header mapping (NO hotel_id)
  const normalizedHeaders = useMemo(
    () => ({
      room_number: ["room_number", "roomnumber", "room no", "room_no", "number"],
      room_type: ["room_type", "roomtype", "type"],
      number_of_guests: [
        "number_of_guests",
        "guests",
        "guest",
        "max_guests",
        "max guests",
      ],
      price: ["price", "room_price", "cost"],
      description: ["description", "desc", "details"],
    }),
    []
  );

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value ?? "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

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
        throw new Error(
          "Excel must contain a header row and at least one data row."
        );
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

  // ✅ image helpers (bed/wc)
  const pickBedImages = () => bedInputRef.current?.click();
  const pickWcImages = () => wcInputRef.current?.click();

  const addImages = (files, setFiles, setUrls) => {
    const arr = Array.from(files || []);
    if (arr.length === 0) return;

    setFiles((prev) => [...prev, ...arr]);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setUrls((prev) => [...prev, ...urls]);
  };

  const removeAt = (idx, setFiles, previews, setPreviews) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const clearAll = (filesSetter, previews, previewsSetter) => {
    previews.forEach((u) => URL.revokeObjectURL(u));
    filesSetter([]);
    previewsSetter([]);
  };

  const validate = () => {
    if (!hotelId) return "Missing hotelId in URL.";
    if (!form.room_number.trim()) return "Room number is required.";
    if (!form.room_type.trim()) return "Room type is required.";
    if (!String(form.number_of_guests).trim())
      return "Number of guests is required.";
    if (!String(form.price).trim()) return "Price is required.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return alert(err);

    const payload = {
      hotel_id: Number(hotelId), // ✅ auto
      ...form,
      number_of_guests: Number(form.number_of_guests),
      price: Number(form.price),
    };

    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));

    // ✅ backend receives multiple images
    bedImages.forEach((f) => fd.append("image_bed", f));
    wcImages.forEach((f) => fd.append("image_wc", f));

    // TODO: call API
    // await axios.post("/api/rooms", fd, { headers: { "Content-Type": "multipart/form-data" } });

    console.log("Submit room:", payload);
    console.log("Bed images:", bedImages);
    console.log("WC images:", wcImages);
    alert("Add room submitted (check console).");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          {/* ✅ Back button */}
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

      {/* Form */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Room Number" required>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="e.g. A101"
              />
            </Field>

            <Field label="Room Type" required>
              <input
                name="room_type"
                value={form.room_type}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="e.g. Deluxe, Standard..."
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
                placeholder="e.g. 59.99"
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

          {/* Upload images at bottom */}
          <div className="mt-8 border-t pt-6 space-y-6">
            <ImageSection
              title="Upload Bed Images"
              subtitle='Will be uploaded as "image_bed[]"'
              pickLabel="Choose Bed Images"
              onPick={pickBedImages}
              onClear={() => clearAll(setBedImages, bedPreviews, setBedPreviews)}
              previews={bedPreviews}
              onRemove={(idx) =>
                removeAt(idx, setBedImages, bedPreviews, setBedPreviews)
              }
              inputRef={bedInputRef}
              onChange={(e) => {
                addImages(e.target.files, setBedImages, setBedPreviews);
                e.target.value = "";
              }}
            />

            <ImageSection
              title="Upload WC Images"
              subtitle='Will be uploaded as "image_wc[]"'
              pickLabel="Choose WC Images"
              onPick={pickWcImages}
              onClear={() => clearAll(setWcImages, wcPreviews, setWcPreviews)}
              previews={wcPreviews}
              onRemove={(idx) =>
                removeAt(idx, setWcImages, wcPreviews, setWcPreviews)
              }
              inputRef={wcInputRef}
              onChange={(e) => {
                addImages(e.target.files, setWcImages, setWcPreviews);
                e.target.value = "";
              }}
            />

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium">Excel format:</span> headers like{" "}
          <code>room_number, room_type, number_of_guests, price, description</code>.
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
            className="border border-orange-500 text-orange-600 px-4 py-2 rounded-xl hover:bg-orange-50 font-medium"
          >
            {pickLabel}
          </button>

          {previews.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50"
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
        />
      </div>

      <div className="w-full mt-3">
        {previews.length === 0 ? (
          <div className="w-full h-[120px] rounded-xl border bg-gray-50 flex items-center justify-center">
            <span className="text-sm text-gray-400">No images selected</span>
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
                />
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/75"
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
