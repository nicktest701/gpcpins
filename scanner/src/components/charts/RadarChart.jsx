import Box from "@mui/material/Box";
import { useTheme } from "@mui/material";
import { PolarArea, Radar } from "react-chartjs-2";

const RadarChart = ({ values, labels }) => {
  const { palette } = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "800px",
        height: "auto",
      }}
    >
      <PolarArea
        datasetIdKey="id"
        data={{
          labels: labels ?? [],
          // datasets: [
          //   {
          //     data: values ?? [],
          //     borderColor: palette.primary.main,
          //     backgroundColor: [palette.primary.main, palette.secondary.main],
          //     fill: "-2",
          //   },
          // ],
          datasets: values,
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,

          layout: {},
          elements: {
            line: {
              borderWidth: 3,
            },
          },
          scales: {
            r: {
              angleLines: {
                display: false,
              },
              // suggestedMin: 50,
              // suggestedMax: 100,
            },
          },
          plugins: {
            legend: {
              display: false,
              position: "bottom",
            },
          },
          title: {
            display: true,
            text: "Chart.js Polar Area Chart",
          },
        }}
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "auto",
        }}
      />
    </Box>
  );
};

export default RadarChart;
