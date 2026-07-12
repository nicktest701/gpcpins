// utils/time.js
function parseTimeToMs(timeStr) {
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid time format: ${timeStr}`);

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    s: 1000, // seconds
    m: 1000 * 60, // minutes
    h: 1000 * 60 * 60, // hours
    d: 1000 * 60 * 60 * 24, // days
  };

  return value * multipliers[unit];
}

module.exports = {
  parseTimeToMs,
};
