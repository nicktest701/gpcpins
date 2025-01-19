import { MoreHorizRounded } from '@mui/icons-material';
import { Card, IconButton, Stack, Typography } from '@mui/material';

function CustomCard({ title, children, width }) {
  return (
    <Card
      sx={{
        p: 2,
        width: '100%',
        border: '1px solid whitesmoke',
      }}
    >
      {/* <CardHeader
        avatar={<BarChartRounded />}
        subheader={<Typography color='primary'>No. of Students</Typography>}
        color='primary'
      /> */}
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='subtitle2' color='primary.main'>
          {title}
        </Typography>
        <IconButton color='secondary'>
          <MoreHorizRounded />
        </IconButton>
      </Stack>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat( auto-fit, minmax(${
            width || '200px'
          }, 1fr))`,
          gap: '16px',
        }}
      >
        {children}
      </div>
    </Card>
  );
}

export default CustomCard;
