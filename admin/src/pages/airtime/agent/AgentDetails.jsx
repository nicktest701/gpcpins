import { useState, useContext } from "react";
import {
  Box,
  Container,
  IconButton,
  Tab,
  Button,
  ListItemText,
  Avatar,
  Divider,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { TabContext, TabPanel, TabList } from "@mui/lab";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { WalletOutlined, CircleRounded } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomTitle from "../../../components/custom/CustomTitle";
import AgentProfile from "./AgentProfile";
import AgentWallet from "./AgentWallet";
import AgentTransaction from "./AgentTransaction";
import { getAgent, toggleAgentAccount } from "../../../api/agentAPI";
import { getInitials } from "../../../config/validation";
import AgentSettings from "./AgentSettings";
import EditAgent from "./EditAgent";
import { globalAlertType } from "../../../components/alert/alertType";
import { CustomContext } from "../../../context/providers/CustomProvider";
import AgentPhoto from "./AgentPhoto";
import { currencyFormatter } from "../../../constants";
import ChangePin from "./ChangePin";
import { AuthContext } from "../../../context/providers/AuthProvider";

function AgentDetails() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("1");
  // const [hidePin, setHidePin] = useState(true);
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const { data } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => getAgent(id),
    enabled: !!id,
    initialData: queryClient
      .getQueryData(["agents"])
      ?.find((agent) => agent?._id === id),
  });

  const { mutateAsync: toggleEmployeeAccountMutateAsync } = useMutation({
    mutationFn: toggleAgentAccount,
  });

  function handleToggleAgentAccount() {
    Swal.fire({
      title: data?.active ? "Disabling Account" : "Enabling account",
      text: data?.active
        ? "Do you want to disable account?"
        : "Do you want to enable account?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        toggleEmployeeAccountMutateAsync(
          { id, active: !data?.active },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["agents"]);
              queryClient.invalidateQueries(["agent", id]);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType("info", data));
            },
            onError: (error) => {
              customDispatch(globalAlertType("error", error));
            },
          }
        );
      }
    });
  }

  const openChangePin = () => {
    setSearchParams((params) => {
      params.set("view_agent_pin", "true");
      return params;
    });
  };

  return (
    <Container>
      <Link to="/airtime/agent">
        <IconButton sx={{ my: 4 }}>
          <ArrowBack />
        </IconButton>
      </Link>
      <Container sx={{ pb: 5, mb: 5, bgcolor: "#fff" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <AgentPhoto profile={data?.profile} email={data?.email} />
          <div style={{ flex: 1 }}>
            <CustomTitle
              title={`${data?.firstname} ${data?.lastname}`}
              subtitle="Manage your agents information"
              icon={
                <Avatar
                  alt="profile_icon"
                  src={data?.profile}
                  sx={{
                    width: { xs: 50, md: 80 },
                    height: { xs: 50, md: 80 },
                    marginInline: "auto",
                    bgcolor: "primary.main",
                    cursor: "pointer",
                  }}
                >
                  {getInitials(data?.email)}
                </Avatar>
              }
            />
          </div>
          {user?.permissions?.includes("Edit agents") && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<WalletOutlined />}
              onClick={openChangePin}
            >
              Change Wallet Pin
            </Button>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "start", md: "center" },
          }}
        >
          <ListItemText
            primary="Business Name"
            secondary={data?.business_name}
            primaryTypographyProps={{
              textTransform: "uppercase",
              fontSize: 12,
            }}
          />
          <ListItemText
            primary="Email Address"
            secondary={data?.email}
            primaryTypographyProps={{
              textTransform: "uppercase",
              fontSize: 12,
            }}
          />
          <ListItemText
            primary="phone number"
            secondary={data?.phonenumber}
            primaryTypographyProps={{
              textTransform: "uppercase",
              fontSize: 12,
            }}
          />

          <ListItemText
            primary="Wallet balance"
            secondary={currencyFormatter(data?.amount)}
            primaryTypographyProps={{
              textTransform: "uppercase",
              fontSize: 12,
            }}
            secondaryTypographyProps={{
              fontWeight: "bold",
              color: "secondary",
            }}
          />
        </Box>
        <Divider />
        <Button
          startIcon={
            <CircleRounded
              sx={{
                color: data?.active ? "green" : "red",
                width: 10,
                height: 10,
              }}
            />
          }
          sx={{
            backgroundColor: `color-mix(in oklab,${
              data?.active ? "green" : "red"
            },white 85%)`,
            color: `color-mix(in oklab,${
              data?.active ? "green" : "red"
            },black 15%)`,
            mt: 2,
          }}
          onClick={handleToggleAgentAccount}
        >
          {data?.active ? "Active" : "Disabled"}
        </Button>
      </Container>
      <TabContext value={tab}>
        <TabList
          onChange={(e, value) => setTab(value)}
          // sx={{ bgcolor: "secondary.main" }}
        >
          <Tab label="Profile" value="1" />
          <Tab label="Wallet" value="2" />
          <Tab label="Transactions" value="3" />
          {user?.permissions?.includes("Edit agents") && (
            <Tab label="Settings" value="4" />
          )}
        </TabList>
        <TabPanel value="1" sx={{ px: 0 }}>
          <AgentProfile values={data} />
        </TabPanel>
        <TabPanel value="2" sx={{ px: 0 }}>
          <AgentWallet />
        </TabPanel>
        <TabPanel value="3" sx={{ px: 0 }}>
          <AgentTransaction />
        </TabPanel>
        <TabPanel value="4" sx={{ px: 0 }}>
          <AgentSettings />
        </TabPanel>
      </TabContext>
      <EditAgent />
      <ChangePin />
    </Container>
  );
}

export default AgentDetails;
