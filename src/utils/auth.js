// Đọc token từ localStorage
export function getToken() {
  return localStorage.getItem("jwt"); // dùng đúng key "jwt"
}

// Giải mã payload của JWT
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const jsonPayload = atob(payloadBase64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}
