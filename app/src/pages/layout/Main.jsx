import { Outlet } from "react-router-dom";
import HomeSpeedDial from "../HomeSpeedDial";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import Sidebar from "../layout/Sidebar";
import { Box } from "@mui/material";
import RetrieveVoucherSmall from "../evoucher/RetrieveVoucherSmall";

function Main() {
  return (
    <>
      <TawkMessengerReact
        propertyId={import.meta.env.VITE_TAWK_PROPERTY_ID}
        widgetId={import.meta.env.VITE_TAWK_WIDGET_ID}
      />
      <Box sx={{ position: "relative" }}>
       
        <HomeSpeedDial />
        <Sidebar />
        <Outlet />
        <RetrieveVoucherSmall general={true} />
      </Box>
    </>
  );
}

export default Main;
