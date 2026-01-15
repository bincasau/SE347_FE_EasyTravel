import React, { useState, useEffect } from "react";
import { popup } from "@/utils/popup";

export default function BookingStepTour2({
  bookingData,
  setBookingData,
  nextStep,
  prevStep,
}) {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Field nào đã được BE trả về (có giá trị) thì khóa không cho sửa
  const [lockedFields, setLockedFields] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
  });

  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("⚠ No JWT token found!");
      // Không có token => user tự nhập hết => không khóa field nào
      return;
    }

    fetch("http://localhost:8080/account/detail", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `Unauthorized (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        const nextUserInfo = {
          name: (data?.name || "").trim(),
          email: (data?.email || "").trim(),
          phone: (data?.phone || "").trim(),
          address: (data?.address || "").trim(),
        };

        setUserInfo(nextUserInfo);

        // Có dữ liệu thì khóa, thiếu thì mở cho nhập
        setLockedFields({
          name: !!nextUserInfo.name,
          email: !!nextUserInfo.email,
          phone: !!nextUserInfo.phone,
          address: !!nextUserInfo.address,
        });
      })
      .catch((err) => {
        console.error("❌ Error fetching user:", err);
        popup.error("Không thể lấy thông tin người dùng. Vui lòng nhập thủ công.");
        // Lỗi fetch => không khóa field nào (user tự nhập)
        setLockedFields({
          name: false,
          email: false,
          phone: false,
          address: false,
        });
      });
  }, []);

  const handleChange = (field, value) => {
    // Nếu field đang khóa thì không cho đổi
    if (lockedFields[field]) return;

    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateBeforeContinue = () => {
    // Yêu cầu nhập đủ 4 field (vì bạn nói "kh đủ thì yêu cầu nhập mới qua bước")
    if (!userInfo.name.trim()) {
      popup.error("Vui lòng nhập họ tên.");
      return false;
    }

    if (!userInfo.phone.trim() || userInfo.phone.trim().length < 8) {
      popup.error("Số điện thoại không hợp lệ (ít nhất 8 ký tự).");
      return false;
    }

    if (!userInfo.email.trim() || !userInfo.email.includes("@")) {
      popup.error("Email không hợp lệ.");
      return false;
    }

    if (!userInfo.address.trim()) {
      popup.error("Vui lòng nhập địa chỉ.");
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateBeforeContinue()) return;

    setBookingData((prev) => ({
      ...prev,
      user: { ...userInfo },
    }));

    nextStep();
  };

  // Helper UI: placeholder khác nhau nếu field bị khóa / thiếu
  const getPlaceholder = (field) =>
    lockedFields[field] ? "Đã tự động điền" : "Vui lòng nhập";

  // Helper UI: class khi disabled
  const inputClass = (disabled) =>
    `w-full border rounded-lg px-4 py-2 text-gray-700 ${
      disabled ? "bg-gray-100 cursor-not-allowed" : ""
    }`;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        Traveler Information
      </h2>

      {/* NAME */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Full Name</label>
        <input
          type="text"
          value={userInfo.name}
          placeholder={getPlaceholder("name")}
          disabled={lockedFields.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={inputClass(lockedFields.name)}
        />
        {lockedFields.name && (
          <p className="text-xs text-gray-500 mt-1">
            Thông tin được lấy từ tài khoản và không thể chỉnh sửa.
          </p>
        )}
      </div>

      {/* PHONE */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Phone</label>
        <input
          type="tel"
          value={userInfo.phone}
          placeholder={getPlaceholder("phone")}
          disabled={lockedFields.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className={inputClass(lockedFields.phone)}
        />
        {lockedFields.phone && (
          <p className="text-xs text-gray-500 mt-1">
            Thông tin được lấy từ tài khoản và không thể chỉnh sửa.
          </p>
        )}
      </div>

      {/* EMAIL */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={userInfo.email}
          placeholder={getPlaceholder("email")}
          disabled={lockedFields.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={inputClass(lockedFields.email)}
        />
        {lockedFields.email && (
          <p className="text-xs text-gray-500 mt-1">
            Thông tin được lấy từ tài khoản và không thể chỉnh sửa.
          </p>
        )}
      </div>

      {/* ADDRESS */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Address</label>
        <input
          type="text"
          value={userInfo.address}
          placeholder={getPlaceholder("address")}
          disabled={lockedFields.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className={inputClass(lockedFields.address)}
        />
        {lockedFields.address && (
          <p className="text-xs text-gray-500 mt-1">
            Thông tin được lấy từ tài khoản và không thể chỉnh sửa.
          </p>
        )}
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Back
        </button>

        <button
          onClick={handleContinue}
          className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
