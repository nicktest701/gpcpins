export const isOnline = () => {
  let online = window.navigator.onLine;
  window.addEventListener("online", () => (online = true));
  window.addEventListener("offline", () => (online = false));
  return online;
};
