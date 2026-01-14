import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function formatVNDFromVnpAmount(vnpAmount) {
  // VNPay thường trả amount * 100
  // Ví dụ 1000000đ -> vnp_Amount=100000000
  const raw = Number(vnpAmount ?? 0);
  if (!Number.isFinite(raw) || raw <= 0) return "—";

  // Heuristic: nếu quá lớn thì chia 100
  const amount = raw >= 10000 ? Math.round(raw / 100) : raw;

  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function Badge({ ok, children }) {
  return (
    <span
      className={[
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
        ok
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-200",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-b-0">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900 text-right break-all">
        {value || "—"}
      </div>
    </div>
  );
}

export default function PaymentResult() {
  const q = useQuery();
  const navigate = useNavigate();

  const status = (q.get("status") || "").toLowerCase(); // success | failed
  const code = q.get("code") || "";
  const txnRef = q.get("txnRef") || "";
  const amount = q.get("amount") || "";
  const orderInfo = q.get("orderInfo") || "";

  const isSuccess = status === "success";

  const title = isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại";
  const subtitle = isSuccess
    ? "Cảm ơn bạn! Giao dịch của bạn đã được xác nhận."
    : "Giao dịch chưa thành công. Bạn có thể thử lại hoặc chọn phương thức khác.";

  const amountText = useMemo(() => formatVNDFromVnpAmount(amount), [amount]);

  // gợi ý hiển thị message theo code (tuỳ bạn)
  const codeHint = useMemo(() => {
    if (!code) return "";
    if (code === "00") return "Giao dịch thành công (VNPay).";
    return "VNPay phản hồi giao dịch không thành công.";
  }, [code]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="bg-white border rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                {title}
              </h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {subtitle}
              </p>
              {codeHint && (
                <p className="text-xs text-gray-400 mt-2">{codeHint}</p>
              )}
            </div>

            <Badge ok={isSuccess}>
              {isSuccess ? "SUCCESS" : "FAILED"}
            </Badge>
          </div>

          {/* Summary Card */}
          <div
            className={[
              "mt-6 rounded-2xl border p-4 sm:p-5",
              isSuccess ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Số tiền</div>
              <div className="text-xl font-bold text-gray-900">
                {amountText}
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              {isSuccess
                ? "Nếu bạn đã đặt phòng / tour, hệ thống sẽ cập nhật trạng thái thanh toán."
                : "Nếu tiền đã bị trừ nhưng trạng thái thất bại, hãy liên hệ hỗ trợ kèm mã giao dịch."}
            </div>
          </div>

          {/* Details */}
          <div className="mt-6 rounded-2xl border bg-white p-4 sm:p-5">
            <div className="font-semibold text-gray-900 mb-3">
              Chi tiết giao dịch
            </div>

            <Row label="Trạng thái" value={isSuccess ? "Thành công" : "Thất bại"} />
            
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Về trang chủ
            </button>

            {isSuccess ? (
              <button
                type="button"
                onClick={() => navigate("/booking-history")}
                className="px-5 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Xem booking của tôi
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Thử lại
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-xs text-gray-400 mt-4">
          EasyTravel · Payment Result
        </div>
      </div>
    </div>
  );
}
