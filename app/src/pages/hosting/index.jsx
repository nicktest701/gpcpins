import HostingLandpage from "./HostingLandpage";
import HostingFeatures from "./HostingFeatures";
import HostingForm from "./HostingForm";

import { Helmet } from "react-helmet-async";
import { Box } from "@mui/material";

function Hosting() {
  return (
    <>
      <Helmet>
        <title>Hosting | Gab Powerful Consult</title>
        <meta
          name="description"
          content="We provide you with the best hosting solution"
        />
        <link rel="canonical" href="https://www.gpcpins.com/hosting" />
      </Helmet>

      <div style={{ position: "relative" }}>
        <div
          className="zigzag"
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderStyle: " solid",
            borderWidth: " 20px 20px 0 0",
            borderColor:
              " var(--secondary) transparent transparent transparent",
            zIndex: "-1",
          }}
        ></div>
        <HostingLandpage />
        {/* <HostingBanner /> */}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "between",
            py: 10,
          }}
        >
          <HostingFeatures />
          <HostingForm />
        </Box>
      </div>
    </>
  );
}

export default Hosting;
