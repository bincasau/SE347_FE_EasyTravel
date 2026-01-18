import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { addHotel } from "@/apis/Hotel";

function str(v) {
  return (v ?? "").toString().trim();
}

function toNumberSafe(v, fallback = 0) {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

function mapRowToAddHotel(row) {
  const hotelData = {
    name: str(row.Name ?? row.name),
    address: str(row.Address ?? row.address),
    phoneNumber: str(row.PhoneNumber ?? row.Phone ?? row.phoneNumber),
    email: str(row.Email ?? row.email),
    description: str(row.Description ?? row.description),
    minPrice: toNumberSafe(row.MinPrice ?? row.minPrice, 0),
  };

  const managerUsername = str(
    row.ManagerUsername ?? row.managerUsername ?? row.Manager ?? row.manager
  );

  return { hotelData, managerUsername };
}

/** concurrency limiter */
async function mapWithConcurrency(items, limit, mapper, onProgress) {
  const results = new Array(items.length);
  let i = 0;
  let done = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await mapper(items[idx], idx);
      done++;
      onProgress?.(done);
      // yield nhẹ để UI cập nhật mượt
      if (done % 10 === 0) await new Promise((r) => setTimeout(r, 0));
    }
  });

  await Promise.all(workers);
  return results;
}

function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
      />
    </svg>
  );
}

export default function HotelsImportExcelButton({
  onImported,
  defaultManagerUsername = "",
  className = "",
  // tuning
  concurrency = 4, // số request addHotel chạy đồng thời
  maxErrorsShown = 10,
}) {
  const inputRef = useRef(null);
  const abortRef = useRef({ aborted: false });

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({
    phase: "idle", // idle | reading | importing | done
    done: 0,
    total: 0,
    ok: 0,
    fail: 0,
  });

  const percent = useMemo(() => {
    if (!progress.total) return 0;
    return Math.round((progress.done / progress.total) * 100);
  }, [progress.done, progress.total]);

  const pickFile = () => inputRef.current?.click();

  const cancelImport = () => {
    abortRef.current.aborted = true;
  };

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    abortRef.current.aborted = false;

    setImporting(true);
    setProgress({ phase: "reading", done: 0, total: 0, ok: 0, fail: 0 });

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const firstSheetName = wb.SheetNames?.[0];
      if (!firstSheetName) throw new Error("Excel không có sheet.");

      const ws = wb.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      if (!rows.length) throw new Error("File rỗng.");

      const errors = [];
      const tasks = rows.map((row, idx) => ({ row, idx }));

      setProgress((p) => ({
        ...p,
        phase: "importing",
        total: tasks.length,
        done: 0,
        ok: 0,
        fail: 0,
      }));

      // mapper: import từng row
      const results = await mapWithConcurrency(
        tasks,
        concurrency,
        async ({ row, idx }) => {
          if (abortRef.current.aborted) return { idx, status: "aborted" };

          const { hotelData, managerUsername } = mapRowToAddHotel(row);
          const finalManagerUsername = managerUsername || defaultManagerUsername;

          // validate
          if (!hotelData.name || !hotelData.address) {
            return { idx, status: "fail", message: `Row ${idx + 2}: thiếu Name/Address` };
          }
          if (!finalManagerUsername) {
            return {
              idx,
              status: "fail",
              message: `Row ${idx + 2}: thiếu ManagerUsername (và defaultManagerUsername đang rỗng)`,
            };
          }

          try {
            await addHotel({
              hotelData,
              imageFile: null,
              managerUsername: finalManagerUsername,
            });
            return { idx, status: "ok" };
          } catch (err) {
            return {
              idx,
              status: "fail",
              message: `Row ${idx + 2}: ${err?.message || "Import failed"}`,
            };
          }
        },
        (done) => {
          // cập nhật done (ok/fail update sau)
          setProgress((p) => ({ ...p, done }));
        }
      );

      // tổng hợp kết quả
      let ok = 0;
      let fail = 0;

      for (const r of results) {
        if (!r) continue;
        if (r.status === "ok") ok++;
        else if (r.status === "fail") {
          fail++;
          if (r.message) errors.push(r.message);
        }
      }

      // nếu aborted: thông báo khác chút
      const aborted = abortRef.current.aborted;

      setProgress((p) => ({
        ...p,
        phase: "done",
        ok,
        fail,
      }));

      alert(
        aborted
          ? `Đã hủy import.\nĐã xử lý: ${ok + fail}/${tasks.length}\nOK: ${ok}, FAIL: ${fail}` +
              (errors.length ? `\n\nLỗi (tối đa ${maxErrorsShown}):\n${errors.slice(0, maxErrorsShown).join("\n")}` : "")
          : errors.length
          ? `Import xong: ${ok} OK, ${fail} FAIL\n\nLỗi (tối đa ${maxErrorsShown}):\n${errors
              .slice(0, maxErrorsShown)
              .join("\n")}`
          : `Import xong: ${ok} OK, ${fail} FAIL`
      );

      if (typeof onImported === "function") onImported({ ok, fail, errors });
    } catch (err) {
      alert(err?.message || "Import failed");
    } finally {
      setImporting(false);
      abortRef.current.aborted = false;
    }
  };

  const baseClass =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-60 disabled:cursor-not-allowed " +
    "px-4 py-2 sm:px-5 sm:py-2.5 " +
    "w-full sm:w-auto " +
    "bg-purple-600 text-white hover:bg-purple-700 " +
    "text-sm sm:text-base";

  const label = importing
    ? progress.phase === "reading"
      ? "Reading file..."
      : `Importing... ${percent}% (${progress.done}/${progress.total})`
    : "Import Excel";

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={onPick}
      />

      <div className="w-full flex flex-col sm:flex-row gap-2 sm:items-center">
        <button onClick={pickFile} disabled={importing} className={`${baseClass} ${className}`}>
          {importing ? <Spinner /> : null}
          <span className="truncate max-w-[24ch] sm:max-w-none">{label}</span>
        </button>

        {importing ? (
          <button
            type="button"
            onClick={cancelImport}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base border border-purple-300 hover:bg-purple-50"
          >
            Cancel
          </button>
        ) : null}
      </div>

      {importing && progress.phase === "importing" ? (
        <div className="mt-2 w-full">
          <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-1 text-xs text-gray-600">
            OK: {progress.ok} • FAIL: {progress.fail}
          </div>
        </div>
      ) : null}
    </>
  );
}
