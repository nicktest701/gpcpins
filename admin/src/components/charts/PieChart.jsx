import Box from "@mui/material/Box";
import { useTheme } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { legendTheme, tooltipTheme } from "./chartUtils";

// Draws the running total in the empty center of the donut — turns dead
// space into the single most useful number on the chart.
const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart) {
    const { ctx, chartArea, options } = chart;
    if (!chartArea) return;
    const opts = options.plugins?.centerText || {};
    const total = (chart.data.datasets?.[0]?.data || []).reduce(
      (sum, v) => sum + (Number(v) || 0),
      0
    );
    const x = (chartArea.left + chartArea.right) / 2;
    const y = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = opts.color || "#0f172a";
    ctx.font = `700 24px ${opts.fontFamily || "sans-serif"}`;
    ctx.fillText(total.toLocaleString(), x, y - 8);
    ctx.fillStyle = opts.subColor || "#94a3b8";
    ctx.font = `600 11px ${opts.fontFamily || "sans-serif"}`;
    ctx.fillText((opts.label || "Total").toUpperCase(), x, y + 12);
    ctx.restore();
  },
};

const PieChart = ({ labels, data, colors }) => {
  const { palette, typography } = useTheme();

  const segmentColors = colors ?? [
    palette.warning.main,
    palette.info.main,
    palette.success.main,
    palette.error.main,
  ];

  return (
    <Box sx={{ minWidth: 200, minHeight: 300, position: "relative" }}>
      <Doughnut
        datasetIdKey="pie"
        data={{
          labels: labels ?? [],
          datasets: [
            {
              data: data ?? [],
              backgroundColor: segmentColors,
              hoverBackgroundColor: segmentColors,
              borderColor: palette.background.paper,
              borderWidth: 3,
              borderRadius: 6,
              spacing: 3,
              hoverOffset: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          layout: { padding: 8 },
          plugins: {
            legend: legendTheme(palette, typography.fontFamily),
            tooltip: tooltipTheme(),
            centerText: {
              color: palette.text.primary,
              subColor: palette.text.secondary,
              fontFamily: typography.fontFamily,
              label: "Total",
            },
          },
        }}
        plugins={[centerTextPlugin]}
      />
    </Box>
  );
};

export default PieChart;