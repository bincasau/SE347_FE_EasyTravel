import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { popup } from "@/utils/popup";
import RoomCard from "@/components/pages/HotelManager/MyRoom/Card.jsx";
import Pagination from "@/utils/Pagination";
import { getToken } from "@/utils/auth";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:8080";

export default function MyRooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("price_asc");
  const [q, setQ] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = getToken();

    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
      mode: "cors",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[FETCH ERROR]", url, res.status, text);
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    return res;
  }, []);

  const normalizeRoom = useCallback((r) => {
    return {
      room_id: r.roomId ?? r.room_id,
      room_number: r.roomNumber ?? r.room_number,
      room_type: r.roomType ?? r.room_type,
      number_of_guests: r.numberOfGuest ?? r.number_of_guests,
      price: r.price,
      description: r.desc ?? r.description,
      image_bed: r.imageBed ?? r.image_bed,
      image_wc: r.imageWC ?? r.image_wc,
      created_at: r.createdAt || r.created_at || "",
      status: r.status,
      floor: r.floor,
    };
  }, []);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const myHotelRes = await fetchWithAuth(
        `${API_BASE}/hotel_manager/my-hotel`
      );
      const hotel = await myHotelRes.json();

      const hotelId = hotel?.hotelId ?? hotel?.hotel_id ?? hotel?.id;
      if (!hotelId) throw new Error("Không tìm thấy hotelId từ API my-hotel");

      const roomsRes = await fetchWithAuth(`${API_BASE}/hotels/${hotelId}/rooms`);
      const data = await roomsRes.json();

      const list = data?._embedded?.rooms ?? [];
      setRooms(list.map(normalizeRoom));
    } catch (err) {
      console.error("Lỗi load rooms:", err);
      setRooms([]);
      popup.error(err?.message || "Tải danh sách phòng thất bại");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, normalizeRoom]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const goEditRoom = useCallback(
    (room) => {
      navigate("/hotel-manager/rooms/edit", { state: { room } });
    },
    [navigate]
  );

  const handleDeleted = useCallback((deletedId) => {
    setRooms((prev) =>
      prev.filter((r) => (r.room_id ?? r.roomId) !== deletedId)
    );
  }, []);

  const filteredRooms = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return rooms;

    return rooms.filter((r) => {
      const roomNumber = String(r.room_number ?? "").toLowerCase();
      const roomType = String(r.room_type ?? "").toLowerCase();
      const desc = String(r.description ?? "").toLowerCase();

      return (
        roomNumber.includes(keyword) ||
        roomType.includes(keyword) ||
        desc.includes(keyword)
      );
    });
  }, [rooms, q]);

  const sortedRooms = useMemo(() => {
    const data = [...filteredRooms];

    switch (sortBy) {
      case "price_asc":
        return data.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "price_desc":
        return data.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "date_desc":
        return data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "date_asc":
        return data.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      default:
        return data;
    }
  }, [filteredRooms, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, sortBy]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedRooms.length / pageSize));
  }, [sortedRooms.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedRooms.slice(start, end);
  }, [sortedRooms, currentPage]);

  const getVisiblePages = useCallback((page, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    if (page === 1) return [1, 2, 3];
    if (page === 2) return [1, 2, 3, 4];
    if (page === 3) return [1, 2, 3, 4, 5];

    if (page === total) return [total - 2, total - 1, total];
    if (page === total - 1) return [total - 3, total - 2, total - 1, total];
    if (page === total - 2)
      return [total - 4, total - 3, total - 2, total - 1, total];

    const start = Math.max(1, page - 2);
    const end = Math.min(total, page + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, []);

  const visiblePages = useMemo(() => {
    return getVisiblePages(currentPage, totalPages);
  }, [currentPage, totalPages, getVisiblePages]);

  const formatVND = useCallback((v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "";
    return `${n.toLocaleString("vi-VN")}₫`;
  }, []);

  const handleExportExcel = useCallback(async () => {
    const dataToExport = sortedRooms;

    if (loading) return popup.error("Đang tải dữ liệu, thử lại sau nhé!");
    if (!dataToExport || dataToExport.length === 0) {
      return popup.error("Không có phòng nào để xuất.");
    }

    const ok = await popup.confirm(
      `Xuất ${dataToExport.length} phòng (đang hiển thị) ra Excel?`,
      "Xác nhận xuất"
    );
    if (!ok) return;

    try {
      // ✅ Việt hoá header cột để Excel không còn tiếng Anh
      const rows = dataToExport.map((r, idx) => ({
        "STT": idx + 1,
        "Mã phòng": r.room_id ?? "",
        "Số phòng": r.room_number ?? "",
        "Loại phòng": r.room_type ?? "",
        "Số khách": r.number_of_guests ?? "",
        "Tầng": r.floor ?? "",
        "Trạng thái": r.status ?? "",
        "Giá (VND)": r.price ?? "",
        "Giá (hiển thị)": formatVND(r.price),
        "Mô tả": r.description ?? "",
        "Ảnh giường": Array.isArray(r.image_bed)
          ? r.image_bed.join(", ")
          : r.image_bed ?? "",
        "Ảnh WC": Array.isArray(r.image_wc)
          ? r.image_wc.join(", ")
          : r.image_wc ?? "",
        "Ngày tạo": r.created_at ?? "",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Phòng");

      ws["!cols"] = [
        { wch: 6 },  // STT
        { wch: 10 }, // Mã phòng
        { wch: 10 }, // Số phòng
        { wch: 16 }, // Loại phòng
        { wch: 10 }, // Số khách
        { wch: 8 },  // Tầng
        { wch: 12 }, // Trạng thái
        { wch: 14 }, // Giá (VND)
        { wch: 16 }, // Giá hiển thị
        { wch: 40 }, // Mô tả
        { wch: 30 }, // Ảnh giường
        { wch: 30 }, // Ảnh WC
        { wch: 22 }, // Ngày tạo
      ];

      const fileName = `ds_phong_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([out], { type: "application/octet-stream" }), fileName);

      popup.success("Xuất Excel thành công!");
    } catch (e) {
      console.error(e);
      popup.error(e?.message || "Xuất Excel thất bại!");
    }
  }, [sortedRooms, loading, formatVND]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <button
                  onClick={() => navigate("/hotel-manager/hotels/addroom/new")}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold
                             hover:bg-orange-600 transition active:scale-95 w-full sm:w-auto"
                >
                  + Thêm phòng
                </button>

                <button
                  onClick={handleExportExcel}
                  disabled={loading || sortedRooms.length === 0}
                  className={[
                    "px-4 py-2 rounded-lg text-sm font-semibold border transition active:scale-95 w-full sm:w-auto",
                    loading || sortedRooms.length === 0
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                  ].join(" ")}
                  title="Xuất danh sách phòng (đang hiển thị) ra Excel"
                >
                  Xuất Excel
                </button>
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Phòng của tôi
                </h1>
                <p className="text-sm text-gray-500 mt-1">Các phòng đã thêm</p>
              </div>

              <div className="flex gap-2 items-center justify-center sm:justify-end">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto
                             focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="price_asc">Giá: Thấp → Cao</option>
                  <option value="price_desc">Giá: Cao → Thấp</option>
                </select>

                <button
                  onClick={loadRooms}
                  className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50 whitespace-nowrap"
                  title="Tải lại"
                >
                  Tải lại
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo số phòng, loại phòng, mô tả..."
                className="w-full border rounded-xl px-4 py-2.5 bg-white
                           focus:outline-none focus:ring-2 focus:ring-orange-200"
              />

              {q.trim() && (
                <button
                  onClick={() => setQ("")}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm w-full sm:w-auto"
                >
                  Xoá
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Hiện{" "}
              <span className="font-semibold">{sortedRooms.length}</span> /{" "}
              <span className="font-semibold">{rooms.length}</span> phòng
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <p className="text-gray-400 text-center">Đang tải...</p>
        ) : sortedRooms.length === 0 ? (
          <p className="text-gray-400 text-center">
            Không tìm thấy phòng{q.trim() ? ` cho "${q.trim()}"` : ""}.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {pagedRooms.map((room) => (
              <RoomCard
                key={room.room_id ?? room.roomId}
                room={room}
                onEdit={() => goEditRoom(room)}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

        {!loading && sortedRooms.length > pageSize && (
          <div className="flex justify-center px-2">
            <div className="w-full sm:w-auto overflow-x-auto">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                visiblePages={visiblePages}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
