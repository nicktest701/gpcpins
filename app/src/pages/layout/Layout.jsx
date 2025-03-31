import Footer from "./Footer";
import Header from "./Header";
import Main from "./Main";
// import BottomNav from './BottomNav';
// import VoucherPaymentDetails from "../../components/modals/VoucherPaymentDetails";
import TicketPaymentDetails from "../../components/modals/TicketPaymentDetails";
import { IconButton,  } from "@mui/material";
import { ArrowUpwardSharp } from "@mui/icons-material";
import BottomNav from "./BottomNav";

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
      <Header />
      
      <Main />
      <Footer />

      <BottomNav />

      {/* <VoucherPaymentDetails /> */}
      <TicketPaymentDetails />
      <IconButton onClick={handleScrollToTop} className="scroll-to-top-button">
        <ArrowUpwardSharp />
      </IconButton>
    </>
  );
}

export default Layout;
