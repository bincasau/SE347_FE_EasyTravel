import { useRef, useState } from "react";
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

export default function HotelsImportExcelButton({
  onImported,
  defaultManagerUsername = "", // nếu excel không có cột ManagerUsername
  className = "px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition disabled:opacity-60",
}) {
  const inputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const pickFile = () => inputRef.current?.click();

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheetName = wb.SheetNames?.[0];
      if (!sheetName) throw new Error("Excel không có sheet.");

      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      if (!rows.length) throw new Error("File rỗng.");

      let ok = 0;
      let fail = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const { hotelData, managerUsername } = mapRowToAddHotel(row);

        const finalManagerUsername = managerUsername || defaultManagerUsername;

        if (!hotelData.name || !hotelData.address) {
          fail++;
          errors.push(`Row ${i + 2}: thiếu Name/Address`);
          continue;
        }

        if (!finalManagerUsername) {
          fail++;
          errors.push(
            `Row ${
              i + 2
            }: thiếu ManagerUsername (và defaultManagerUsername đang rỗng)`
          );
          continue;
        }

        try {
          await addHotel({
            hotelData,
            imageFile: null, 
            managerUsername: finalManagerUsername,
          });
          ok++;
        } catch (err) {
          fail++;
          errors.push(`Row ${i + 2}: ${err?.message || "Import failed"}`);
        }
      }

      alert(
        errors.length
          ? `Import xong: ${ok} OK, ${fail} FAIL\n\n${errors
              .slice(0, 10)
              .join("\n")}`
          : `Import xong: ${ok} OK, ${fail} FAIL`
      );

      if (typeof onImported === "function") onImported({ ok, fail, errors });
    } catch (err) {
      alert(err?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
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
    </>
  );
}
