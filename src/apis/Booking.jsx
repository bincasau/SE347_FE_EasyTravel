// @/apis/booking.jsx
const API_BASE = "http://localhost:8080";

export const getRoomBookedDates = async (hotelId, roomId) => {
  const url = `${API_BASE}/hotel-bookings/search/findByHotelHotelIdAndRoomRoomId?hotelId=${hotelId}&roomId=${roomId}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const bookings = data?._embedded?.hotelBookings || [];

    const valid = bookings.filter((b) => b.status === "Success");

    let disabled = [];

    valid.forEach((b) => {
      const start = new Date(`${b.checkInDate}T00:00:00`);
      const end = new Date(`${b.checkOutDate}T00:00:00`);

      let d = new Date(start);

      while (d <= end) {
        disabled.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setDate(d.getDate() + 1);
      }
    });

    return disabled;
  } catch (err) {
    console.error("API ERROR getRoomBookedDates:", err);
    return [];
  }
};

export async function createHotelBooking(payload) {
  const token = localStorage.getItem("jwt");
  const res = await fetch(`${API_BASE}/booking/hotel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to create booking");
  }

  return res.json();
}
