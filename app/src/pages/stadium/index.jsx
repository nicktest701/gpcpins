import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

function Stadium() {
  return (
    <>
      <Helmet>
        <title>Stadium Tickets | Gab Powerful Consult</title>
        <meta
          name='description'
          content='Elevate  your sporting experiences with our exclusive stadium tickets.'
        />
            <link
          rel='canonical'
          href='https://gpcpins.com/evoucher/stadium-ticket'
        />
      </Helmet>
      <Outlet />
    </>
  );
}

export default Stadium;
