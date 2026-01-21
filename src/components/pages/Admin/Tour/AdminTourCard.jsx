// src/components/admin/AdminTourCard.jsx
import { useNavigate } from "react-router-dom";
import {
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  TagIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { deleteTour } from "@/apis/Tour";
import { popup } from "@/utils/popup";

const S3_TOUR_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/tour";

const FALLBACK_IMG = `${S3_TOUR_BASE}/tour_default.jpg`;

function money(v) {
  return Number(v || 0).toLocaleString("vi-VN");
}

function normStatus(s) {
  return (s ?? "").toString().trim().toUpperCase();
}

function statusViLabel(s) {
  const v = normStatus(s);
  if (v === "PASSED") return "Đã duyệt";
  if (v === "ACTIVATED") return "Đang hoạt động";
  if (v === "CANCELLED" || v === "CANCELED") return "Đã hủy";
  if (v === "PENDING") return "Chờ duyệt";
  return v || "—";
}

function statusBadgeClass(s) {
  const v = normStatus(s);
  if (v === "PASSED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (v === "ACTIVATED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (v === "CANCELLED" || v === "CANCELED")
    return "bg-red-50 text-red-700 ring-red-200";
  if (v === "PENDING") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-gray-100 text-gray-700 ring-gray-200";
}

export default function AdminTourCard({ tour, onEdit, onRemove }) {
  const navigate = useNavigate();

  const tourId = tour?.tourId ?? tour?.id;
  const title = tour?.title ?? "Chưa có tên tour";
  const mainImage = tour?.mainImage ?? "";
  const startDate = tour?.startDate ?? "-";
  const endDate = tour?.endDate ?? "-";
  const priceAdult = Number(tour?.priceAdult ?? 0);
  const priceChild = Number(tour?.priceChild ?? 0);
  const percentDiscount = Number(tour?.percentDiscount ?? 0);
  const availableSeats = tour?.availableSeats ?? "-";
  const limitSeats = tour?.limitSeats ?? "-";
  const departureLocation = tour?.departureLocation ?? "-";
  const destination = tour?.destination ?? "-";
  const status = tour?.status ?? "PENDING";

  const finalPriceAdult = Math.max(
    0,
    priceAdult - (priceAdult * percentDiscount) / 100,
  );

  const imageUrl = mainImage
    ? mainImage.startsWith("http")
      ? mainImage
      : `${S3_TOUR_BASE}/${mainImage}`
    : FALLBACK_IMG;

  const handleEdit = () => {
    if (tourId) navigate(`/admin/tours/edit/${tourId}`);
    if (typeof onEdit === "function") onEdit(tour);
  };

  const handleRemove = async () => {
    const ok = await popup.confirm("Bạn có chắc chắn muốn xóa tour này không?");
    if (!ok) return;

    const close = popup.loading("Đang xóa tour...");
    try {
      await deleteTour(Number(tourId));
      popup.success("Đã xóa tour");
      if (typeof onRemove === "function") onRemove(tour);
    } catch (e) {
      popup.error(e?.message || "Xóa thất bại");
    } finally {
      close?.();
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
        {/* IMAGE */}
        <div className="w-full lg:w-[260px] flex-shrink-0">
          <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-semibold mb-3 line-clamp-2">
            {title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm text-gray-700">
            {/* LEFT */}
            <div className="space-y-2 min-w-0">
              <Info
                icon={<CalendarDaysIcon className="w-5 h-5 text-orange-400" />}
                label="Ngày"
                value={`${startDate} → ${endDate}`}
              />
              <Info
                icon={<UsersIcon className="w-5 h-5 text-orange-400" />}
                label="Số chỗ"
                value={`${availableSeats}`}
              />
              <Info
                icon={<MapPinIcon className="w-5 h-5 text-orange-400" />}
                label="Điểm đi"
                value={departureLocation}
              />
              <Info
                icon={<MapPinIcon className="w-5 h-5 text-orange-400" />}
                label="Điểm đến"
                value={destination}
              />
            </div>

            {/* RIGHT */}
            <div className="space-y-2 min-w-0">
              {/* ✅ REPLACE Duration -> Status */}
              <Info
                icon={<ClockIcon className="w-5 h-5 text-orange-400" />}
                label="Trạng thái"
                value={
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${statusBadgeClass(
                      status,
                    )}`}
                  >
                    {statusViLabel(status)}
                  </span>
                }
              />

              <Info
                icon={<TagIcon className="w-5 h-5 text-orange-400" />}
                label="Giảm giá"
                value={`${percentDiscount}%`}
              />
              <Info
                icon={
                  <CurrencyDollarIcon className="w-5 h-5 text-orange-400" />
                }
                label="Người lớn"
                value={`${money(priceAdult)} đ`}
              />
              <Info
                icon={
                  <CurrencyDollarIcon className="w-5 h-5 text-orange-400" />
                }
                label="Trẻ em"
                value={`${money(priceChild)} đ`}
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="w-full lg:w-auto flex flex-col gap-3 lg:items-end">
          <div className="text-sm text-gray-700">
            Giá từ{" "}
            <span className="text-xl font-bold text-gray-900">
              {money(finalPriceAdult)} đ
            </span>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
            <button
              onClick={handleEdit}
              className="w-full sm:w-auto border border-orange-500 text-orange-500 px-6 sm:px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium"
            >
              Sửa
            </button>

            <button
              onClick={handleRemove}
              className="w-full sm:w-auto bg-orange-500 text-white px-6 sm:px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <p className="min-w-0">
        <span className="font-semibold">{label}:</span>{" "}
        <span className="break-words">{value ?? "—"}</span>
      </p>
    </div>
  );
}
