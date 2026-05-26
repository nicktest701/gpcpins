import { useState, useEffect } from "react";
import {
  Stack,
  TextField,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Switch,
} from "@mui/material";
import { ArrowDropDownRounded } from "@mui/icons-material";
import MobilePartner from "../MobilePartner";
import { useAuth } from "../../context/providers/AuthProvider";
import { getCode } from "../../constants";

function MobileMoneyOption({
  mobilePartner,
  mobilePartnerErr,
  mobilePartnerHelperText,
  setMobilePartner,
  phonenumber,
  setPhonenumber,
  phonenumberErr,
  phonenumberHelperText,
  confirmPhonenumber,
  setConfirmPhonenumber,
  confirmPhonenumberErr,
  confirmPhonenumberHelperText,
  value,
}) {
  const { user } = useAuth();
  const [expand, setExpand] = useState(value === "momo");

  useEffect(() => {
    if (value === "momo" || !user?.id) {
      setExpand(true);
    } else {
      setExpand(false);
    }
  }, [value, user]);

  const handleChecked = (e) => {
    if (e.target.checked) {
      setPhonenumber(user?.phonenumber);
      setConfirmPhonenumber(user?.phonenumber);
      const partner = getCode(user.phonenumber);
      // console.log(partner);
      setMobilePartner(partner.providerName);
    } else {
      setPhonenumber("");
      setConfirmPhonenumber("");
      setMobilePartner("");
    }
  };

  return (
    <Accordion
      sx={{ width: "100%" }}
      expanded={expand}
      onChange={() => setExpand(!expand)}
    >
      <AccordionSummary
        sx={{ backgroundColor: "whitesmoke", px: 1, borderRadius: 1 }}
        expandIcon={<ArrowDropDownRounded />}
      >
        <FormControlLabel
          label="Mobile Money"
          control={
            <Radio
              size="small"
              value="momo"
              onClick={() => setExpand(!expand)}
              sx={{ pointerEvents: "all" }}
            />
          }
          onClick={() => setExpand(!expand)}
          sx={{ pointerEvents: "none" }}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2} pt={2}>
          <MobilePartner
            size="small"
            value={mobilePartner || ""}
            setValue={setMobilePartner}
            error={mobilePartnerErr}
            helperText={mobilePartnerHelperText}
          />
          <TextField
            type="tel"
            inputMode="tel"
            variant="outlined"
            label="Mobile Money Number"
            fullWidth
            required
            size="small"
            value={phonenumber}
            onChange={(e) => setPhonenumber(e.target.value)}
            error={!!phonenumberErr}
            helperText={phonenumberHelperText}
          />
          <TextField
            type="tel"
            inputMode="tel"
            variant="outlined"
            label="Confirm Mobile Number"
            fullWidth
            required
            size="small"
            value={confirmPhonenumber}
            onChange={(e) => setConfirmPhonenumber(e.target.value)}
            error={!!confirmPhonenumberErr}
            helperText={confirmPhonenumberHelperText}
          />
          {user?.phonenumber && (
            <FormControlLabel
              control={<Switch size="small" />}
              label="Use Phone Number"
              onChange={handleChecked}
            />
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default MobileMoneyOption;
