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
      <Container
        maxWidth="lg"
        sx={{
          p: 1,
          minHeight: "90svh",
        }}
      >
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
}

export default Main;
