import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:8080";

function getToken() {
  return (
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

async function fetchWithJwt(url, options = {}) {
  const token = getToken();
  const finalUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const res = await fetch(finalUrl, {
    cache: "no-store",
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res;
}

async function readText(res) {
  try {
    const t = await res.text();
    return t || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

function safe(v) {
  return v === null || v === undefined ? "" : v;
}

// Map 1 participant row -> excel row
function toRow(p, idx) {
  const user = p?.user || p?.customer || p?.account || {};
  return {
    No: idx + 1,
    FullName: safe(user?.name ?? user?.fullName ?? p?.customerName ?? p?.name),
    Email: safe(user?.email ?? p?.email),
    Phone: safe(user?.phoneNumber ?? user?.phone ?? p?.phone),
    Seats: safe(p?.seats ?? p?.quantity ?? p?.people ?? 1),
    Status: safe(p?.status ?? p?.bookingStatus),
    Note: safe(p?.note ?? p?.remark),
  };
}

function badgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "success") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s === "failed") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-gray-50 text-gray-700 ring-gray-200";
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none " +
  "focus:ring-2 focus:ring-gray-200 focus:border-gray-300";

export default function TourParticipants() {
  const nav = useNavigate();
  const { tourId } = useParams();
  const [searchParams] = useSearchParams();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return participants;
    return participants.filter((p) =>
      JSON.stringify(p).toLowerCase().includes(key)
    );
  }, [participants, q]);

  // ✅ FIX: truyền idx vào toRow
  const rows = useMemo(() => filtered.map((p, idx) => toRow(p, idx)), [filtered]);

  const load = useCallback(async () => {
    if (!tourId) return;
    setLoading(true);
    setErrMsg("");
    try {
      const res = await fetchWithJwt(`/tour_guide/tour/${tourId}/participants`);
      if (!res.ok) throw new Error(await readText(res));

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.content || [];
      setParticipants(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setParticipants([]);
      setErrMsg(e?.message || "Không tải được danh sách participants.");
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    load();
  }, [load]);

  const exportExcel = useCallback(() => {
    if (!rows.length) {
      setErrMsg("Không có dữ liệu để export.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);

    // ✅ cols đúng số cột
    ws["!cols"] = [
      { wch: 5 },  // No
      { wch: 22 }, // FullName
      { wch: 26 }, // Email
      { wch: 14 }, // Phone
      { wch: 8 },  // Seats
      { wch: 12 }, // Status
      { wch: 30 }, // Note
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `tour_${tourId}_participants.xlsx`);
  }, [rows, tourId]);

  // ✅ auto export by URL: ?export=1
  useEffect(() => {
    const wantExport = searchParams.get("export") === "1";
    if (!wantExport) return;
    if (loading) return;
    if (rows.length) exportExcel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="mb-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            ← Back
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Tour Participants
          </h1>
          
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Reload"}
          </button>

          <button
            type="button"
            onClick={exportExcel}
            disabled={!rows.length || loading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner /> Export Excel
              </>
            ) : (
              "Export Excel"
            )}
          </button>
        </div>
      </div>

      {errMsg && (
        <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {errMsg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search trong danh sách (tên/email/sđt...)"
            className={`${inputCls} sm:max-w-md`}
          />

          <div className="text-sm text-gray-600">
            Total records: <b>{participants.length}</b>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-5">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-500">
              Chưa có người booking tour này.
            </div>
          ) : (
            <>
              {/* ✅ Mobile: cards */}
              <div className="space-y-3 lg:hidden">
                {rows.map((r) => (
                  <div
                    key={r.No}
                    className="rounded-2xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 break-words">
                          {r.FullName || "-"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {r.Email || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.Phone || "-"}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${badgeClass(
                          r.Status
                        )}`}
                      >
                        {r.Status || "-"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Seats</div>
                        <div className="font-semibold text-gray-900">
                          {r.Seats}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">No</div>
                        <div className="font-semibold text-gray-900">
                          {r.No}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">Note</div>
                        <div className="text-sm text-gray-800 break-words">
                          {r.Note || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ Desktop: table */}
              <div className="hidden lg:block overflow-auto">
                <table className="min-w-[900px] w-full text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-gray-600">
                      {Object.keys(rows[0]).map((k) => (
                        <th key={k} className="px-3 py-2">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.No} className="bg-gray-50">
                        {Object.keys(row).map((k) => (
                          <td key={k} className="px-3 py-3">
                            {String(row[k])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
