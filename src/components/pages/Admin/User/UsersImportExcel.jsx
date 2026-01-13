import * as XLSX from "xlsx";
import { adminCreateUser } from "@/apis/User";

function normalizeDateCell(v) {
  if (!v) return "";
  if (typeof v === "string") return v.slice(0, 10);

  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const yyyy = v.getFullYear();
    const mm = String(v.getMonth() + 1).padStart(2, "0");
    const dd = String(v.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

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

function str(v) {
  return (v ?? "").toString().trim();
}


export async function importUsersExcel(file, opts = {}) {
  const {
    defaultRole = "CUSTOMER",
    defaultStatus = "Activated",
    defaultPassword = "12345678",
    onProgress,
  } = opts;

  if (!file) throw new Error("No file selected");

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
    const r = rows[i];

    const payload = {
      name: str(r.Name ?? r.name),
      username: str(r.Username ?? r.username),
      email: str(r.Email ?? r.email),
      phoneNumber: str(r.PhoneNumber ?? r.Phone ?? r.phoneNumber),
      address: str(r.Address ?? r.address),
      dob: normalizeDateCell(r.DOB ?? r.dob) || null,
      gender: str(r.Gender ?? r.gender) || "M",
      role: str(r.Role ?? r.role) || defaultRole,
      status: str(r.Status ?? r.status) || defaultStatus,
      avatar: str(r.Avatar ?? r.avatar) || "user_default.jpg",
      password: str(r.Password ?? r.password) || defaultPassword,
    };

    if (!payload.name || !payload.username || !payload.email) {
      fail++;
      errors.push(`Row ${i + 2}: thiếu Name/Username/Email`);
      continue;
    }

    if (!payload.password) {
      fail++;
      errors.push(
        `Row ${i + 2}: thiếu Password (và defaultPassword đang rỗng)`
      );
      continue;
    }

    try {
      await adminCreateUser(payload, null);
      ok++;
    } catch (err) {
      fail++;
      errors.push(`Row ${i + 2}: ${err?.message || "Create failed"}`);
    }

    if (typeof onProgress === "function") {
      onProgress({ index: i + 1, total: rows.length, ok, fail });
    }
  }

  return { ok, fail, errors, total: rows.length };
}
