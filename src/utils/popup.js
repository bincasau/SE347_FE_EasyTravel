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
     ERROR
     - có icon lỗi
  ===================== */
  error: (text, title = "Lỗi") =>
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "OK",
      confirmButtonColor: "#f97316",
    }),

  /* =====================
     CONFIRM (thường)
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
     CONFIRM DANGER (❗ XOÁ / NGUY HIỂM)
  ===================== */
  confirmDanger: (text, title = "Cảnh báo") =>
    Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626", // đỏ
      cancelButtonColor: "#9ca3af", // xám
      reverseButtons: true,
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
        Swal.showLoading();
      },
    });

    return () => Swal.close();
  },
};
