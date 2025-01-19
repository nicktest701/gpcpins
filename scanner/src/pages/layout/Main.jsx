import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import HideSidebar from "./HideSidebar";
import Header from "./Header";
import Footer from "./Footer";
import AnimatedContainer from "../../components/animations/AnimatedContainer";

function Main() {
  // const isFetching = useIsFetching();
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      <HideSidebar />
      <Header />

      <Box
        sx={{
          px: { xs: 2, mb: 4, lg: 5 },

          overflowX: "hidden",
        }}
      >
        <AnimatedContainer>
          <Outlet />
        </AnimatedContainer>
      </Box>
      <Footer />
    </Box>
  );
}

export default Main;
