import Swal from "sweetalert2";

export const popup = {
  /* =====================
     SUCCESS
  ===================== */
  success: (text, title = "Thành công") =>
    Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonColor: "#f97316",
    }),

  /* =====================
     ERROR (❗ chỉ message text)
     - KHÔNG icon
     - KHÔNG spinner
  ===================== */
  error: (text, title = "Lỗi") =>
    Swal.fire({
      title,
      text,
      icon: undefined, // ❗ không icon
      confirmButtonText: "OK",
      confirmButtonColor: "#f97316",
    }),

  /* =====================
     CONFIRM
  ===================== */
  confirm: (text, title = "Xác nhận") =>
    Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#f97316",
    }).then((r) => r.isConfirmed),

  /* =====================
     LOADING (spinner)
     - Trả về hàm close()
  ===================== */
  loading: (text = "Đang xử lý...") => {
    Swal.fire({
      title: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading(); // ✅ vòng xoay tròn
      },
    });

    // ✅ trả về hàm đóng loading
    return () => Swal.close();
  },
};
