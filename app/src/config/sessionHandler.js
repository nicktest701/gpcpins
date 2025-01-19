import cookie from "js-cookie";

const SAMPLE_ACCESS_EXPIRATION = new Date(
  new Date().getTime() + 10 * 60 * 1000
);
const ACCESS_EXPIRATION = new Date(new Date().getTime() + 3 * 30 * 60 * 60 * 1000);
// const REFERESH_EXPIRATION = new Date(
//   new Date().getTime() + 6 * 30 * 60 * 60 * 1000
// );

export const getUser = () => {

  const user = cookie.get("USSID");

  if (user === undefined || user === null || user === 'undefined') {
    return {
      id: "",
      profile: "",
      lastname: "",
      firstname: "",
      email: "",
      phonenumber: "",
      role: "",
      // active: true,
    };
  }
  // return JSON.parse(user);
  const loggedInUser = parseJwt(user);

  return !loggedInUser?.active || loggedInUser?.email === 'test@test.com' ? null : loggedInUser;
};


export const updateUser = (data) => {
  // const user = localStorage.getItem("_USSID_kcYa__");
  const user = cookie.get("USSID");

  // const userInfo = JSON.parse(user);
  const userInfo = parseJwt(user);

  const newUser = {
    ...userInfo,
    ...data,
  };

  cookie.set("USSID", JSON.stringify(newUser), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
};

export const saveUser = (user) => {
  if (user) {

    cookie.set("USSID", JSON.stringify(user), {
      secure: true,
      sameSite: "None",
      expires: 365,
    });
  }
};

export const deleteUser = () => {
  cookie.remove("USSID");
};

export const getToken = () => {
  const token = cookie.get("USSID");


  if (token === undefined || token === null) {
    return "";
  } else {


    return JSON.parse(token);
  }
};

export const getRefreshToken = () => {
  const token = cookie.get("USSIDR");

  if (token === undefined || token === null) {
    return '';
  } else {

    return JSON.parse(token);
  }
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
  // localStorage.setItem("USSID", accessToken);
  // localStorage.setItem("USSIDR", refreshToken);
  if (accessToken === 'undefined' || accessToken === undefined || refreshToken === 'undefined' || refreshToken === undefined) {
    return;
  }

  cookie.set("USSID", JSON.stringify(accessToken), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
  cookie.set("USSIDR", JSON.stringify(refreshToken), {
    secure: true,
    sameSite: "None",
    expires: 365,
  });
};

export const saveNonToken = (accessToken, refreshToken) => {
  // sessionStorage.setItem("USSID", accessToken);
  // sessionStorage.setItem("USSIDR", refreshToken);


  cookie.set("USSID", JSON.stringify(accessToken), {
    secure: true,
    sameSite: "None",
    expires: SAMPLE_ACCESS_EXPIRATION,
  });
  cookie.set("USSIDR", JSON.stringify(refreshToken), {
    secure: true,
    sameSite: "None",
    expires: ACCESS_EXPIRATION,
  });
};

export const deleteToken = () => {

  cookie.remove("USSID");
  cookie.remove("USSIDR");

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
