import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IMAGES } from "../../constants";
import ServiceNotAvaialble from "../ServiceNotAvaialble";
import { getModuleStatus } from "../../api/categoryAPI";
import { useQuery } from "@tanstack/react-query";
import PageHero from "../../components/custom/PageHero";

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
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <PageHero
        title="Airtime & Data Bundle"
        subtitle="  Instant Mobile Airtime and Data Refills for Every Network!"
        bgImage={IMAGES.bgImage1}
      />

      <Outlet />

      <ServiceNotAvaialble
        open={moduleStatus.data && Boolean(moduleStatus.data?.active) === false}
        message={moduleStatus.data?.message}
      />
    </>
  );
}

export default Airtime;
