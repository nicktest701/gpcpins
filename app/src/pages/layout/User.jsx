
import { Outlet } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

function User() {
  const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA;
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_KEY}
      container={{
        parameters: {
          badge: 'bottomleft', // optional, default undefined
        },
      }}
    >
      <Outlet />
    </GoogleReCaptchaProvider>
  );
}

export default User;
