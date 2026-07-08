import cookie from "js-cookie";
import _ from "lodash";

const SAMPLE_ACCESS_EXPIRATION = new Date(
  new Date().getTime() + 10 * 60 * 1000,
);
const ACCESS_EXPIRATION = new Date(
  new Date().getTime() + 3 * 30 * 60 * 60 * 1000,
);
// const REFERESH_EXPIRATION = new Date(
//   new Date().getTime() + 6 * 30 * 60 * 60 * 1000
// );





export const saveUser = (user) => {
  if (user) {
    cookie.set("USSID", JSON.stringify(user), {
      secure: true,
      sameSite: "None",
      expires: 365,
    });
  }
};

export const getToken = () => {
  const token = cookie.get("USSID");

  if (_.isEmpty(token)) {
    return "";
  } else {
    return JSON.parse(token);
  }
};

export const saveAccessToken = (accessToken) => {
  if (_.isEmpty(accessToken)) {
    return;
  }

  cookie.set("USSID", JSON.stringify(accessToken), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
};

export const saveToken = (accessToken) => {
  if (_.isEmpty(accessToken)) {
    return;
  }
  cookie.set("USSID", JSON.stringify(accessToken), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
};

export const deleteToken = () => {
  cookie.remove("USSID");
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
