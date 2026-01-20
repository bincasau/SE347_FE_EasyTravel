import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AdminUserCard from "@/components/pages/Admin/User/AdminUserCard";
import Pagination from "@/utils/Pagination";
import { getUsers, adminDeleteUser, fetchUsers } from "@/apis/User";

import { exportUsersExcel } from "@/components/pages/Admin/User/UsersExportExcel";
import { importUsersExcel } from "@/components/pages/Admin/User/UsersImportExcel";

const ROLES = [
  { label: "All roles", value: "ALL" },
  { label: "Admin", value: "ADMIN" },
  { label: "Tour Guide", value: "TOUR_GUIDE" },
  { label: "Hotel Manager", value: "HOTEL_MANAGER" },
  { label: "Customer", value: "CUSTOMER" },
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

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();

  const pageRaw = searchParams.get("page");
  const pageNum = Number(pageRaw);
  const currentPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const roleFromUrl = searchParams.get("role") || "ALL";
  const [roleFilter, setRoleFilter] = useState(roleFromUrl);

  // ✅ search state (chỉ thêm)
  const qFromUrl = searchParams.get("q") || "";
  const [q, setQ] = useState(qFromUrl);

  const fileInputId = "users-import-excel-input";

  async function loadUsers(pageUI, role) {
    setLoading(true);
    try {
      const keyword = (searchParams.get("q") || "").trim();

      const data = keyword
        ? await fetchUsers({
            keyword,
          })
        : await getUsers({
            page: pageUI,
            size: 10,
            role,
            status: "ALL",
          });

      setUsers(data?._embedded?.users ?? []);
      setTotalPages(data?.page?.totalPages ?? 1);
    } catch {
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(currentPage, roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, roleFilter, qFromUrl]);

  const handlePageChange = (pageUI) => {
    const safe = clamp(pageUI, 1, totalPages || 1);
    const next = { page: String(safe) };
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

    const next = { page: "1" };
    if (v !== "ALL") next.role = v;

    const keyword = (searchParams.get("q") || "").trim();
    if (keyword) next.q = keyword;

    setSearchParams(next);
  };

  const handleRemove = async (userId) => {
    await adminDeleteUser(userId);
    loadUsers(currentPage, roleFilter);
  };

  // Export Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await exportUsersExcel({
        role: roleFilter,
        status: "ALL",
      });
    } catch (e) {
      alert("Export failed: " + (e?.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  // Import Excel: click -> mở chọn file
  const handlePickImport = () => {
    const el = document.getElementById(fileInputId);
    el?.click();
  };

  // Import Excel
  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const rs = await importUsersExcel(file, {
        defaultRole: roleFilter === "ALL" ? "CUSTOMER" : roleFilter,
        defaultStatus: "Activated",
        defaultPassword: "123456",
      });

      if (rs?.errors?.length) {
        alert(
          `Import xong: ${rs.ok} OK, ${rs.fail} FAIL\n\n` +
            rs.errors.slice(0, 10).join("\n"),
        );
      } else {
        alert(`Import xong: ${rs.ok} OK, ${rs.fail} FAIL`);
      }

      loadUsers(currentPage, roleFilter);
    } catch (err) {
      alert(err?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // ✅ submit search: set URL q (chỉ thêm)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const kw = (q || "").trim();

    const next = { page: "1" };
    if (roleFilter !== "ALL") next.role = roleFilter;
    if (kw) next.q = kw;

    setSearchParams(next);
  };

  const handleClearSearch = () => {
    setQ("");
    const next = { page: "1" };
    if (roleFilter !== "ALL") next.role = roleFilter;
    setSearchParams(next);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header + toolbar responsive */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold">User management</h1>

          {/* Role select (mobile full width) */}
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

        {/* ✅ Search bar (chỉ thêm, không đổi cái khác) */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users..."
            className="flex-1 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 outline-none"
          />
          {q?.trim() && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {/* Actions: wrap + mobile full width */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2 sm:gap-3">
          {/* input hidden import */}
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
                <Spinner /> Importing...
              </>
            ) : (
              "Import Excel"
            )}
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <Spinner /> Exporting...
              </>
            ) : (
              "Export Excel"
            )}
          </button>

          <Link to="/admin/users/new" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition">
              + Add User
            </button>
          </Link>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-10 flex items-center justify-center gap-3 text-gray-600">
          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No users found.</p>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6">
          {users.map((user) => (
            <AdminUserCard
              key={user.userId}
              user={user}
              onRemove={handleRemove}
            />
          ))}
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
