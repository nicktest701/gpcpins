import { Container, Typography } from '@mui/material';

function Footer() {
  return (
    <div className='main-footer' style={{ backgroundColor: 'whitesmoke' }}>
      <Container sx={{ py: 1 }}>
        <Typography variant='body2' textAlign='center' paragraph pt={1}>
          Copyright &copy; {new Date().getFullYear()} | Gab Powerful Consult
        </Typography>
      </Container>
    </div>
  );
}

export default Footer;
