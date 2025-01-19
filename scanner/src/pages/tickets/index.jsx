import { Outlet } from "react-router-dom";
import { Container } from "@mui/material";

function Tickets() {
  return (
    <Container>
      <Outlet />
    </Container>
  );
}

export default Tickets;
