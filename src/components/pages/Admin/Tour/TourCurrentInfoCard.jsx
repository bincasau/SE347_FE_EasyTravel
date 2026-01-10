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
    <div className="p-5 rounded-2xl border bg-white">
      <div className="font-semibold mb-3">Thông tin hiện tại</div>

      {/* ảnh */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title || "Tour"}
          className="w-full h-36 object-cover rounded-xl border bg-gray-100"
        />
      ) : (
        <div className="w-full h-36 rounded-xl border bg-gray-50 flex items-center justify-center text-gray-400">
          Chưa có ảnh
        </div>
      )}

      <div className="mt-4 space-y-3 text-sm text-gray-700">
        <div>
          <div className="text-gray-500">Tên tour</div>
          <div className="font-medium break-words">{title || "-"}</div>
        </div>

        <div>
          <div className="text-gray-500">Giá người lớn sau giảm</div>
          <div className="font-medium">{finalPriceAdult}</div>
        </div>

        <div>
          <div className="text-gray-500">Thời gian</div>
          <div className="font-medium">
            {startDate || "-"} → {endDate || "-"} ({durationDays} ngày)
          </div>
        </div>

        <div>
          <div className="text-gray-500">Số ghế</div>
          <div className="font-medium">
            Còn {availableSeats} / {limitSeats}
          </div>
        </div>

        {statusLabel ? (
          <div>
            <div className="text-gray-500">Trạng thái</div>
            <div className="font-medium">{statusLabel}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
