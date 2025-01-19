//Get all Users
// const ACCESS_EXPIRATION = new Date(Date.now() + 3600000);

export const getUser = () => {
  const user = localStorage.getItem("_SSID__")
  
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
    localStorage.setItem("_SSID_V_USER", JSON.stringify(user));

  }
};

export const deleteUser = () => {
  localStorage.removeItem("_SSID_V_USER");

};

export const getToken = () => {
  const token = localStorage.getItem("_SSID__")

  if (token === undefined || token === null || token === 'undefined') {
    return "";
  }
  return token;

};

export const getRefreshToken = () => {
  const token = localStorage.getItem("_SSID__R")
  if (token === undefined || token === null || token === 'undefined') {
    return "";
  }
  return token;

};

export const saveAccessToken = (accessToken) => {

  if (accessToken === 'undefined' || accessToken === undefined) {
    return;
  }
  localStorage.setItem("_SSID__", accessToken);

};
export const saveToken = (accessToken, refreshToken) => {

  if (accessToken === 'undefined' || accessToken === undefined || refreshToken === 'undefined' || refreshToken === undefined) {
    return;
  }
  localStorage.setItem("_SSID__", accessToken);
  localStorage.setItem("_SSID__R", refreshToken);
};


export const deleteToken = () => {
  localStorage.removeItem("_SSID__");
  localStorage.removeItem("_SSID__R");

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