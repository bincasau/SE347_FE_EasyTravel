import { FaRegStar } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import {
  FaRegClock,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";

const S3_HOTEL_BASE ="https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

export default function AdminHotelCard({ hotel, onEdit, onRemove }) {
  const imageSrc = `${S3_HOTEL_BASE}/${hotel.mainImage}`;

  return (
    <div className="flex items-center gap-8 bg-white p-6 rounded-2xl shadow-md w-full">
      {/* IMAGE */}
      <img
        src={imageSrc}
        alt={hotel.name}
        className="w-60 h-36 rounded-xl object-cover flex-shrink-0 bg-gray-100"
      />

      {/* LEFT INFO */}
      <div className="flex flex-col flex-1">
        {/* Tên 1 dòng, nếu dài thì truncate */}
        <h2 className="text-2xl font-semibold mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
          {hotel.name}
        </h2>

        <div className="space-y-1 text-sm text-gray-700">
          {/* HOTEL ID */}
          <div className="grid grid-cols-[auto,1fr] gap-x-3">
            <div className="flex items-center gap-2">
              <FaBuilding className="text-orange-500" />
              <span className="font-semibold">Hotel ID:</span>
            </div>
            <span>{hotel.hotelId}</span>
          </div>

          {/* ADDRESS – value có thể dài, tràn qua nhiều hàng */}
          <div className="grid grid-cols-[auto,1fr] gap-x-3">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-orange-500" />
              <span className="font-semibold">Address:</span>
            </div>
            <p className="break-words">{hotel.address}</p>
          </div>

          {/* EMAIL */}
          <div className="grid grid-cols-[auto,1fr] gap-x-3">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-orange-500" />
              <span className="font-semibold">Email:</span>
            </div>
            <p className="break-words">{hotel.email}</p>
          </div>

          {/* HOTLINE */}
          <div className="grid grid-cols-[auto,1fr] gap-x-3">
            <div className="flex items-center gap-2">
              <FaPhone className="text-orange-500" />
              <span className="font-semibold">Hotline:</span>
            </div>
            <span>{hotel.phoneNumber}</span>
          </div>
        </div>
      </div>

      {/* RIGHT INFO */}
      <div className="flex flex-col justify-center text-sm text-gray-700 w-56">
        <p className="flex items-center gap-2">
          <FaRegStar className="text-orange-500" />
          <span className="font-semibold">Rate:</span> {hotel.rate ?? "4.9"}
        </p>

        <p className="flex items-center gap-2 mt-2">
          <FaPlus className="text-orange-500" />
          <span className="font-semibold">Added on:</span>{" "}
          {new Date(hotel.createdAt).toLocaleDateString("en-GB")}
        </p>

        <p className="flex items-center gap-2 mt-2">
          <FaRegClock className="text-orange-500" />
          <span className="font-semibold">Update:</span>{" "}
          {new Date(hotel.updatedAt).toLocaleDateString("en-GB")}
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col items-end gap-4 ml-4">
        <button
          onClick={() => onEdit(hotel)}
          className="border border-orange-500 text-orange-500 px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium"
        >
          Edit
        </button>

        <button
          onClick={() => onRemove(hotel.hotelId)}
          className="bg-orange-500 text-white px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
