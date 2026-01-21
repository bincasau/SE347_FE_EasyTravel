import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getHotels, getHotelManagerByHotelId, deleteHotel } from "@/apis/Hotel";
import AdminHotelCard from "@/components/pages/Admin/Hotel/AdminHotelCard";
import Pagination from "@/utils/Pagination";
import ExportHotelsExcelButton from "@/components/pages/Admin/Hotel/HotelsExportExcel";
import HotelsImportExcelButton from "@/components/pages/Admin/Hotel/HotelsImportExcel";
import { popup } from "@/utils/popup";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
  );
}

function formatDateVN(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("vi-VN");
}

function formatVND(v) {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("vi-VN") + " đ";
}

export default function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  // URL state (UI page: 1..n)
  const pageRaw = searchParams.get("page");
  const pageNum = Number(pageRaw);
  const currentPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  // view mode from URL
  const viewFromUrl =
    (searchParams.get("view") || "card").toString().toLowerCase() === "table"
      ? "table"
      : "card";
  const [viewMode, setViewMode] = useState(viewFromUrl);

  const [totalPages, setTotalPages] = useState(1);
  const [removingId, setRemovingId] = useState(null);

  const managerCacheRef = useRef(new Map());

  async function attachManagers(list) {
    if (!Array.isArray(list) || list.length === 0) return [];

    const tasks = list.map(async (h) => {
      const hid = h?.hotelId ?? h?.id;
      if (!hid) return h;

      if (managerCacheRef.current.has(hid)) {
        const cached = managerCacheRef.current.get(hid);
        return { ...h, ...cached };
      }

      try {
        const manager = await getHotelManagerByHotelId(hid);
        const managerId = manager?.userId ?? "";
        const extra = { managerId, manager };
        managerCacheRef.current.set(hid, extra);
        return { ...h, ...extra };
      } catch {
        const extra = { managerId: "", manager: null };
        managerCacheRef.current.set(hid, extra);
        return { ...h, ...extra };
      }
    });

    return Promise.all(tasks);
  }

  // ✅ trả về list + totalPages để xử lý “trang rỗng sau khi xóa”
  async function loadHotels(pageUI) {
    const page0 = Math.max(0, Number(pageUI || 1) - 1);

    setLoading(true);
    try {
      const data = await getHotels({
        page: page0,
        size: 5,
        sort: "hotelId,desc",
      });

      const list = data?._embedded?.hotels ?? [];
      const withManagers = await attachManagers(list);

      const tp = data?.page?.totalPages ?? 1;

      setHotels(withManagers);
      setTotalPages(tp);

      return { list: withManagers, totalPages: tp };
    } catch (error) {
      setHotels([]);
      setTotalPages(1);
      popup.error(error?.message || "Tải danh sách khách sạn thất bại");
      return { list: [], totalPages: 1 };
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, viewFromUrl]);

  useEffect(() => setViewMode(viewFromUrl), [viewFromUrl]);

  const safeTotalPages = Math.max(1, totalPages || 1);

  // clamp URL page nếu vượt totalPages
  useEffect(() => {
    if (currentPage > safeTotalPages) {
      const safe = clamp(currentPage, 1, safeTotalPages);
      setSearchParams({ page: String(safe), view: viewMode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeTotalPages]);

  const handlePageChange = (p) => {
    const safe = clamp(Number(p || 1), 1, safeTotalPages);
    setSearchParams({ page: String(safe), view: viewMode });
  };

  const applyViewMode = (nextMode) => {
    const v = nextMode === "table" ? "table" : "card";
    setViewMode(v);
    setSearchParams({ page: String(currentPage || 1), view: v });
  };

  // ✅ CHỈ NƠI NÀY gọi deleteHotel + confirm + reload
  const handleRemove = async (hotelId) => {
    const hid = Number(hotelId);
    if (!hid) return;

    const ok = await popup.confirm(
      "Bạn có chắc chắn muốn xóa khách sạn này không?",
      "Xác nhận xóa",
    );
    if (!ok) return;

    setRemovingId(hid);
    const close = popup.loading("Đang xóa khách sạn...");

    try {
      // ✅ optimistic remove để card biến mất ngay
      setHotels((prev) =>
        (prev || []).filter((x) => (x?.hotelId ?? x?.id) !== hid),
      );

      // ✅ clear cache manager để tránh “ảo”
      managerCacheRef.current.delete(hid);

      await deleteHotel(hid);

      close?.();
      popup.success("Đã xóa khách sạn");

      // ✅ reload lại đúng trang hiện tại
      const rs = await loadHotels(currentPage);

      // ✅ nếu sau khi xóa trang hiện tại rỗng (hay gặp ở trang cuối) -> lùi trang
      if ((rs?.list?.length ?? 0) === 0 && currentPage > 1) {
        const prevPage = currentPage - 1;
        setSearchParams({ page: String(prevPage), view: viewMode });
        // effect sẽ tự loadHotels(prevPage)
      }
    } catch (e) {
      close?.();
      popup.error(e?.message || "Xóa thất bại");

      // (tuỳ chọn) lỗi thì reload lại để khôi phục UI nếu optimistic remove đã chạy
      await loadHotels(currentPage);
    } finally {
      setRemovingId(null);
    }
  };

  const visibleHotels = useMemo(() => hotels, [hotels]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Quản lý khách sạn
          </h1>

          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => applyViewMode("card")}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition disabled:opacity-60 ${
                viewMode === "card"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-700 hover:bg-white/60"
              }`}
            >
              Thẻ
            </button>
            <button
              type="button"
              onClick={() => applyViewMode("table")}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition disabled:opacity-60 ${
                viewMode === "table"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-700 hover:bg-white/60"
              }`}
            >
              Bảng
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <div className="w-full sm:w-auto">
            <HotelsImportExcelButton
              onImported={async () => {
                await loadHotels(currentPage);
              }}
            />
          </div>

          <div className="w-full sm:w-auto">
            <ExportHotelsExcelButton />
          </div>

          <Link to="/admin/hotels/add" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
              Thêm khách sạn
            </button>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-10 flex items-center justify-center gap-3 text-gray-600">
          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          Đang tải danh sách khách sạn...
        </div>
      ) : visibleHotels.length === 0 ? (
        <p className="text-center py-10 text-gray-500">
          Không có khách sạn nào.
        </p>
      ) : viewMode === "card" ? (
        <div className="flex flex-col gap-4 sm:gap-6">
          {visibleHotels.map((hotel) => {
            const hid = hotel?.hotelId ?? hotel?.id;
            return (
              <AdminHotelCard
                key={hid}
                hotel={hotel}
                onEdit={() => {}}
                onRemove={(id) => handleRemove(id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Mã KS</th>
                <th className="px-4 py-3 font-semibold">Tên khách sạn</th>
                <th className="px-4 py-3 font-semibold">Địa chỉ</th>
                <th className="px-4 py-3 font-semibold">Hotline</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Giá thấp nhất</th>
                <th className="px-4 py-3 font-semibold">Mã quản lý</th>
                <th className="px-4 py-3 font-semibold">Ngày thêm</th>
                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {visibleHotels.map((h) => {
                const hid = h?.hotelId ?? h?.id;

                return (
                  <tr key={hid} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {hid ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {h?.name ?? "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Cập nhật: {formatDateVN(h?.updatedAt || h?.updated_at)}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {h?.address ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {h?.phoneNumber || h?.phone_number || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {h?.email ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {h?.minPrice == null && h?.min_price == null
                        ? "—"
                        : formatVND(h?.minPrice ?? h?.min_price)}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {h?.managerId ?? h?.manager_id ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatDateVN(h?.createdAt || h?.created_at)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="inline-flex gap-2 justify-end">
                        <Link
                          to={`/admin/hotels/update/${hid}`}
                          className="px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                          title="Sửa"
                        >
                          Sửa
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemove(hid)}
                          disabled={!!removingId && removingId === Number(hid)}
                          className="px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60 inline-flex items-center gap-2"
                          title="Xóa"
                        >
                          {removingId === Number(hid) ? (
                            <>
                              <Spinner /> Đang xóa...
                            </>
                          ) : (
                            "Xóa"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        totalPages={safeTotalPages}
        currentPage={clamp(currentPage, 1, safeTotalPages)}
        onPageChange={handlePageChange}
        visiblePages={null}
      />
    </div>
  );
}
