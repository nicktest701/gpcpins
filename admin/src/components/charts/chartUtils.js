// Small shared helpers so PieChart / BarChart / LineChart render with a
// consistent, modern Chart.js theme instead of each re-declaring options.

export function hexToRgba(color, alpha = 1) {
  if (!color) return `rgba(15, 23, 42, ${alpha})`;
  if (color.startsWith("rgb")) {
    const [r, g, b] = color.replace(/[^\d,]/g, "").split(",");
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  let hex = color.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Top-to-bottom fade, used for the area fill under lines and the fill of bars.
export function verticalGradient(ctx, chartArea, color, [from = 0.3, to = 0] = []) {
  if (!chartArea) return hexToRgba(color, from);
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, hexToRgba(color, from));
  gradient.addColorStop(1, hexToRgba(color, to));
  return gradient;
}

export function legendTheme(palette, fontFamily) {
  return {
    position: "bottom",
    labels: {
      usePointStyle: true,
      pointStyle: "circle",
      boxWidth: 8,
      boxHeight: 8,
      padding: 16,
      color: palette?.text?.secondary,
      font: { size: 12, family: fontFamily },
    },
  };
}

export function tooltipTheme({ currencyFormatter } = {}) {
  return {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    padding: 10,
    cornerRadius: 8,
    displayColors: true,
    usePointStyle: true,
    boxWidth: 8,
    boxHeight: 8,
    callbacks: currencyFormatter
      ? {
          label: (item) =>
            `${item.dataset?.label ? `${item.dataset.label}: ` : ""}${currencyFormatter(
              item.parsed?.y ?? item.parsed ?? 0
            )}`,
        }
      : undefined,
  };
}
