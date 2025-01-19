import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getModuleStatus } from "../../api/categoryAPI";
import { useQuery } from "@tanstack/react-query";
import ServiceNotAvaialble from "../ServiceNotAvaialble";

function EVoucher() {
  const moduleStatus = useQuery({
    queryKey: ["module-status", "voucher"],
    queryFn: () => getModuleStatus("v"),
    initialData: { message: "", active: true },
  });

  return (
    <>
      <Helmet>
        <title>E-Vouchers | Gab Powerful Consult</title>
        <meta
          name="description"
          content="Explore our wide range of vouchers for various products and services. Get great discounts and deals on our voucher offerings."
        />
        <link rel="canonical" href="https://www.gpcpins.com/evoucher" />
      </Helmet>

      <Outlet />

      <ServiceNotAvaialble
        open={Boolean(moduleStatus.data?.active) === false}
        message={moduleStatus.data?.message}
      />
    </>
  );
}

export default EVoucher;
