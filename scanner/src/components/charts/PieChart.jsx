import Box from "@mui/material/Box";
import { Stack, Typography, useTheme } from "@mui/material";
import { Doughnut } from "react-chartjs-2";

const PieChart = ({ height, labels, data }) => {
  const { palette } = useTheme();

  return (
    <Box
      sx={{
        minWidth: 200,
        minHeight: height || 300,
      }}
    >
      <Doughnut
        datasetIdKey="pie"
        data={{
          labels: labels ?? [],

          datasets: [
            {
              data: data ?? [],
              backgroundColor: [
                palette.secondary.main,
                palette.primary.main,
                palette.info.main,
                palette.error.main,
              ],
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: 10,
          },
          scales: {
            x: {
              ticks: {
                display: false,
              },
              grid: {
                display: false,
              },
            },
            y: {
              ticks: {
                display: false,
              },
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              // display: false,
              position: "bottom",
            },
          },
        }}
      />
      {/* <Stack>
        <Typography>Hello</Typography>
        <Typography>Hello</Typography>
      </Stack> */}
    </Box>
  );
};

export default PieChart;
