import { useEffect } from "react";
import {
  Tab,
  Typography,
  Avatar,
  Box,
  Divider,
  Container,
  Stack,
  Link,
} from "@mui/material";

import { TabContext, TabList, TabPanel } from "@mui/lab";
import Single from "./Single";
import { IMAGES } from "../../constants";
import Bulk from "./Bulk";
import { useSearchParams } from "react-router-dom";
import Distributor from "./Distributor";

function AirtimeHome() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("link") === null || !searchParams.get("link")) {
      setSearchParams((params) => {
        params.set(
          "link",
          "6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
        );
        return params;
      });
    }
  }, [searchParams, setSearchParams]);

  const handleNavigateToTab = (value) => {
    setSearchParams((params) => {
      params.set("link", value);
      return params;
    });
  };

  const styles = (value) => {
    return {
      cursor: "pointer",
      color: searchParams?.get("link") === value ? "primary" : "black",
      textDecoration:
        searchParams?.get("link") === value ? "underline" : "none",
      fontWeight: searchParams?.get("link") === value ? "bold" : "normal",
      fontSize: 16,
    };
  };

  return (
    <Container sx={{ width: "100%", py: 2 }}>
      <TabContext
        value={
          searchParams?.get("link") ||
          "6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
        }
      >
        <Stack direction="row" py={2} columnGap={4} rowGap={1} flexWrap="wrap">
          <Link
            onClick={() =>
              handleNavigateToTab(
                "6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
              )
            }
            sx={styles(
              "6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
            )}
          >
            &#8226; Airtime & Data Bundle
          </Link>
          <Divider orientation="vertical" flexItem />
          <Link
            onClick={() =>
              handleNavigateToTab(
                "c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a"
              )
            }
            sx={styles(
              "c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a"
            )}
          >
            &#8226; Bulk Airtime & EVD
          </Link>
          <Divider orientation="vertical" flexItem />
          <Link
            onClick={() =>
              handleNavigateToTab(
                "f5bff298105152dee535d42d497eb8de640200781077c66846b77f000fccdc19"
              )
            }
            sx={styles(
              "f5bff298105152dee535d42d497eb8de640200781077c66846b77f000fccdc19"
            )}
          >
            &#8226; Freelance Agent / Distributor
          </Link>
        </Stack>
        {/* <TabList
          centered
          onChange={(e, value) => {
            setSearchParams((params) => {
              params.set("link", value);

              return params;
            });
          }}
          // sx={{ minWidth: { xs: 300, sm: "100%" }, px: 0 }}
        >
            <Tab
              value="6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
              label="Airtime & Data Bundle "
              // sx={{ fontSize: 12 }}
            />
            <Tab
              value="c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a"
              label="Bulk Airtime & EVD"
              // sx={{ fontSize: 12 }}
            />
            <Tab
              value="f5bff298105152dee535d42d497eb8de640200781077c66846b77f000fccdc19"
              label="Agent / Distributor"
              // sx={{ fontSize: 12 }}
            />
        
        </TabList> */}
        <Box sx={{ py: 4 }}>
          <Typography variant="h3">
            {searchParams.get("link") ===
            "6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
              ? "Airtime  & Data Top-Up Hub"
              : searchParams.get("link") ===
                "c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a"
              ? "Bulk Airtime & EVD Top-Up Hub"
              : "Join Our Network of Freelance Airtime Agents Today!"}
          </Typography>
          {[
            "6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5",
            "c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a",
          ].includes(searchParams.get("link")) ? (
            <ul style={{ paddingInline: "16px", paddingBottom: "16px" }}>
              <li> Stay Connected Anytime</li>
              <li>
                Anywhere with Seamless Mobile Recharges at Your Fingertips
              </li>
            </ul>
          ) : (
            <Box>
              <Typography color="primary" variant="h4">
                Empower Yourself with a Lucrative Opportunity
              </Typography>
              <Typography
                variant="body1"
                className="content-text"
                sx={{
                  "&::first-letter": {
                    fontSize: "2rem",
                  },
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
                  {" "}
                  Take the first step towards financial independence by filling
                  out the <b>form</b> below and embark on a rewarding journey
                  with us.
                </li>
              </ul>
            </Box>
          )}

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
              style={{
                objectFit: "contain",
                width: 60,
                height: 40,
              }}
            />
            <Avatar
              variant="square"
              src={IMAGES.vodafone}
              style={{
                objectFit: "contain",
                width: 60,
                height: 40,
              }}
            />
            <Avatar
              variant="square"
              src={IMAGES.airtel}
              style={{
                objectFit: "contain",
                width: 60,
                height: 40,
              }}
            />
          </Box>
          <Divider />
        </Box>
        <TabPanel
          value="6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
          sx={{ px: 0 }}
        >
          <Single />
        </TabPanel>
        <TabPanel
          value="c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a"
          sx={{ px: 0 }}
        >
          <Bulk />
        </TabPanel>
        <TabPanel
          value="f5bff298105152dee535d42d497eb8de640200781077c66846b77f000fccdc19"
          sx={{ px: 0 }}
        >
          <Distributor />
        </TabPanel>
      </TabContext>
    </Container>
  );
}

export default AirtimeHome;
