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

function fmtDateTime(d) {
  if (!d) return "--";
  try {
    return new Date(d).toLocaleString("vi-VN");
  } catch {
    return "--";
  }
}

// Map 1 participant row (TourBooking) -> excel row
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

  const rows = useMemo(() => filtered.map(toRow), [filtered]);

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
    ws["!cols"] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 22 },
      { wch: 26 },
      { wch: 14 },
      { wch: 8 },
      { wch: 14 },
      { wch: 18 },
      { wch: 24 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `tour_${tourId}_participants.xlsx`);
  }, [rows, tourId]);

  // nếu vào URL có ?export=1 thì load xong export luôn
  useEffect(() => {
    const wantExport = searchParams.get("export") === "1";
    if (!wantExport) return;
    if (loading) return;
    if (rows.length) exportExcel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={() => nav(-1)}
            className="mb-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-gray-800">
            Tour Participants
          </h1>
          <p className="text-sm text-gray-500">
            Tour ID: <b>{tourId}</b> • Tổng: <b>{filtered.length}</b> người (đang hiển thị)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded-xl border border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={exportExcel}
            disabled={!rows.length}
            className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300"
          >
            Export Excel
          </button>
        </div>
      </div>

      {errMsg && (
        <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {errMsg}
        </div>
      )}

      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search trong danh sách (tên/email/sđt...)"
            className="w-full sm:max-w-md border rounded-xl px-3 py-2"
          />

          <div className="text-sm text-gray-600">
            Total records: <b>{participants.length}</b>
          </div>
        </div>

        <div className="mt-5 overflow-auto">
          <table className="min-w-[900px] w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-gray-600">
                {Object.keys(rows[0] || { No: "" }).map((k) => (
                  <th key={k} className="px-3 py-2">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-gray-500" colSpan={20}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-gray-500" colSpan={20}>
                    Chưa có người booking tour này.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="bg-gray-50 border">
                    {Object.keys(row).map((k) => (
                      <td key={k} className="px-3 py-3">
                        {k === "CreatedAt" ? fmtDateTime(row[k]) : String(row[k])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
