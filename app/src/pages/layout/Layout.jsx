import Footer from "./Footer";
import Header from "./Header";
import Main from "./Main";
import TicketPaymentDetails from "../../components/modals/TicketPaymentDetails";
import { Box, IconButton } from "@mui/material";
import { ArrowUpwardSharp } from "@mui/icons-material";
import BottomNav from "./BottomNav";
import ComplaintModal from "../../components/modals/ComplaintModal";

function Layout() {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Optional: animated scroll
    });
  };

  // const handleMinimize = () => {
  //   tawkMessengerRef.current.minimize();
  // };
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100svh",
        }}
      >
        <Header />

        <Main />
        <Footer />
      </Box>

      <BottomNav />

      {/* <TicketPaymentDetails /> */}
      <IconButton onClick={handleScrollToTop} className="scroll-to-top-button">
        <ArrowUpwardSharp />
      </IconButton>
          <ComplaintModal
              buttonVariant="fab"
              buttonText="Complaint form"
            />
    </>
  );
}

export default Layout;
