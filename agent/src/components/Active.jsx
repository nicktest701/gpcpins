import { CircleRounded } from '@mui/icons-material';
import { Button } from '@mui/material';

function Active({ active, style, handleOnClick }) {
  return (
    <Button
      onClick={handleOnClick}
      startIcon={
        <CircleRounded
          sx={{ color: active ? 'green' : 'red', width: 10, height: 10 }}
        />
      }
      sx={{
        borderRadius: 1,
        backgroundColor: `color-mix(in oklab,${
          active ? 'green' : 'red'
        },white 85%)`,
        color: `color-mix(in oklab,${active ? 'green' : 'red'},black 15%)`,
        ...style,
      }}
    >
      {active ? 'Active' : 'Disabled'}
    </Button>
  );
}

export default Active;
