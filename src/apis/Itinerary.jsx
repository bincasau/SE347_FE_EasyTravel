// src/apis/Itinerary.js
import { getToken } from "@/utils/auth";
const API_BASE = "http://localhost:8080";

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ===================== GET (public) ===================== */
export async function getItinerariesByTourId(tourId) {
  const res = await fetch(`${API_BASE}/tours/${tourId}/itineraries`);
  if (!res.ok) throw new Error(`GET itineraries failed: ${res.status}`);

  const data = await res.json();

  return data?._embedded?.itineraries ?? [];
}

/* ===================== POST (admin) ===================== */
export async function addItineraryAdmin(tourId, itinerary) {
  const res = await fetch(`${API_BASE}/admin/tour/${tourId}/itinerary`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(itinerary),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Add itinerary failed");
  }

  return await res.json();
}

/* ===================== PUT (admin) ===================== */
export async function updateItineraryAdmin(itineraryId, itinerary) {
  const res = await fetch(`${API_BASE}/admin/tour/itinerary/${itineraryId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(itinerary),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Update itinerary failed");
  }

  return await res.json();
}

/* ===================== DELETE (admin) ===================== */
export async function deleteItineraryAdmin(itineraryId) {
  const res = await fetch(`${API_BASE}/admin/tour/itinerary/${itineraryId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Delete itinerary failed");
  }

  return true;
}
