import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/providers/AuthProvider";

const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA;
function User() {
  const { user } = useContext(AuthContext);

  if (user?.id) {
    return <Navigate to="/" />;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_KEY}
      container={{
        parameters: {
          badge: "bottomleft", // optional, default undefined
        },
      }}
    >
      <div
        style={{
          height: "100svh",
        }}
      >
        <Outlet />
      </div>
    </GoogleReCaptchaProvider>
  );
}

export default User;
