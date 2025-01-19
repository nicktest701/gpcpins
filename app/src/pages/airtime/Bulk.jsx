import { serviceAvailable } from "../../config/serviceAvailable";
import ServiceNotAvaialble from "../ServiceNotAvaialble";
import AddBulk from "./AddBulk";
import Typography from '@mui/material/Typography'

function Bulk() {
  return (
    <div>
      <Typography variant="h5" color="error" fontStyle="italic">
        Please Note!!!
      </Typography>
      <marquee>
        Bulk Airtime Transfer is available for customers with{" "}
        <b>MTN Transfer SIM,Vodafone Transfer SIM</b> and{" "}
        <b>AirtelTigo Transfer SIM.</b>
      </marquee>
  
      <AddBulk />
      <ServiceNotAvaialble open={serviceAvailable()} />
    </div>
  );
}

export default Bulk;
