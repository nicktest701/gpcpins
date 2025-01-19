import { Bar } from "react-chartjs-2";
import Box from "@mui/material/Box";
import _ from "lodash";
const HorizontalBarChart = ({ labels, datasets }) => {
  return (
    <Box
      sx={{
        minWidth: 200,
        height: 400,
        flex: 1,
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
          indexAxis: "y",
          

          layout: {
            padding: 2,
            autoPadding: true,
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
                align:'start',
                labelOffset:-18,
                mirror:true
              },
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
          },
          title: {
            display: true,
          },
        }}
      />
    </Box>
  );
};

export default HorizontalBarChart;
