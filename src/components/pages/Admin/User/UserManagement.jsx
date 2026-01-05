import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminUserCard from "@/components/pages/Admin/User/AdminUserCard";
import Pagination from "@/utils/Pagination";
import { getUsers } from "@/apis/User";

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

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();

  const pageRaw = searchParams.get("page");
  const pageNum = Number(pageRaw);
  const currentPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const roleFromUrl = searchParams.get("role") || "ALL";
  const [roleFilter, setRoleFilter] = useState(roleFromUrl);

  async function loadUsers(pageUI, role) {
    setLoading(true);
    try {
      const data = await getUsers({
        page: pageUI,
        size: 10,
        role,
        status: "ALL",
      });

      setUsers(data._embedded?.users ?? []);
      setTotalPages(data.page?.totalPages ?? 1);
    } catch (e) {
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(currentPage, roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, roleFilter]);

  const handlePageChange = (pageUI) => {
    const safe = clamp(pageUI, 1, totalPages || 1);
    const next = { page: String(safe) };
    if (roleFilter !== "ALL") next.role = roleFilter;
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
    setSearchParams(next);
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User management</h1>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 outline-none"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <button className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
            + Add User
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No users found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {users.map((user) => (
            <AdminUserCard
              key={user.userId}
              user={user}
              onEdit={() => {}}
              onRemove={() => {}}
            />
          ))}
        </div>
      )}

      <Pagination
        totalPages={totalPages}
        currentPage={clamp(currentPage, 1, totalPages || 1)}
        onPageChange={handlePageChange}
        visiblePages={visiblePages}
      />
    </div>
  );
}
