import { Container, Tab } from "@mui/material";
import { TabPanel, TabList, TabContext } from "@mui/lab";
import { BarChart } from "@mui/icons-material";
import { useState } from "react";
import Transactions from "./Transactions";
import Report from "./Report";
import Airtime from "./Airtime";
import CustomTitle from "../../../components/custom/CustomTitle";

function Summary() {
  const [tab, setTab] = useState("1");
  return (
    <Container maxWidth="lg">
      <CustomTitle
        title="Summary"
        subtitle="View history and data about daily transactions."
        icon={<BarChart sx={{ width: 50, height: 50 }} color="primary" />}
      />
      <TabContext value={tab}>
        <TabList
          onChange={(e, value) => setTab(value)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          sx={{ width: { xs: 300, sm: "100%" } }}
        >
          <Tab label="Airtime & Data Transfers" value="1" />
          <Tab label="Transactions" value="2" />
          <Tab label="Report" value="3" />
        </TabList>
        <TabPanel value="1" sx={{ px: 0 }}>
          <Airtime />
        </TabPanel>
        <TabPanel value="2" sx={{ px: 0 }}>
          <Transactions />
        </TabPanel>
        <TabPanel value="3" sx={{ px: 0 }}>
          <Report />
        </TabPanel>
      </TabContext>
    </Container>
  );
}

export default Summary;
