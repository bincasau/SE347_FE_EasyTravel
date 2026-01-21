import { getToken } from "@/utils/auth";

const BASE_URL = "http://localhost:8080";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? JSON.parse(text) : null;
}

function buildQuery({ page = 0, size = 10, start, end }) {
  const p = new URLSearchParams();
  p.set("page", String(page));
  p.set("size", String(size));
  if (start) p.set("start", start); // yyyy-mm-dd
  if (end) p.set("end", end);       // yyyy-mm-dd
  return p.toString();
}

export async function fetchHotelBookingHistory({ page = 0, size = 10, start, end }) {
  const token = getToken();
  const qs = buildQuery({ page, size, start, end });
  return fetchJSON(`${BASE_URL}/booking/history/hotels?${qs}`, {
    method: "GET",
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function fetchTourBookingHistory({ page = 0, size = 10, start, end }) {
  const token = getToken();
  const qs = buildQuery({ page, size, start, end });
  return fetchJSON(`${BASE_URL}/booking/history/tours?${qs}`, {
    method: "GET",
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
