import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAccountDetail } from "@/apis/AccountAPI";
import { setAuthFlag, setToken } from "@/utils/auth";

const OAuth2Redirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const finalize = () => {
      window.dispatchEvent(new Event("jwt-changed"));
      navigate("/", { replace: true });
    };

    const run = async () => {
      if (token) {
        setToken(token);
        setAuthFlag();
        finalize();
        return;
      }

      try {
        await getAccountDetail();
        finalize();
      } catch {
        navigate("/login");
      }
    };

    run();
  }, [navigate, location]);

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <h2>Authenticating with Google...</h2>
    </div>
  );
};

export default OAuth2Redirect;




