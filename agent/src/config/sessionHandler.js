import cookie from "js-cookie";

// const ACCESS_EXPIRATION = new Date(new Date().getTime() + 1 * 60 * 60 * 1000);
// const REFERESH_EXPIRATION = new Date(new Date().getTime() + 59 * 60 * 1000);


export const getUser = () => {

  const user = cookie.get("_SSID_AxbAb__");

  if (user === undefined || user === null || user === 'undefined') {
    return {
      id: "",
      profile: "",
      name: "",
      email: "",
      phonenumber: "",
      role: "",
      active: true,
    };
  }

  return parseJwt(user);

};

export const saveUser = (user) => {
  if (user) {

    cookie.set("_SSID_AxbAb__", JSON.stringify(user), {
      secure: true,
      sameSite: "None",
      expires: 365,
    });
  }
};

export const deleteUser = () => {
  cookie.remove("_SSID_AxbAb__");
};

export const getToken = () => {
  const token = cookie.get("_SSID_AxbAb__");

  if (token === undefined || token === null) {
    return "";
  }

  return JSON.parse(token);
};

export const getRefreshToken = () => {
  const token = cookie.get("_SSID_AxbAb__R");

  if (token === undefined || token === null) {
    return "";
  }

  return JSON.parse(token);
};

export const saveAccessToken = (accessToken) => {

  if (accessToken === 'undefined' || accessToken === undefined) {
    return;
  }

  cookie.set("USSID", JSON.stringify(accessToken), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
};


export const saveToken = (accessToken, refreshToken) => {

  if (accessToken === 'undefined' || accessToken === undefined || refreshToken === 'undefined' || refreshToken === undefined) {
    return;
  }


  cookie.set("_SSID_AxbAb__", JSON.stringify(accessToken), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
  cookie.set("_SSID_AxbAb__R", JSON.stringify(refreshToken), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
};

export const deleteToken = () => {

  cookie.remove("_SSID_AxbAb__");
  cookie.remove("_SSID_AxbAb__R");

};

export function parseJwt(token) {
  if (!token || token === undefined || token === 'undefined') {
    return null;
  } else {


    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }
}
