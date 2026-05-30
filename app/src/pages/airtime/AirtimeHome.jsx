import { useEffect, useMemo } from "react";
import {
  Typography,
  Avatar,
  Box,
  Divider,
  Container,
  Stack,
  Link,
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import { useSearchParams } from "react-router-dom";
import Single from "./Single";
import Bulk from "./Bulk";
import Distributor from "./Distributor";
import { IMAGES } from "../../constants";

// Tab definitions
const TABS = [
  {
    id: "6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5",
    label: "Airtime & Data Bundle",
    component: Single,
    header: "Airtime & Data Top-Up Hub",
    description: "Stay Connected Anytime, Anywhere with Seamless Mobile Recharges at Your Fingertips",
    showBullets: true,
  },
  {
    id: "c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a",
    label: "Bulk Airtime & EVD",
    component: Bulk,
    header: "Bulk Airtime & EVD Top-Up Hub",
    description: "Stay Connected Anytime, Anywhere with Seamless Mobile Recharges at Your Fingertips",
    showBullets: true,
  },
  {
    id: "f5bff298105152dee535d42d497eb8de640200781077c66846b77f000fccdc19",
    label: "Freelance Agent / Distributor",
    component: Distributor,
    header: "Join Our Network of Freelance Airtime Agents Today!",
    description: (
      <>
        <Typography color="primary" variant="h4">
          Empower Yourself with a Lucrative Opportunity
        </Typography>
        <Typography
          variant="body1"
          sx={{
            "&::first-letter": { fontSize: "2rem" },
            mt: 1,
          }}
        >
          Welcome to our registration portal for aspiring airtime agents!
          Joining our network offers you the chance to tap into a thriving
          market and create your own stream of income. By becoming an
          agent, you&apos;ll gain access to <b>exclusive benefits</b>,
          <b>competitive commissions</b>, and a{" "}
          <b>user-friendly platform</b> to manage your sales efficiently.
        </Typography>
        <ul style={{ paddingInline: "16px", paddingBlock: "16px" }}>
          <li>
            Take the first step towards financial independence by filling
            out the <b>form</b> below and embark on a rewarding journey
            with us.
          </li>
        </ul>
      </>
    ),
    showBullets: false,
  },
];

// Default tab ID (first tab)
const DEFAULT_TAB = TABS[0].id;

const AirtimeHome = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("link") || DEFAULT_TAB;

  // Ensure a valid tab is selected (fallback to default if not found)
  const isValidTab = useMemo(
    () => TABS.some((tab) => tab.id === activeTab),
    [activeTab]
  );
  const currentTab = isValidTab ? activeTab : DEFAULT_TAB;

  // Set default tab on initial load or when invalid
  useEffect(() => {
    if (!isValidTab || !searchParams.get("link")) {
      setSearchParams((params) => {
        params.set("link", DEFAULT_TAB);
        return params;
      });
    }
  }, [isValidTab, searchParams, setSearchParams]);

  const handleTabChange = (tabId) => {
    setSearchParams((params) => {
      params.set("link", tabId);
      return params;
    });
  };

  // Get current tab data
  const currentTabData = TABS.find((tab) => tab.id === currentTab);

  // Helper to render header content
  const renderHeaderContent = () => {
    const data = currentTabData;
    if (!data) return null;

    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h3">{data.header}</Typography>
        {data.showBullets ? (
          <ul style={{ paddingInline: "16px", paddingBottom: "16px" }}>
            <li>{data.description}</li>
          </ul>
        ) : (
          data.description
        )}

        {/* Network operator logos - visible on md and up */}
        <Box
          display={{ xs: "none", md: "flex" }}
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
          py={4}
        >
          <Avatar
            variant="square"
            src={IMAGES.mtn}
            sx={{ objectFit: "contain", width: 60, height: 40 }}
          />
          <Avatar
            variant="square"
            src={IMAGES.vodafone}
            sx={{ objectFit: "contain", width: 60, height: 40 }}
          />
          <Avatar
            variant="square"
            src={IMAGES.airtel}
            sx={{ objectFit: "contain", width: 60, height: 40 }}
          />
        </Box>
        <Divider />
      </Box>
    );
  };

  return (
    <Container sx={{ width: "100%", py: 2 }}>
      <TabContext value={currentTab}>
        {/* Tab navigation */}
        <Stack
          direction="row"
          py={2}
          columnGap={4}
          rowGap={1}
          flexWrap="wrap"
          divider={<Divider orientation="vertical" flexItem />}
        >
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              sx={{
                cursor: "pointer",
                color: currentTab === tab.id ? "primary.main" : "text.primary",
                textDecoration: currentTab === tab.id ? "underline" : "none",
                fontWeight: currentTab === tab.id ? "bold" : "normal",
                fontSize: 16,
              }}
            >
              {tab.label}
            </Link>
          ))}
        </Stack>

        {/* Header section */}
        {renderHeaderContent()}

        {/* Tab panels - each renders its component */}
        {TABS.map((tab) => (
          <TabPanel key={tab.id} value={tab.id} sx={{ px: 0 }}>
            <tab.component />
          </TabPanel>
        ))}
      </TabContext>
    </Container>
  );
};

export default AirtimeHome;