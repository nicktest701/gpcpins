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
  Skeleton,
} from "@mui/material";
import { ArrowBack, WalletOutlined } from "@mui/icons-material";
import { TabContext, TabPanel, TabList } from "@mui/lab";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { CircleRounded } from "@mui/icons-material";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomTitle from "../../components/custom/CustomTitle";
import { getInitials } from "../../config/validation";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import UserWallet from "./UserWallet";
import UserSettings from "./UserSettings";
import UserProfile from "./UserProfile";
import { enableOrDisableAccount, getUser } from "../../api/userAPI";
import EditUser from "./EditUser";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import UserPhoto from "./UserPhoto";
import { currencyFormatter } from "../../constants";
import ChangePin from "./ChangePin";
import { AuthContext } from "../../context/providers/AuthProvider";
import UserTransaction from "./UserTransaction";

function UserDetails() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("1");

  const { id } = useParams();
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    enabled: !!id,
    initialData: queryClient
      .getQueryData(["users"])
      ?.find((user) => user?._id === id),
  });

  const { mutateAsync: toggleEmployeeAccountMutateAsync } = useMutation({
    mutationFn: enableOrDisableAccount,
  });

  function handleToggleUserAccount() {
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
              queryClient.invalidateQueries(["users"]);
              queryClient.invalidateQueries(["user", id]);
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
      params.set("view_pin", "true");
      return params;
    });
  };

  return (
    <Container>
      <Link to="/users">
        <IconButton sx={{ my: 4 }}>
          <ArrowBack />
        </IconButton>
      </Link>
      {isLoading ? (
        <Skeleton width="100%" height={400} />
      ) : (
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
            <UserPhoto
              profile={data?.profile}
              email={`${data?.firstname ?? ""} ${data?.lastname ?? ""}`}
            />
            <div style={{ flex: 1 }}>
              <CustomTitle
                title={`${data?.firstname ?? ""} ${data?.lastname ?? ""}`}
                subtitle="Manage your users information"
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
                    {getInitials(`${data?.firstname} ${data?.lastname}`)}
                  </Avatar>
                }
              />
            </div>
            {user?.permissions?.includes("Edit users") && (
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

          {user?.permissions?.includes("Edit users") && (
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
              onClick={handleToggleUserAccount}
            >
              {data?.active ? "Active" : "Disabled"}
            </Button>
          )}
        </Container>
      )}

      <TabContext value={tab}>
        <TabList
          onChange={(e, value) => setTab(value)}
          // sx={{ bgcolor: "secondary.main" }}
        >
          <Tab label="Profile" value="1" />
          <Tab label="Wallet" value="2" />
          <Tab label="Transaction" value="3" />
          {user?.permissions?.includes("Delete users") && (
            <Tab label="Settings" value="4" />
          )}
        </TabList>

        {isLoading ? (
          <Skeleton width="100%" height={400} />
        ) : (
          <>
            <TabPanel value="1" sx={{ px: 0 }}>
              <AnimatedContainer>
                <UserProfile values={data} />
              </AnimatedContainer>
            </TabPanel>

            <TabPanel value="2" sx={{ px: 0 }}>
              <AnimatedContainer>
                <UserWallet />
              </AnimatedContainer>
            </TabPanel>
            <TabPanel value="3" sx={{ px: 0 }}>
              <AnimatedContainer>
                <UserTransaction />
              </AnimatedContainer>
            </TabPanel>
            <TabPanel value="4" sx={{ px: 0 }}>
              <AnimatedContainer>
                <UserSettings />
              </AnimatedContainer>
            </TabPanel>
          </>
        )}
      </TabContext>
      <EditUser />
      <ChangePin />
    </Container>
  );
}

export default UserDetails;
