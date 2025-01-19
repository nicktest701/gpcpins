export function serviceAvailable() {
  const currentTime = new Date();
  const hour = currentTime.getHours();
  return hour >= 22 || hour < 7;
}
