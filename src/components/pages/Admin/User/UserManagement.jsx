import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AdminUserCard from "@/components/pages/Admin/User/AdminUserCard";
import Pagination from "@/utils/Pagination";
import { getUsers, adminDeleteUser, fetchUsers } from "@/apis/User";

import { exportUsersExcel } from "@/components/pages/Admin/User/UsersExportExcel";
import { importUsersExcel } from "@/components/pages/Admin/User/UsersImportExcel";
import { popup } from "@/utils/popup";

const ROLES = [
  { label: "Tất cả", value: "ALL" },
  { label: "Quản trị viên", value: "ADMIN" },
  { label: "Hướng dẫn viên", value: "TOUR_GUIDE" },
  { label: "Quản lý khách sạn", value: "HOTEL_MANAGER" },
  { label: "Khách hàng", value: "CUSTOMER" },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildVisiblePages(currentPage, totalPages, windowSize = 5) {
  if (totalPages <= 0) return [1];

  const half = Math.floor(windowSize / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    end += 1 - start;
    start = 1;
  }

  if (end > totalPages) {
    start -= end - totalPages;
    end = totalPages;
  }

  start = Math.max(1, start);

  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
  );
}

/* ===================== HELPERS: ROLE + STATUS ===================== */

function normUpper(v) {
  return (v ?? "").toString().trim().toUpperCase();
}

function roleLabel(role) {
  const v = normUpper(role);
  if (v === "ADMIN") return "Quản trị viên";
  if (v === "TOUR_GUIDE") return "Hướng dẫn viên";
  if (v === "HOTEL_MANAGER") return "Quản lý khách sạn";
  if (v === "CUSTOMER") return "Khách hàng";
  return "—";
}

function roleBadgeClass(role) {
  const v = normUpper(role);
  return v === "ADMIN"
    ? "bg-red-100 text-red-700"
    : v === "TOUR_GUIDE"
      ? "bg-blue-100 text-blue-700"
      : v === "HOTEL_MANAGER"
        ? "bg-orange-100 text-orange-700"
        : "bg-gray-100 text-gray-700";
}

function statusLabel(status) {
  const v = normUpper(status);
  return v === "ACTIVATED" ? "Đã kích hoạt" : "Chưa kích hoạt";
}

function statusBadgeClass(status) {
  const v = normUpper(status);
  return v === "ACTIVATED"
    ? "bg-blue-100 text-blue-700"
    : "bg-gray-100 text-gray-700";
}

