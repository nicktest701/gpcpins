
import { Container, } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CustomTitle from "../../components/custom/CustomTitle";
import Password from "../profile/Password";

function Settings() {


  return (
    <Container>
      <CustomTitle
        title="Settings"
        subtitle="Keep track of changes made to the system at everytime!"
        icon={<AccessTimeIcon sx={{ width: 50, height: 50 }} color="primary" />}
     
     />
           <Password />
    </Container>
  );
}

export default Settings;
