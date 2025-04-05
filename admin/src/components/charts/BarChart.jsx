import { Bar } from "react-chartjs-2";
import Box from "@mui/material/Box";
import { useTheme, useMediaQuery } from "@mui/material";
import { currencyFormatter } from "@/constants";
const BarChart = ({ labels, datasets }) => {
  const { breakpoints } = useTheme();
  const matches = useMediaQuery(breakpoints.down("md"));
  return (
    <Box
      sx={{
        minWidth: 200,
        height: 400,
      }}
    >
      <Bar
        data={{
          labels,
          datasets: datasets ?? [],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,

          layout: {
            padding: 2,
            autoPadding: true,
          },
          scales: {
            x: {
              ticks: {
                // display: false,
              },
              grid: {
                // display: false,
              },
            },
            y: {
              ticks: {
                // display: false,
              },
              grid: {
                // display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: true,
            },
            datalabels: {
              display: true,
              color: "#333",
              anchor: "end",
              align: "end",
              font: {
                size: matches ? "12px" : "14px",
              },
              // backgroundColor: "#333",
              // borderRadius:'40px',
              formatter: (value) =>
                Number(value) === 0 ? "" : currencyFormatter(value || 0), // Display the data value directly
            },
          },
        }}
      />
    </Box>
  );
};

export default BarChart;
