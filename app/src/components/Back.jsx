import { ArrowBackRounded } from '@mui/icons-material';
import { Container, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
function Back({ to, bg, color }) {
  const navigate = useNavigate();
  return (
    <Container
      maxWidth='md'
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginX: 'auto',
        zIndex: 100,
        pb:2
      }}
    >
      <IconButton
        sx={{ marginRight: 2, bgcolor: bg || 'transparent' }}
        onClick={() =>
          navigate(to || -1, {
            replace: true,
          })
        }
        color={color || 'secondary'}
      >
        <ArrowBackRounded />
      </IconButton>
    </Container>
  );
}

export default Back;
