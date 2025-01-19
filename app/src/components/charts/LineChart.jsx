import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';

const LineChart = ({ labels, datasets }) => {

  return (
    <Box
      sx={{
        minWidth: 200,
        height: 200,
      }}
    >
      <Line
        // datasetIdKey='1'
        data={{
          labels,

          datasets: datasets ?? [],
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
                display: false,
              },
            },
            y: {
              ticks: {
                // display: false,
              },
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              // display: false,
            },
          },
        }}
      />
    </Box>
  );
};

export default LineChart;
