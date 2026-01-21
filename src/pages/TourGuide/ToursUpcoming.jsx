// =====================================
// FILE: src/pages/ToursUpcoming.jsx
// Upcoming tours for TOUR_GUIDE
// - Horizontal full-width cards
// - 5 items per page
// - Pagination
// - View participants + Export (query export=1)
// =====================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "@/utils/auth";

const API_BASE = "http://localhost:8080";

async function fetchWithJwt(url, options = {}) {
  const token = getToken();
  const finalUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const res = await fetch(finalUrl, {
    cache: "no-store",
    ...options,
    credentials: "include",
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

function fmtDate(d) {
  if (!d) return "--";
  try {
    return new Date(d).toLocaleDateString("vi-VN");
  } catch {
    return "--";
  }
}

function normalizeTour(t, idx) {
  const id = t?.tourId ?? t?.id ?? t?.tourID ?? idx;
  return {
    id,
    title: t?.title ?? t?.name ?? `Tour #${id}`,
    destination: t?.destination ?? t?.to ?? "",
    startDate: t?.startDate ?? t?.from ?? t?.start_time ?? t?.start ?? null,
    endDate: t?.endDate ?? t?.toDate ?? t?.end_time ?? t?.end ?? null,
    status: t?.status ?? "",
    raw: t,
  };
}

export default function ToursUpcoming() {
  const nav = useNavigate();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // ✅ pagination
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(1);
  const size = 5;

  const loadUpcoming = useCallback(async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await fetchWithJwt(
        `/tour_guide/upcoming?page=${page}&size=${size}`
      );
      if (!res.ok) throw new Error(await readText(res));

      const data = await res.json();

      const list =
        (Array.isArray(data) && data) ||
        data?.content ||
        data?._embedded?.tours ||
        data?._embedded?.tourList ||
        [];

      const normalized = (Array.isArray(list) ? list : []).map(normalizeTour);
      setTours(normalized);

      // ✅ totalPages nếu BE trả kiểu Page
      const tp = Number(data?.totalPages) || Number(data?.page?.totalPages) || 1;
      setTotalPages(Math.max(1, tp));
    } catch (e) {
      console.error(e);
      setTours([]);
      setTotalPages(1);
      setErrMsg(e?.message || "Failed to load upcoming tours.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadUpcoming();
  }, [loadUpcoming]);

  const empty = !loading && tours.length === 0;

  const visiblePages = useMemo(() => {
    // hiển thị tối đa 5 nút trang
    const current = page + 1;
    const tp = totalPages;

    if (tp <= 5) return Array.from({ length: tp }, (_, i) => i + 1);

    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= tp - 2) return [tp - 4, tp - 3, tp - 2, tp - 1, tp];

    return [current - 2, current - 1, current, current + 1, current + 2];
  }, [page, totalPages]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* ✅ HEADER: title centered + reload on right */}
      <div className="relative mb-6">
        <h1 className="text-3xl text-center font-bold text-orange-500">
          Upcoming Tours
        </h1>

        <button
          type="button"
          onClick={loadUpcoming}
          className="absolute right-0 top-1/2 -translate-y-1/2
                     px-4 py-2 rounded-xl border border-orange-300
                     text-orange-600 hover:bg-orange-50"
        >
          Reload
        </button>
      </div>

      {errMsg && (
        <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {errMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-16">Loading...</div>
      ) : empty ? (
        <div className="text-center text-gray-500 py-16">
          No upcoming tours yet.
        </div>
      ) : (
        <div className="space-y-4">
          {tours.map((t) => (
            <div
              key={t.id}
              className="
                w-full bg-white border rounded-2xl p-5
                shadow-sm hover:shadow-md transition
                flex flex-col sm:flex-row sm:items-center gap-4
              "
            >
              {/* LEFT */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">
                  
                </div>

                <div className="text-lg font-semibold text-gray-800 line-clamp-1">
                  {t.title}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2 text-sm text-gray-600">
                  {t.destination && <div>📍 {t.destination}</div>}
                  <div>
                    <span className="text-gray-500">Start:</span>{" "}
                    <b>{fmtDate(t.startDate)}</b>
                  </div>
                  <div>
                    <span className="text-gray-500">End:</span>{" "}
                    <b>{fmtDate(t.endDate)}</b>
                  </div>
                </div>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => nav(`/guide/tour/${t.id}/participants`)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600"
                >
                  View participants
                </button>

                
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={`px-4 py-2 rounded-xl border text-sm font-semibold ${
              page === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-orange-100"
            }`}
          >
            ‹ Prev
          </button>

          {visiblePages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p - 1)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold ${
                page + 1 === p
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-white text-gray-700 hover:bg-orange-100"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page + 1 >= totalPages}
            className={`px-4 py-2 rounded-xl border text-sm font-semibold ${
              page + 1 >= totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-orange-100"
            }`}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
