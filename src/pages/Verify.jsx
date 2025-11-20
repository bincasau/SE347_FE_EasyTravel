import { useEffect, useState } from "react";
import { activateAccount } from "@/apis/AccountAPI";

export default function Verify() {
  const [message, setMessage] = useState("Đang xác thực tài khoản...");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const email = query.get("email");
    const code = query.get("code");

    if (!email || !code) {
      setMessage("Invalid authentication link!");
      return;
    }

    async function activate() {
      try {
        const { ok, message } = await activateAccount(email, code);

        if (ok) {
          setMessage(message || "Authentication successful!");
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        } else {
          setMessage(message || "Authentication failed!");
        }
      } catch {
        setMessage("Authentication failed! Unable to connect.");
      }
    }

    activate();
  }, []);

  return (
    <div className="w-full h-[60vh] flex items-center justify-center text-xl font-semibold">
      {message}
    </div>
  );
}
