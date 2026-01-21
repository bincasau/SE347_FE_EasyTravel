// ✅ Date utility functions for tour filtering

export const pad2 = (n) => String(n).padStart(2, "0");

export const toYMDFromDateObj = (d) => {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
};

export const ymdToDMY = (ymd) => {
  if (!ymd) return "";
  const [y, m, d] = String(ymd).split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
};

export const dmyToYMD = (dmy) => {
  if (!dmy) return "";
  const s = String(dmy).trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);

  if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return "";

  return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
};

export const formatDMYInput = (value) => {
  if (!value) return value;
  const s = String(value).replaceAll("/", "");
  if (s.length <= 2) return s;
  if (s.length <= 4) return s.slice(0, 2) + "/" + s.slice(2);
  return s.slice(0, 2) + "/" + s.slice(2, 4) + "/" + s.slice(4, 8);
};

export const startOfDayTs = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const compareYMD = (a, b) => {
  const aa = Date.parse(a) || 0;
  const bb = Date.parse(b) || 0;
  return aa - bb;
};

export const addMonths = (dateObj, delta) =>
  new Date(dateObj.getFullYear(), dateObj.getMonth() + delta, 1);

export const monthLabel = (dateObj) =>
  dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });

export const daysInMonth = (y, mIndex) => new Date(y, mIndex + 1, 0).getDate();

export const firstDayOfMonth = (y, mIndex) => new Date(y, mIndex, 1).getDay();
