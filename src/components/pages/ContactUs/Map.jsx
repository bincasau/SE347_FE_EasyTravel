// UITMap.jsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// === Toạ độ ĐH UIT (ĐHQG-HCM, TP. Thủ Đức) ===
const UIT_POS = [10.870246, 106.803269];

// === IMPORT ICON ẢNH CỦA BẠN ===
// Đổi đường dẫn cho đúng dự án của bạn, ví dụ: src/assets/icon/uit-marker.png
import uitMarkerImg from "../../../assets/images/logo.png";

// === Tạo icon tùy chỉnh từ ảnh ===
const customIcon = L.icon({
  iconUrl: uitMarkerImg,
  iconSize: [56, 40], // kích thước hiển thị (chỉnh theo ảnh của bạn)
  iconAnchor: [28, 56], // gốc icon (điểm “chân” đặt xuống map). Nếu icon tròn: [28, 28]
  popupAnchor: [0, -52], // popup nổi lên trên icon
});

export default function Map() {
  return (
    <section className="w-full">
      {/* Khung map: bạn có thể đổi chiều cao (h-[420px], h-[520px]...) */}
      <div className="relative w-full h-[420px]">
        <MapContainer
          center={UIT_POS}
          zoom={15}
          zoomControl={false}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Nền sáng (Carto Positron) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Marker dùng icon ảnh của bạn */}
          <Marker position={UIT_POS} icon={customIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">
                  Đại học Công nghệ Thông tin (UIT) – ĐHQG-HCM
                </div>
                <div>TP. Thủ Đức, TP. Hồ Chí Minh</div>
              </div>
            </Popup>
          </Marker>

          {/* Nút zoom góc phải */}
          <ZoomControl position="topright" />
        </MapContainer>
      </div>
    </section>
  );
}
