//Get all Users
// const ACCESS_EXPIRATION = new Date(Date.now() + 3600000);

import cookie from "js-cookie";
import _ from "lodash";

const ACCESS_TOKEN_EXPIRY_MINUTES = 5;
const minutes = (m) => m / (24 * 60);

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

export const saveToken = (accessToken) => {
  if (_.isEmpty(accessToken)) {
    return;
  }
  saveAccessToken(accessToken);
};

export const saveAccessToken = (accessToken) => {
  if (_.isEmpty(accessToken)) {
    return;
  }

  cookie.set("SSIDD", JSON.stringify(accessToken), {
    secure: window.location.protocol === "https:",
    sameSite: "Lax",
    path: "/",
    expires: minutes(ACCESS_TOKEN_EXPIRY_MINUTES),
    // secure: true,
    // sameSite: "None",
  });
};

export const deleteToken = () => {
  cookie.remove("SSIDD",{path:'/'});
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
