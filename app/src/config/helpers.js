export const safeJSON = (val, fallback = {}) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};