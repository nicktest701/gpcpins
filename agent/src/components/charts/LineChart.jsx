import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import { useTheme, useMediaQuery } from "@mui/material";
import { currencyFormatter } from "@/constants";

const LineChart = ({ height, labels, datasets }) => {
  const { breakpoints } = useTheme();
  const matches = useMediaQuery(breakpoints.down("md"));

  return (
    <Box
      sx={{
        minWidth: 200,
        height: height || 400,
      }}
    >
      <Line
        // datasetIdKey='1'
        data={{
          labels,

          datasets: datasets ?? [],
          // datasets:[{

          // }]
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
              // display: false,
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

export default LineChart;
