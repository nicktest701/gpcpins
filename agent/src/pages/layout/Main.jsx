import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import HideSidebar from "./HideSidebar";
import Header from "./Header";
import Footer from "./Footer";

function Main() {
  // const isFetching = useIsFetching();
  return (
    <Box sx={{ flex: 1 }}>
      <HideSidebar />

      <Header />
      <Box
      // maxWidth='md'
        sx={{
          maxWidth: "1000px",
          marginInline: "auto",
          paddingInline: "16px",
          minHeight: "90svh",
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}

export default Main;
