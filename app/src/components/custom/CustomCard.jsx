import { MoreHorizRounded } from '@mui/icons-material';
import { Card, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';

function CustomCard({ title, handleAction, children }) {
  return (
    <Card sx={{ p: 2, minWidth: 200, minHeight: 200 }}>
      {/* <CardHeader
        avatar={<BarChartRounded />}
        subheader={<Typography color='primary'>No. of Students</Typography>}
        color='primary'
      /> */}
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='subtitle2' color='info.main'>
          {title}
        </Typography>
        <IconButton color='secondary'>
          <MoreHorizRounded />
        </IconButton>
      </Stack>
      {children}
    </Card>
  );
}

export default CustomCard;
