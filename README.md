# EasyTravel - Website Đặt Tour Du Lịch

**EasyTravel** là website hỗ trợ người dùng **tìm kiếm, đặt tour du lịch và khách sạn**, đồng thời khám phá các **bài viết blog du lịch** với nội dung phong phú và trực quan.

Dự án được xây dựng bằng **React 19** và **Vite**, tích hợp **REST API**, hỗ trợ **đa ngôn ngữ** và **phân quyền người dùng**, hướng tới trải nghiệm mượt mà, hiện đại và dễ sử dụng.

## 🚀 Cách chạy dự án

1.  **Tải dự án về máy:**
    - Clone bằng Git:
      ```bash
      git clone https://github.com/bincasau/SE347_FE_EasyTravel.git
      ```

2.  **Cài đặt dependencies:**
    - Chạy lệnh:
      ```bash
      npm install
      ```

3.  **Chạy dự án:**
    - Chạy lệnh:
      ```bash
      npm run dev
      ```
    - Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 📂 Cấu trúc dự án

SE347_FE_EasyTravel/

- public/ (Chứa các tài nguyên tĩnh như font, hình ảnh,...)
- src/
  - apis/ (Chứa các file gọi API như AccountAPI.jsx, Blog.jsx, Booking.jsx,...)
  - assets/ (Chứa các tài nguyên như hình ảnh, styles,...)
  - components/ (Chứa các thành phần giao diện như layout, pages,...)
  - contexts/ (Chứa các context dùng cho state management, ví dụ LangContext.jsx)
  - data/ (Chứa các file dữ liệu tĩnh)
  - i18n/ (Chứa các file đa ngôn ngữ như dict.en.js, dict.vi.js,...)
  - models/ (Chứa các file định nghĩa model dữ liệu như Tour.js,...)
  - pages/ (Chứa các file định nghĩa các trang chính như Home.jsx, Tour.jsx,...)
  - utils/ (Chứa các file tiện ích như auth.js,...)
  - App.css
  - App.jsx
  - index.css
  - main.jsx
- eslint.config.js (Cấu hình ESLint cho dự án)
- index.html (File HTML chính của dự án)
- package.json (Danh sách dependencies và scripts của dự án)
- postcss.config.js (Cấu hình PostCSS)
- README.md (Tài liệu hướng dẫn dự án)
- tailwind.config.js (Cấu hình Tailwind CSS)
- vite.config.js (Cấu hình Vite)

---

## ✨ Tính năng chính

- 🌐 **Đa ngôn ngữ**: Hỗ trợ **Tiếng Việt** và **Tiếng Anh**.
- 🧳 **Đặt tour & khách sạn**: Tìm kiếm, xem chi tiết và đặt dịch vụ nhanh chóng.
- 👥 **Phân quyền người dùng**:
  - Khách du lịch
  - Hướng dẫn viên
  - Quản lý khách sạn
  - Quản trị viên (Admin)
- 📝 **Blog du lịch**: Đọc và đăng bài viết chia sẻ kinh nghiệm du lịch.
- 🔍 **Tìm kiếm & lọc nâng cao**: Lọc, sắp xếp tour và khách sạn theo nhiều tiêu chí.
- 📜 **Lịch sử đặt chỗ**: Xem lại các tour và khách sạn đã đặt.
- 🔐 **Xác thực & bảo mật**: Đăng nhập, đăng ký và xác thực bằng **JWT**.
- 📱 **Responsive Design**: Tối ưu hiển thị trên **PC, tablet và mobile**.
- 🔗 **Tích hợp REST API**: Đồng bộ dữ liệu với hệ thống backend.

---

## 🎥 Video Demo

---

## 👨‍💻 Nhóm thực hiện

| STT | Họ và Tên        | MSSV     |
| :-- | :--------------- | :------- |
| 1   | Huỳnh Tuấn Phi   | 23521154 |
| 2   | Võ Thành Nhân    | 23521092 |
| 3   | Nguyễn Lý Anh Vũ | 23521810 |
