// ---------------- HELPERS ----------------
const safeJSON = (val, fallback = {}) => {
  try {
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

module.exports = {
  safeJSON,
};
