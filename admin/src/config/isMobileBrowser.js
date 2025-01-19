export function isMobileBrowser() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  // Check if the user is using a touch device
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isMobile || isTouchDevice) {
    return true;
  }
}