function extractApiErrorMessage(err) {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (err?.message) return String(err.message);

  const any = err;
  if (any?.error) return String(any.error);
  if (any?.data?.message) return String(any.data.message);
  if (any?.response?.data?.message) return String(any.response.data.message);

  return "";
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const pageRaw = searchParams.get("page");
  const pageNum = Number(pageRaw);
  const currentPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const roleFromUrl = searchParams.get("role") || "ALL";
  const [roleFilter, setRoleFilter] = useState(roleFromUrl);

  const qFromUrl = searchParams.get("q") || "";
  const [q, setQ] = useState(qFromUrl);

  // view mode (card | table)
  const viewFromUrl =
    (searchParams.get("view") || "card").toString().toLowerCase() === "table"
      ? "table"
      : "card";
  const [viewMode, setViewMode] = useState(viewFromUrl);

  const fileInputId = "users-import-excel-input";

  async function loadUsers(pageUI, role) {
    setLoading(true);
    try {
      const keyword = (searchParams.get("q") || "").trim();

      const data = keyword
        ? await fetchUsers({ keyword })
        : await getUsers({
            page: pageUI,
            size: 10,
            role,
            status: "ALL",
          });

      setUsers(data?._embedded?.users ?? []);
      setTotalPages(data?.page?.totalPages ?? 1);
    } catch (e) {
      setUsers([]);
      setTotalPages(1);
      popup.error(
        extractApiErrorMessage(e) || "Tải danh sách người dùng thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(currentPage, roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, roleFilter, qFromUrl, viewFromUrl]);

  const handlePageChange = (pageUI) => {
    const safe = clamp(pageUI, 1, totalPages || 1);
    const next = { page: String(safe), view: viewMode };

    if (roleFilter !== "ALL") next.role = roleFilter;

    const keyword = (searchParams.get("q") || "").trim();
    if (keyword) next.q = keyword;

    setSearchParams(next);
  };

  const visiblePages = useMemo(() => {
    const safeCurrent = clamp(currentPage, 1, totalPages || 1);
    return buildVisiblePages(safeCurrent, totalPages || 1, 5);
  }, [currentPage, totalPages]);

  const handleRoleChange = (e) => {
    const v = e.target.value;
    setRoleFilter(v);

    const next = { page: "1", view: viewMode };
    if (v !== "ALL") next.role = v;

    const keyword = (searchParams.get("q") || "").trim();
    if (keyword) next.q = keyword;

    setSearchParams(next);
  };

  const handleExportExcel = async () => {
    setExporting(true);
    const close = popup.loading("Đang xuất Excel...");
    try {
      await exportUsersExcel({
        role: roleFilter,
        status: "ALL",
      });
      popup.success("Xuất Excel thành công");
    } catch (e) {
      popup.error(
        "Xuất Excel thất bại: " + (extractApiErrorMessage(e) || "Không rõ lỗi"),
      );
    } finally {
      close?.();
      setExporting(false);
    }
  };

  const handlePickImport = () => {
    const el = document.getElementById(fileInputId);
    el?.click();
  };

  // ✅ FIX: kết quả import bị chớp do close() ở finally đè popup result
  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    const close = popup.loading("Đang nhập Excel...");

    try {
      const rs = await importUsersExcel(file, {
        defaultRole: roleFilter === "ALL" ? "CUSTOMER" : roleFilter,
        defaultStatus: "Activated",
        defaultPassword: "123456",
      });

      // ✅ đóng loading TRƯỚC khi show kết quả (không để trong finally)
      close?.();

      const summary = `Nhập xong: ${rs.ok} OK, ${rs.fail} FAIL (Tổng ${rs.total})`;

      if (rs?.errors?.length) {
        popup.error(
          `${summary}\n\n${rs.errors.slice(0, 20).join("\n")}`,
          "Kết quả nhập",
        );
      } else {
        popup.success(summary, "Kết quả nhập");
      }

      await loadUsers(currentPage, roleFilter);
    } catch (err) {
      close?.();
      popup.error(extractApiErrorMessage(err) || "Nhập Excel thất bại");
    } finally {
      setImporting(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const kw = (q || "").trim();

    const next = { page: "1", view: viewMode };
    if (roleFilter !== "ALL") next.role = roleFilter;
    if (kw) next.q = kw;

    setSearchParams(next);
  };

  const handleClearSearch = () => {
    setQ("");
    const next = { page: "1", view: viewMode };
    if (roleFilter !== "ALL") next.role = roleFilter;
    setSearchParams(next);
  };

  const applyViewMode = (nextMode) => {
    const v = nextMode === "table" ? "table" : "card";
    setViewMode(v);

    const next = { page: String(currentPage || 1), view: v };
    if (roleFilter !== "ALL") next.role = roleFilter;

    const keyword = (searchParams.get("q") || "").trim();
    if (keyword) next.q = keyword;

    setSearchParams(next);
  };

  const handleRemove = async (userId) => {
    if (!userId) return;

    const close = popup.loading("Đang xoá người dùng...");
    try {
      await adminDeleteUser(userId);
      popup.success("Xoá người dùng thành công");
      await loadUsers(currentPage, roleFilter);
    } catch (e) {
      popup.error(
        extractApiErrorMessage(e) || "Xoá người dùng thất bại",
        "Lỗi",
      );
    } finally {
      close?.();
    }
  };

  const handleRemoveFromCard = async (user) => {
    const id = user?.userId ?? user?.id;
    if (!id) return;

    const ok = await popup.confirm(
      `Bạn có chắc chắn muốn xóa người dùng "${user?.username}" không?`,
      "Xác nhận xóa",
    );
    if (!ok) return;

    await handleRemove(id);
  };

  const handleRemoveFromTable = async (u) => {
    const id = u?.userId ?? u?.id;
    if (!id) return;

    const ok = await popup.confirm(
      `Bạn có chắc chắn muốn xóa người dùng "${u?.username}" không?`,
      "Xác nhận xóa",
    );
    if (!ok) return;

    await handleRemove(id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header + toolbar */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Quản lý người dùng
          </h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Toggle view */}
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

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={handleRoleChange}
              className="w-full sm:w-auto px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 outline-none"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên / username / email..."
            className="flex-1 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 outline-none"
          />
          {q?.trim() && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Xóa
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2 sm:gap-3">
          <input
            id={fileInputId}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportExcel}
          />

          <button
            onClick={handlePickImport}
            disabled={importing}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Spinner /> Đang nhập...
              </>
            ) : (
              "Nhập Excel"
            )}
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <Spinner /> Đang xuất...
              </>
            ) : (
              "Xuất Excel"
            )}
          </button>

          <Link to="/admin/users/new" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition">
              Thêm người dùng
            </button>
          </Link>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-10 flex items-center justify-center gap-3 text-gray-600">
          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          Đang tải người dùng...
        </div>
      ) : users.length === 0 ? (
        <p className="text-center py-10 text-gray-500">Không có người dùng.</p>
      ) : viewMode === "card" ? (
        <div className="flex flex-col gap-4 sm:gap-6">
          {users.map((user) => (
            <AdminUserCard
              key={user?.userId ?? user?.id}
              user={user}
              onRemove={handleRemoveFromCard}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Họ tên</th>
                <th className="px-4 py-3 font-semibold">Tên đăng nhập</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Vai trò</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const id = u?.userId ?? u?.id;
                const role = u?.role ?? u?.roles?.[0] ?? "";
                const status =
                  u?.status ??
                  u?.accountStatus ??
                  u?.state ??
                  u?.activated ??
                  "";

                return (
                  <tr key={id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {id ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-900 font-semibold">
                      {u?.fullName ?? u?.name ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {u?.username ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {u?.email ?? "-"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadgeClass(
                          role,
                        )}`}
                      >
                        {roleLabel(role)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(
                          status,
                        )}`}
                      >
                        {statusLabel(status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="inline-flex gap-2 justify-end">
                        <Link
                          to={`/admin/users/edit/${id}`}
                          className="px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                          title="Sửa"
                        >
                          Sửa
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromTable(u)}
                          className="px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                          title="Xóa"
                        >
                          Xóa
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

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={clamp(currentPage, 1, totalPages || 1)}
        onPageChange={handlePageChange}
        visiblePages={visiblePages}
      />
    </div>
  );
}
