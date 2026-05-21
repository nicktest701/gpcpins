import { AssessmentRounded } from "@mui/icons-material";
import CustomTitle from "../../components/custom/CustomTitle";
import { Stack, Box, Typography, Divider } from "@mui/material";
import TicketAssignmentPage from "./TicketAssignmentPage";
import AllTickets from "./AllTickets";
import { useSearchParams } from "react-router-dom";

function ManageTickets() {
  const [searchParams] = useSearchParams();

  const activeTab = searchParams.get("t") || "all-assigned-tickets";

  return (
    <>
      <CustomTitle
        title="Assign and Manage Tickets"
        subtitle="Assign tickets to users and manage ticket distribution efficiently."
        icon={
          <AssessmentRounded sx={{ width: 80, height: 80 }} color="primary" />
        }
      />
      <Stack my={2} direction="row" gap={4} borderBottom="1px solid lightgray">
        <Tab label="All Tickets" isActive={activeTab === "all-assigned-tickets"} tab="all-assigned-tickets" />
        <Tab
          label="Assigned New"
          isActive={activeTab === "new-ticket"}
          tab="new-ticket"
        />
      </Stack>
      <Box minHeight="50svh" pt={2}>
        <Box bgcolor="whitesmoke" p={1} mb={2}>
          <Typography variant="h4">
            {activeTab === "all-assigned-tickets"
              ? "All Tickets"
              : activeTab === "new-ticket"
              ? "Assign New"
              : ""}
          </Typography>
          <Typography variant="body2">
            {activeTab === "all-assigned-tickets"
              ? "View all tickets assigned to verifiers."
              : activeTab === "new-ticket"
              ? "Assign new tickets to verifiers by completing the form below."
              : ""}
          </Typography>
        </Box>

        {/* all tickets  */}
        {activeTab === "all-assigned-tickets" && <AllTickets />}

        {/* Tickets  */}
        {activeTab === "new-ticket" && <TicketAssignmentPage />}
      </Box>
      <Divider />
      {/* <Outlet /> */}
    </>
  );
}

const Tab = ({ label, isActive, tab }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const toggleTab = () => {
    setSearchParams((params) => {
      params.set("t", tab);
      return params;
    });
  };

  return (
    <Typography
      variant="body2"
      className={`tab ${isActive ? "active" : ""}`}
      onClick={toggleTab}
    >
      {label}
    </Typography>
  );
};

export default ManageTickets;
