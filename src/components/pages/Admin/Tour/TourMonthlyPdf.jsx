import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getMonthlyTourStats } from "@/apis/Tour";

/* ===================== FORMAT HELPERS ===================== */

function formatNumber(n) {
  const v = Math.round(Number(n) || 0);
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatVND(n) {
  return `${formatNumber(n)} VND`;
}

function mapMonthlyToRow(dto, month, year) {
  return {
    Year: year,
    Month: month,
    TotalTours: dto?.totalTours ?? 0,
    ApprovedTours: dto?.passedTours ?? 0,
    ActivatedTours: dto?.activatedTours ?? 0,
    CancelledTours: dto?.cancelledTours ?? 0,
    TicketsSold: dto?.totalTicketsSold ?? 0,
    EmptySeats: dto?.totalEmptySeats ?? 0,
    Revenue: dto?.totalRevenue ?? 0,
  };
}

/* ===================== AUTOTABLE SAFE CALL ===================== */

function callAutoTable(doc, options) {
  if (typeof autoTable === "function") return autoTable(doc, options);
  if (autoTable?.default) return autoTable.default(doc, options);
  if (autoTable?.autoTable) return autoTable.autoTable(doc, options);
  throw new Error("autoTable import error");
}

/* ===================== BAR CHART ===================== */

function drawRevenueBarChart(doc, { x, y, w, h, revenues, title }) {
  const maxVal = Math.max(1, ...revenues.map((r) => Number(r.value) || 0));

  doc.setDrawColor(220);
  doc.roundedRect(x, y, w, h, 10, 10);

  doc.setFontSize(12);
  doc.text(title, x + 14, y + 22);

  const padL = 44,
    padR = 18,
    padT = 34,
    padB = 30;
  const cx = x + padL;
  const cy = y + padT;
  const cw = w - padL - padR;
  const ch = h - padT - padB;

  doc.setDrawColor(170);
  doc.line(cx, cy, cx, cy + ch);
  doc.line(cx, cy + ch, cx + cw, cy + ch);

  doc.setFontSize(8);
  doc.text(formatNumber(maxVal), cx - 8, cy + 3, { align: "right" });
  doc.text(formatNumber(maxVal / 2), cx - 8, cy + ch / 2 + 3, {
    align: "right",
  });
  doc.text("0", cx - 8, cy + ch + 3, { align: "right" });

  const step = cw / revenues.length;
  const barW = Math.max(6, step * 0.55);

  revenues.forEach((r, i) => {
    const v = Number(r.value) || 0;
    const barH = (v / maxVal) * ch;
    const bx = cx + i * step + (step - barW) / 2;
    const by = cy + ch - barH;

    doc.setFillColor(59, 130, 246);
    doc.roundedRect(bx, by, barW, barH, 3, 3, "F");

    doc.text(String(r.month), bx + barW / 2, cy + ch + 16, { align: "center" });
  });

  doc.setFontSize(8);
  doc.text("Unit: VND", x + w - 16, y + h - 10, { align: "right" });
}

/* ===================== MAIN EXPORT ===================== */

export async function exportTourMonthlyReportPdf(year, opts = {}) {
  const y = Number(year);
  if (!Number.isFinite(y)) throw new Error("Invalid year");

  const failedMonths = [];

  const results = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      getMonthlyTourStats(i + 1, y)
        .then((dto) => ({ month: i + 1, dto }))
        .catch(() => {
          failedMonths.push(i + 1);
          return { month: i + 1, dto: null };
        })
    )
  );

  const rows = results.map((r) => mapMonthlyToRow(r.dto, r.month, y));

  const total = rows.reduce(
    (a, r) => {
      Object.keys(a).forEach((k) => (a[k] += r[k] || 0));
      return a;
    },
    {
      TotalTours: 0,
      ApprovedTours: 0,
      ActivatedTours: 0,
      CancelledTours: 0,
      TicketsSold: 0,
      EmptySeats: 0,
      Revenue: 0,
    }
  );

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageW, 86, "F");

  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.text("MONTHLY TOUR REPORT", 40, 38);
  doc.setFontSize(11);
  doc.text(`Year: ${y}`, 40, 60);
  doc.text(
    `Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
    pageW - 40,
    60,
    { align: "right" }
  );

  doc.setTextColor(0);

  callAutoTable(doc, {
    startY: 120,
    head: [
      [
        "Month",
        "Total Tours",
        "Approved",
        "Activated",
        "Cancelled",
        "Tickets Sold",
        "Empty Seats",
        "Revenue",
      ],
    ],
    body: [
      ...rows.map((r) => [
        r.Month,
        formatNumber(r.TotalTours),
        formatNumber(r.ApprovedTours),
        formatNumber(r.ActivatedTours),
        formatNumber(r.CancelledTours),
        formatNumber(r.TicketsSold),
        formatNumber(r.EmptySeats),
        formatVND(r.Revenue),
      ]),
      [
        "Total",
        formatNumber(total.TotalTours),
        formatNumber(total.ApprovedTours),
        formatNumber(total.ActivatedTours),
        formatNumber(total.CancelledTours),
        formatNumber(total.TicketsSold),
        formatNumber(total.EmptySeats),
        formatVND(total.Revenue),
      ],
    ],
  });

  drawRevenueBarChart(doc, {
    x: 40,
    y: doc.lastAutoTable.finalY + 28,
    w: 515,
    h: 240,
    revenues: rows.map((r) => ({ month: r.Month, value: r.Revenue })),
    title: "Monthly Revenue Chart",
  });

  doc.save(opts.fileName || `tour_report_${y}.pdf`);
}
