import { Helmet } from "react-helmet-async";
import Service from "./Service";
import HomeSwiper from "./HomeSwiper";
import Organization from "./Organization";
import Contact from "./Contact";
import Trip from "./Trip";
import About from "./About";
import Community from "./Community";
import AnimatedWrapper from "../../components/animations/AnimatedWrapper";
import RetrieveVoucher from "../evoucher/RetrieveVoucher";
import QRCode from "./QRCode";

function Home() {
  return (
    <>
      <Helmet>
        <title>
          Gab Powerful Consult | Buy Vouchers, Tickets, and Prepaid Units
        </title>
        <meta
          name="description"
          content="Buy WAEC  and School Placement Checkers with ease and just a single click."
        />
      </Helmet>
      <div className="dashboard">
        <HomeSwiper />
        <About />
        <Service />
        {/* <WebHosting /> */}
        <Trip />
        <Organization />
        <QRCode/>
        <Contact />

        <Community />
        <AnimatedWrapper>
          <RetrieveVoucher general={true}/>
        </AnimatedWrapper>
      </div>
    </>
  );
}

export default Home;
