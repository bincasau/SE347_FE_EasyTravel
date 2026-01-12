import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuth2Redirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("jwt", token);
      window.dispatchEvent(new Event("jwt-changed"));
      navigate("/", { replace: true });
    } else {
      navigate("/login");
    }
  }, [navigate, location]);

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <h2>Đang xác thực tài khoản Google...</h2>
    </div>
  );
};

export default OAuth2Redirect;
