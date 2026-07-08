import React from 'react';
import { Backdrop, Box } from '@mui/material';

function GlobalSpinner() {
  return (
    <Backdrop
      open={true}
      sx={{
        zIndex: 99999999,
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        color: '#1b7437', // Sets default text color for nested components
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={200} height={200}>
          <text
            x={10}
            y={50}
            fill="none"
            stroke='var(--primary)'
            fontFamily="Inter, sans-serif"
            fontSize={65}
          >
            {"\r\n    GPC\r\n    "}
            <animate
              attributeName="stroke-dasharray"
              dur="2s"
              from="0, 100"
              repeatCount="indefinite"
              to="100, 0"
            />
          </text>
        </svg>
      </Box>
    </Backdrop>
  );
}

export default GlobalSpinner;
