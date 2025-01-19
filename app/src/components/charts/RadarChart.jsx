import Box from '@mui/material/Box';
import { useTheme } from '@mui/material';
import { PolarArea, Radar } from 'react-chartjs-2';

const RadarChart = ({ values, labels }) => {
  const { palette } = useTheme();

  return (
    <Box
      sx={{
        minWidth: 200,
        height: 200,
      }}
    >
      <Radar
        datasetIdKey='id'
        data={{
          labels,
          datasets: [
            {
              data: values,
              borderColor: palette.primary.main,
              backgroundColor: [palette.primary.main, palette.secondary.main],
              fill: '-2',
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,

          layout: {
            padding: 10,
          },
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
              position: 'bottom',
            },
          },
        }}
      />
    </Box>
  );
};

export default RadarChart;
