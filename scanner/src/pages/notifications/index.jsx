import { Container } from "@mui/material";
import CustomTitle from "../../components/custom/CustomTitle";
import Notifications from "../profile/Notifications";

function Notification() {
  return (
    <Container>
      <CustomTitle
        title="Notifications"
        subtitle="View and manage all your pending and past notifications"
      />

      <Notifications />
    </Container>
  );
}

export default Notification;
