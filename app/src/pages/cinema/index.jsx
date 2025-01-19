import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

function Cinema() {
  return (
    <>
      <Helmet>
        <title>Cinema & Event Tickets | Gab Powerful Consult</title>
        <meta
          name='description'
          content='Enjoy the latest movies,music shows,awards,etc with our tickets.'
        />
            <link
          rel='canonical'
          href='https://gpcpins.com/evoucher/cinema-ticket'
        />
      </Helmet>
      <Outlet />
    </>
  );
}

export default Cinema;
