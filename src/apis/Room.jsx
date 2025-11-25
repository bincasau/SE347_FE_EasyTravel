export const getRoomsByHotel = async (hotelId) => {
  try {
    const res = await fetch(`http://localhost:8080/hotels/${hotelId}/rooms`);
    if (!res.ok) throw new Error("Không thể tải danh sách phòng");
    return await res.json();
  } catch (error) {
    console.error("Lỗi fetch rooms:", error);
    throw error;
  }
};
