import CustomTitle from "../../components/custom/CustomTitle";
import Notifications from "../profile/Notifications";

function Notification() {
  return (
    <>
      <CustomTitle
        title="Notifications"
        subtitle="View all your notifications and stay informed about your account activities."
      />

      <Notifications />
    </>
  );
}

export default Notification;
