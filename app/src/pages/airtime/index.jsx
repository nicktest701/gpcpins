import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Box, Typography } from "@mui/material";
import { IMAGES } from "../../constants";
import AirtimePaymentDetails from "../../components/modals/AirtimePaymentDetails";
import ServiceNotAvaialble from "../ServiceNotAvaialble";
import { getModuleStatus } from "../../api/categoryAPI";
import { useQuery } from "@tanstack/react-query";

<Helmet>
  <title>Airtime & Data Bundle</title>
  <meta
    name="description"
    content="Explore our wide range of airtime and bundle for various products and services. Get great discounts and deals on our airtime and bundle offerings."
  />
  <link rel="canonical" href="https://gpcpins.com/airtime" />
</Helmet>;
function Airtime() {
  const moduleStatus = useQuery({
    queryKey: ["module-status", "airtime"],
    queryFn: () => getModuleStatus("a"),
    initialData: { message: "", active: true },
  });
 

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          background: `linear-gradient(to top right,rgba(0,0,0,0.8),rgba(0,0,0,0.7)),url(${IMAGES.bgImage1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingX: { xs: 5, md: 2 },
          paddingY: 4,
          height: "35svh",
        }}
      >
        <Typography variant="h2" className="hero-title" paragraph>
          Airtime & Data Bundle
        </Typography>
        <Typography textAlign="center">
          Instant Mobile Airtime and Data Refills for Every Network!
        </Typography>
      </Box>
      <Outlet />

      <AirtimePaymentDetails />
      <ServiceNotAvaialble
        open={moduleStatus.data && Boolean(moduleStatus.data?.active) === false}
        message={moduleStatus.data?.message}
      />
    </>
  );
}

export default Airtime;
