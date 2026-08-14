import { Bar } from "react-chartjs-2";
import Box from "@mui/material/Box";
import { useTheme, useMediaQuery } from "@mui/material";
import { currencyFormatter } from "@/constants";
import { legendTheme, tooltipTheme, verticalGradient, hexToRgba } from "./chartUtils";

const BarChart = ({ labels, datasets }) => {
  const { palette, typography, breakpoints } = useTheme();
  const matches = useMediaQuery(breakpoints.down("md"));

  // Every dataset keeps whatever the caller passed (label, data, color, radius...);
  // we only add sensible defaults and turn the flat color into a top-to-bottom gradient.
  const styledDatasets = (datasets ?? []).map((ds) => {
    const baseColor = typeof ds.backgroundColor === "string" ? ds.backgroundColor : palette.primary.main;
    return {
      borderRadius: 6,
      borderSkipped: false,
      maxBarThickness: 22,
      hoverBackgroundColor: hexToRgba(baseColor, 1),
      ...ds,
      backgroundColor: (context) => {
        const { chart } = context;
        const { ctx, chartArea } = chart;
        if (!chartArea) return hexToRgba(baseColor, 0.85);
        return verticalGradient(ctx, chartArea, baseColor, [0.95, 0.55]);
      },
    };
  });

  return (
    <Box sx={{ minWidth: 200, height: 400 }}>
      <Bar
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
            // The old on-bar labels got unreadable with 4 datasets x 12 months —
            // the tooltip now carries that same info on hover instead.
            datalabels: { display: false },
          },
        }}
      />
    </Box>
  );
};

export default BarChart;