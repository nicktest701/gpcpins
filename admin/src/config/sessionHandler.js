//Get all Users
// const ACCESS_EXPIRATION = new Date(Date.now() + 3600000);

import cookie from "js-cookie";
import _ from "lodash";

export const getUser = () => {
  const user = localStorage.getItem("_SSID_AdxbAb__");

  if (user === undefined || user === null || user === "undefined") {
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

export const getToken = () => {
  const token = cookie.get("SSIDD");

  if (_.isEmpty(token)) {
    return "";
  } else {
    return JSON.parse(token);
  }
};

// export const getRefreshToken = () => {
//   const token =
//     localStorage.getItem("_SSID_AdxbAb__R") ||
//     sessionStorage.getItem("_SSID_AdxbAb__R");

//   if (token === undefined || token === null || token === 'undefined') {
//     return "";
//   }
//   return token;

// };

export const saveToken = (accessToken, refreshToken) => {
  if (_.isEmpty(accessToken)) {
    return;
  }

  cookie.set("SSIDD", JSON.stringify(accessToken), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
};

export const saveAccessToken = (accessToken) => {
  if (_.isEmpty(accessToken)) {
    return;
  }

  cookie.set("SSIDD", JSON.stringify(accessToken), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
};

export const deleteToken = () => {
  cookie.remove("SSIDD");
};

export function parseJwt(token) {
  if (!token || token === undefined || token === "undefined") {
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
        .join(""),
    );

    return JSON.parse(jsonPayload);
  }
}
