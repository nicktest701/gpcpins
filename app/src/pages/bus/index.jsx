import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

function Bus() {
  return (
    <>
      <Helmet>
        <title>Bus Tickets | Gab Powerful Consult</title>
        <meta
          name='description'
          content='Buy your bus tickets and embark on a comfortable and a convenient journey.'
        />
            <link
          rel='canonical'
          href='https://gpcpins.com/evoucher/bus-ticket'
        />
      </Helmet>
      <Outlet />
    </>
  );
}

export default Bus;
