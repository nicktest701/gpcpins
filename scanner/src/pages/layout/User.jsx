import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/providers/AuthProvider";

const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA;
function User() {
  const { user } = useAuth();

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
