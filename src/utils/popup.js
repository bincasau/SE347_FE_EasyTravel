import Swal from "sweetalert2";

export const popup = {
  success: (text, title = "Thành công") =>
    Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonColor: "#f97316",
    }),

  error: (text, title = "Lỗi") =>
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonColor: "#f97316",
    }),

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
};
