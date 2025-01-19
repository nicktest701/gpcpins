import { Box } from '@mui/material';
import CustomBreadCrumb from './CustomBreadCrumb';
import React from 'react';

function CustomWrapper({ children, title, item, img }) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        // backgroundColor: '#fff',
      }}
    >
      <CustomBreadCrumb title={title} item={item} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(to top right,rgba(0,0,0,0.3),rgba(0,0,0,0.3)),url(${img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingX: { xs: 5, md: 2 },
          paddingY: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default React.memo(CustomWrapper);
