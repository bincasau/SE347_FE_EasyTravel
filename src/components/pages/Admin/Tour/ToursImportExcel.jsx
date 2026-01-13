import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { saveTourUpsert } from "@/apis/Tour";

function toNumberSafe(v, fallback = 0) {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

function normalizeDateCell(v) {
  if (!v) return "";
  // đã là string yyyy-mm-dd
  if (typeof v === "string") return v.slice(0, 10);

  // Excel date object (khi cellDates:true)
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const yyyy = v.getFullYear();
    const mm = String(v.getMonth() + 1).padStart(2, "0");
    const dd = String(v.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Excel serial number
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return "";
    const yyyy = d.y;
    const mm = String(d.m).padStart(2, "0");
    const dd = String(d.d).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return String(v).slice(0, 10);
}

/**
 * Expect columns like export:
 * Title, LinkVideo, Description, PriceAdult, PriceChild, DiscountPercent,
 * DurationDays, StartDate, EndDate, DepartureLocation, Destination,
 * AvailableSeats, LimitSeats, MainImage, Status, CreatedAt
 *
 * Optional: TourGuideId (nếu có)
 */
function mapRowToPayload(row, defaultGuideId) {
  const payload = {
    title: row.Title ?? row.title ?? "",
    linkVideo: row.LinkVideo ?? row.linkVideo ?? "",
    description: row.Description ?? row.description ?? "",
    priceAdult: toNumberSafe(row.PriceAdult ?? row.priceAdult, 0),
    priceChild: toNumberSafe(row.PriceChild ?? row.priceChild, 0),
    percentDiscount: toNumberSafe(
      row.DiscountPercent ?? row.percentDiscount ?? row.PercentDiscount,
      0
    ),
    durationDays: toNumberSafe(row.DurationDays ?? row.durationDays, 1),
    startDate: normalizeDateCell(row.StartDate ?? row.startDate),
    endDate: normalizeDateCell(row.EndDate ?? row.endDate),
    departureLocation: row.DepartureLocation ?? row.departureLocation ?? "",
    destination: row.Destination ?? row.destination ?? "",
    availableSeats: toNumberSafe(row.AvailableSeats ?? row.availableSeats, 0),
    limitSeats: toNumberSafe(row.LimitSeats ?? row.limitSeats, 0),
    mainImage: row.MainImage ?? row.mainImage ?? "",
    status: row.Status ?? row.status ?? "Pending",

    // lấy TourGuideId nếu có trong file, không có thì dùng default
    tourGuideId: toNumberSafe(
      row.TourGuideId ?? row.tourGuideId ?? defaultGuideId,
      0
    ),
  };

  // không cho gửi createdAt từ excel (backend tự set)
  delete payload.createdAt;

  return payload;
}

export default function ImportToursExcelButton({
  defaultGuideId = 0,
  className = "px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-60",
  onDone,
}) {
  const inputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");

  const pickFile = () => inputRef.current?.click();

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // để chọn lại cùng 1 file vẫn trigger
    if (!file) return;

    setMsg("");
    setImporting(true);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });

      const sheetName = wb.SheetNames?.[0];
      if (!sheetName) throw new Error("Excel không có sheet nào.");

      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (!rows.length) throw new Error("File rỗng, không có dòng dữ liệu.");

      // tạo tour hàng loạt (chạy tuần tự để đỡ spam backend)
      let ok = 0;
      let fail = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const payload = mapRowToPayload(r, defaultGuideId);
        const guideId = toNumberSafe(payload.tourGuideId, 0);

        // guideId bắt buộc (vì upsert của bạn đang yêu cầu)
        if (!guideId) {
          fail += 1;
          errors.push(
            `Row ${i + 2}: thiếu TourGuideId (hoặc defaultGuideId=0).`
          );
          continue;
        }

        try {
          await saveTourUpsert(payload, null, guideId);
          ok += 1;
        } catch (err) {
          fail += 1;
          errors.push(`Row ${i + 2}: ${err?.message || "Import thất bại."}`);
        }
      }

      const summary = `Import xong: ${ok} thành công, ${fail} thất bại.`;
      setMsg(
        errors.length ? `${summary}\n${errors.slice(0, 8).join("\n")}` : summary
      );

      if (typeof onDone === "function") onDone({ ok, fail, errors });
    } catch (err) {
      setMsg(err?.message || "Import thất bại.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={onPick}
      />

      <button onClick={pickFile} disabled={importing} className={className}>
        {importing ? "Importing..." : "Import Excel"}
      </button>

      {msg ? (
        <pre className="whitespace-pre-wrap text-sm p-3 rounded-xl border bg-white text-gray-700">
          {msg}
        </pre>
      ) : null}
    </div>
  );
}
