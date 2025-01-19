import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getModuleStatus } from "../../api/categoryAPI";
import ServiceNotAvaialble from "../ServiceNotAvaialble";

function Electricity() {
  const moduleStatus = useQuery({
    queryKey: ["module-status", "prepaid"],
    queryFn: () => getModuleStatus("p"),
    initialData: { message: "", active: true },
  });

  return (
    <>
      <Helmet>
        <title>Prepaid Units | Gab Powerful Consult</title>
        <meta
          name="description"
          content="Purchase prepaid electricity units online. Enjoy convenient and hassle-free top-ups for your electricity needs."
        />
        <link rel="canonical" href="https://gpcpins.com/electricity" />
      </Helmet>

      <Outlet />
      <ServiceNotAvaialble
        open={Boolean(moduleStatus.data?.active) === false}
        message={moduleStatus.data?.message}
      />
    </>
  );
}

export default Electricity;
