import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { popup } from "@/utils/popup";
import RoomCard from "@/components/pages/HotelManager/MyRoom/Card.jsx";
import Pagination from "@/utils/Pagination";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function MyRooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("price_asc");
  const [q, setQ] = useState("");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // ✅ lấy token (tự thử nhiều key phổ biến)
  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  // ✅ fetch auto gửi JWT
  const fetchWithAuth = async (url, options = {}) => {
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
  };

  // ✅ map camelCase API -> snake_case UI
  const normalizeRoom = (r) => ({
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
  });

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      // 1) lấy my hotel -> lấy hotelId
      const myHotelRes = await fetchWithAuth(
        "http://localhost:8080/hotel_manager/my-hotel"
      );
      const hotel = await myHotelRes.json();

      const hotelId = hotel?.hotelId ?? hotel?.hotel_id ?? hotel?.id;
      if (!hotelId) throw new Error("Không tìm thấy hotelId từ API my-hotel");

      // 2) lấy rooms theo hotelId (HATEOAS: data._embedded.rooms)
      const roomsRes = await fetchWithAuth(
        `http://localhost:8080/hotels/${hotelId}/rooms`
      );
      const data = await roomsRes.json();

      const list = data?._embedded?.rooms ?? [];
      setRooms(list.map(normalizeRoom));
    } catch (err) {
      console.error("Lỗi load rooms:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []); // fetchWithAuth dùng localStorage nên không cần dep

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadRooms();
    })();
    return () => {
      mounted = false;
    };
  }, [loadRooms]);

  // ✅ Edit route (no id) => pass room via state
  const goEditRoom = (room) => {
    navigate("/hotel-manager/rooms/edit", { state: { room } });
  };

  // ✅ callback: xóa xong update UI ngay (khỏi reload)
  const handleDeleted = (deletedId) => {
    setRooms((prev) =>
      prev.filter((r) => (r.room_id ?? r.roomId) !== deletedId)
    );
  };

  // ✅ Filter by search
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

  // 🔽 Sort logic (sort after filter)
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

  // ✅ reset page khi search/sort đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [q, sortBy]);

  // ✅ total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedRooms.length / pageSize));
  }, [sortedRooms.length]);

  // nếu dữ liệu thay đổi làm currentPage vượt totalPages => kéo về trang cuối hợp lệ
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // ✅ paged rooms
  const pagedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedRooms.slice(start, end);
  }, [sortedRooms, currentPage]);

  // ✅ visible pages (gọn như Blog)
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

  // ---------- EXPORT EXCEL ----------
  const formatVND = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "";
    return `${n.toLocaleString("vi-VN")}₫`;
  };

  const handleExportExcel = useCallback(async () => {
    // Export đúng những gì đang hiển thị (đã search + sort)
    const dataToExport = sortedRooms;

    if (loading) return popup.error("Đang tải dữ liệu, thử lại sau nhé!");
    if (!dataToExport || dataToExport.length === 0) {
      return popup.error("Không có phòng nào để export.");
    }

    const ok = await popup.confirm(
      `Xuất ${dataToExport.length} phòng (đang hiển thị) ra Excel?`,
      "Xác nhận export"
    );
    if (!ok) return;

    try {
      const rows = dataToExport.map((r, idx) => ({
        "No.": idx + 1,
        "Room ID": r.room_id ?? "",
        "Room Number": r.room_number ?? "",
        Type: r.room_type ?? "",
        Guests: r.number_of_guests ?? "",
        Floor: r.floor ?? "",
        Status: r.status ?? "",
        "Price (VND)": r.price ?? "",
        "Price (Formatted)": formatVND(r.price),
        Description: r.description ?? "",
        "Image Bed": Array.isArray(r.image_bed)
          ? r.image_bed.join(", ")
          : r.image_bed ?? "",
        "Image WC": Array.isArray(r.image_wc)
          ? r.image_wc.join(", ")
          : r.image_wc ?? "",
        "Created At": r.created_at ?? "",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rooms");

      ws["!cols"] = [
        { wch: 6 },
        { wch: 10 },
        { wch: 14 },
        { wch: 16 },
        { wch: 8 },
        { wch: 8 },
        { wch: 12 },
        { wch: 12 },
        { wch: 16 },
        { wch: 40 },
        { wch: 30 },
        { wch: 30 },
        { wch: 22 },
      ];

      const fileName = `rooms_export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([out], { type: "application/octet-stream" }), fileName);

      popup.success("Export Excel thành công!");
    } catch (e) {
      console.error(e);
      popup.error(e?.message || "Export Excel failed!");
    }
  }, [sortedRooms, loading]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 relative">
          {/* ✅ Left: Add Room + Export */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button
              onClick={() => navigate("/hotel-manager/hotels/addroom/new")}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold
                         hover:bg-orange-600 transition hover:-translate-y-[1px] active:scale-95"
            >
              + Add Room
            </button>

            <button
              onClick={handleExportExcel}
              disabled={loading || sortedRooms.length === 0}
              className={[
                "px-4 py-2 rounded-lg text-sm font-semibold border transition active:scale-95",
                loading || sortedRooms.length === 0
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
              ].join(" ")}
              title="Export danh sách phòng (đang hiển thị) ra Excel"
            >
              Export to Excel
            </button>
          </div>

          {/* Center title */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">My Rooms</h1>
            <p className="text-sm text-gray-500 mt-1">Rooms you have added</p>
          </div>

          {/* Sort (right) */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="date_desc">Newest</option>
              <option value="date_asc">Oldest</option>
            </select>

            <button
              onClick={loadRooms}
              className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
              title="Reload"
            >
              ⟳
            </button>
          </div>
        </div>

        {/* ✅ SEARCH BAR */}
        <div className="max-w-6xl mx-auto px-6 pb-5">
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by room number, type, description..."
              className="w-full border rounded-xl px-4 py-2.5 bg-white
                         focus:outline-none focus:ring-2 focus:ring-orange-200"
            />

            {q.trim() && (
              <button
                onClick={() => setQ("")}
                className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold">{sortedRooms.length}</span> /{" "}
            <span className="font-semibold">{rooms.length}</span> rooms
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : sortedRooms.length === 0 ? (
          <p className="text-gray-400 text-center">
            No rooms found{q.trim() ? ` for "${q.trim()}"` : ""}.
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

        {/* ✅ Pagination dưới cùng */}
        {!loading && sortedRooms.length > pageSize && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            visiblePages={visiblePages}
          />
        )}
      </div>
    </div>
  );
}
