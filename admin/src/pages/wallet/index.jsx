import { Outlet } from "react-router-dom";
import TopUpWallet from "./TopUpWallet";
function Wallet() {
  return (
    <>
      <Outlet />
      <TopUpWallet />
    </>
  );
}

export default Wallet;
