import { Line } from "react-chartjs-2";
import Box from "@mui/material/Box";
import { useTheme, useMediaQuery } from "@mui/material";
import { currencyFormatter } from "@/constants";
import { legendTheme, tooltipTheme, verticalGradient } from "./chartUtils";

const LineChart = ({ height, labels, datasets }) => {
  const { palette, typography, breakpoints } = useTheme();
  const matches = useMediaQuery(breakpoints.down("md"));

  const styledDatasets = (datasets ?? []).map((ds) => {
    const baseColor = ds.borderColor || palette.primary.main;
    return {
      borderWidth: 2.5,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHitRadius: 12,
      pointBackgroundColor: palette.background.paper,
      pointBorderWidth: 2,
      fill: true,
      ...ds,
      backgroundColor: (context) => {
        const { chart } = context;
        const { ctx, chartArea } = chart;
        if (!chartArea) return "transparent";
        return verticalGradient(ctx, chartArea, baseColor, [0.22, 0]);
      },
    };
  });

  return (
    <Box sx={{ minWidth: 200, height: height || 400 }}>
      <Line
        data={{ labels, datasets: styledDatasets }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 4 },
          interaction: { mode: "index", intersect: false },
          scales: {
            x: {
              ticks: { color: palette.text.secondary, font: { size: matches ? 10 : 11 } },
              grid: { display: false, drawBorder: false },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: palette.text.secondary,
                font: { size: 11 },
                callback: (value) => currencyFormatter(value),
              },
              grid: { color: palette.divider, drawBorder: false, borderDash: [4, 4] },
              border: { display: false },
            },
          },
          plugins: {
            legend: legendTheme(palette, typography.fontFamily),
            tooltip: tooltipTheme({ currencyFormatter }),
            // Same reasoning as the bar chart: per-point boxes got noisy across
            // 4 series x 6 days, so the info now lives in the hover tooltip.
            datalabels: { display: false },
          },
        }}
      />
    </Box>
  );
};

export default LineChart;