import  { useState } from "react";
import { Tabs, Tab, Box, Typography, Container, Paper } from "@mui/material";
import Postpaid from "./Postpaid"; // Path to your Postpaid component
import Prepaid from "./Prepaid"; // Path to your Prepaid component
import PageHero from "../../components/custom/PageHero";
import { IMAGES } from "../../constants";
import ComplaintModal from "../../components/modals/ComplaintModal";


// Helper component for managing Tab content visibility
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EcgWrapper() {
  // 0 = Postpaid, 1 = Prepaid
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hero Banner */}
      <PageHero
        title="Postpaid & Prepaid Units"
        subtitle=" Buy ECG Prepaid units for all online meters and pay your postpaid bills online instantly."
        bgImage={IMAGES.ecg}
      />

      {/* Tab Navigation Header */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 4 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth" // Spans the full width of the container
          centered // Ensures alignment is centered
          sx={{mx:{xs: 'auto', sm: 6}}} // Responsive margin for smaller screens
          aria-label="billing options tabs"
        >
          <Tab
            label="Prepaid"
            id="simple-tab-0"
            aria-controls="simple-tabpanel-0"
          />
          <Tab
            label="Postpaid"
            id="simple-tab-1"
            aria-controls="simple-tabpanel-1"
          />
        </Tabs>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          {/* Tab Panels Hosting the Components */}
          <CustomTabPanel value={value} index={0}>
            <Prepaid />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Postpaid />
          </CustomTabPanel>
          <Typography variant="body2" fontStyle="italic">
            In case of delayed / missing recharge tokens,Please send a message
            to our support lines ( <a href="tel:0800981981">0800981981</a> or{" "}
            <a href="tel:+233593381045">+233 59 338 1045</a> ) with your
            transaction ID, phone number, and issue details so our team can
            attend to you quickly or you can fill out the complaint form
          </Typography>
          <ComplaintModal buttonVariant="button" buttonText="Complaint form"  showLarge={true}/>
        </Paper>
      </Container>
    </Box>
  );
}
