function moneyVND(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString()} đ`;
}

function statusBadge(statusLabel) {
  const s = String(statusLabel || "").toLowerCase();

  const cls = s.includes("hủy") || s.includes("cancel")
    ? "bg-red-50 text-red-700 ring-red-200"
    : s.includes("kích hoạt") || s.includes("activated")
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : s.includes("duyệt") || s.includes("passed")
    ? "bg-blue-50 text-blue-700 ring-blue-200"
    : "bg-gray-50 text-gray-700 ring-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${cls}`}
    >
      {statusLabel}
    </span>
  );
}

export default function TourCurrentInfoCard({
  title,
  imageUrl,
  finalPriceAdult,
  startDate,
  endDate,
  durationDays,
  availableSeats,
  limitSeats,
  statusLabel,
}) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="font-semibold">Thông tin hiện tại</div>
        {statusLabel ? statusBadge(statusLabel) : null}
      </div>

      {/* Image */}
      {imageUrl ? (
        <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
          <img
            src={imageUrl}
            alt={title || "Tour"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/10] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
          Chưa có ảnh
        </div>
      )}

      <div className="mt-4 space-y-3 text-sm text-gray-700">
        <Item label="Tên tour" value={title || "-"} strong />

        <Item
          label="Giá người lớn sau giảm"
          value={moneyVND(finalPriceAdult)}
          strong
        />

        <Item
          label="Thời gian"
          value={`${startDate || "-"} → ${endDate || "-"} (${durationDays} ngày)`}
        />

        <Item
          label="Số ghế"
          value={`Còn ${availableSeats} / ${limitSeats}`}
        />
      </div>
    </div>
  );
}

function Item({ label, value, strong }) {
  return (
    <div className="min-w-0">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className={`break-words ${strong ? "font-semibold text-gray-900" : "font-medium"}`}>
        {value}
      </div>
    </div>
  );
}
