import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import HideSidebar from "./HideSidebar";
import Header from "./Header";
import Footer from "./Footer";

function Main() {
  // const isFetching = useIsFetching();
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        bgcolor: "whitesmoke",
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
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
// style={{ marginInline: 'auto', paddingBlock: '16px',minHeight:'100svh' }}
export default Main;
