// tabs/MobileMoneyOption.jsx

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  FormControlLabel,
  InputAdornment,
  Radio,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { PhoneRounded } from "@mui/icons-material";
import { useFormContext, useWatch } from "react-hook-form";
import MobilePartner from "../MobilePartner";
import { useAuth } from "../../context/providers/AuthProvider";
import { getMobilePartner } from "../../constants/PhoneCode";
import { MOBILE_PROVIDER } from "../../mocks/columns";
import { IMAGES } from "../../constants";
function MobileMoneyOption() {
  const { user } = useAuth();

  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const paymentMethod = useWatch({
    control,
    name: "paymentMethod",
  });
  const mobilePartner = useWatch({
    control,
    name: "mobilePartner",
  });

  const [showSavedNumber, setShowSavedNumber] = useState(false);
  const [expanded, setExpanded] = useState(paymentMethod === "momo");

  useEffect(() => {
    setExpanded(paymentMethod === "momo");
  }, [paymentMethod]);

  const handleSelect = () => {
    setValue("paymentMethod", "momo", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleUseSavedNumber = (_, checked) => {
    if (!checked) {
      setValue("phonenumber", "");
      setValue("confirmPhonenumber", "");
      setValue("mobilePartner", "");
      setShowSavedNumber(false);
      return;
    }
    setShowSavedNumber(true);

    setValue("phonenumber", user?.phonenumber || "", {
      shouldValidate: true,
    });

    setValue("confirmPhonenumber", user?.phonenumber || "", {
      shouldValidate: true,
    });

    setValue("mobilePartner", getMobilePartner(user?.phonenumber || ""), {
      shouldValidate: true,
    });
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        // borderRadius: 2,
        mb: 2,
        overflow: "hidden",
        borderRadius: 1,
      }}
    >
      <AccordionSummary
        sx={{
          backgroundColor:
            paymentMethod === "momo" ? "whitesmoke" : "background.default",
          py: 1.3,
        }}
        onClick={handleSelect}
      >
        <FormControlLabel
          // label="Mobile Money"
          sx={{ pointerEvents: "none", width: "100%", pl: 1 }}
          control={
            <Stack
              justifyContent="space-between"
              alignItems="center"
              direction="row"
              width="100%"
            >
              <Stack alignItems="center" direction="row">
                <div style={{ marginLeft: 12 }}>
                  <img
                    src={IMAGES.momo}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div>
                  <Typography variant="body2" ml={1.5}>
                    Mobile Money
                  </Typography>
                  {/* {!expanded && (
                    <Typography fontWeight={700}>
                      {currencyFormatter(walletBalance.data)}
                    </Typography>
                  )} */}
                </div>
              </Stack>
              <Radio
                size="small"
                checked={paymentMethod === "momo"}
                onClick={handleSelect}
                value="momo"
                sx={{ pointerEvents: "all" }}
              />
            </Stack>
          }
        />
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={2} pt={1}>
          {showSavedNumber ? (
            <>
              <TextField
                size="small"
                value={user?.phonenumber || ""}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Avatar
                        variant="square"
                        alt="network"
                        src={
                          MOBILE_PROVIDER?.find(
                            (item) =>
                              item.value ===
                              getMobilePartner(user?.phonenumber),
                          ).image
                        }
                        style={{
                          width: "28px",
                          height: 16,
                          objectFit: "contain",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          ) : (
            <>
              <MobilePartner
                size="small"
                value={mobilePartner}
                setValue={(value) => {
                  setValue("mobilePartner", value, {
                    shouldValidate: true,
                  });
                }}
                {...register("mobilePartner")}
                error={!!errors.mobilePartner}
                helperText={errors.mobilePartner?.message}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                size="small"
                type="tel"
                variant="outlined"
                label="Mobile Money Number"
                inputMode="tel"
                autoComplete="tel"
                {...register("phonenumber")}
                error={!!errors.phonenumber}
                helperText={errors.phonenumber?.message}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                placeholder="024XXXXXXX"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                size="small"
                type="tel"
                label="Confirm Mobile Number"
                placeholder="Re-enter phone number"
                inputMode="tel"
                autoComplete="tel"
                {...register("confirmPhonenumber")}
                error={!!errors.confirmPhonenumber}
                helperText={errors.confirmPhonenumber?.message}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}

          {!!user?.phonenumber && (
            <FormControlLabel
              control={<Switch size="small" />}
              label="Use Saved Number"
              // ={{ sx: { fontSize: 10 } }}

              onChange={handleUseSavedNumber}
            />
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default MobileMoneyOption;

// import { useState, useEffect } from "react";
// import {
//   Stack,
//   TextField,
//   FormControlLabel,
//   Radio,
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Switch,
// } from "@mui/material";
// import { ArrowDropDownRounded } from "@mui/icons-material";
// import MobilePartner from "../MobilePartner";
// import { useAuth } from "../../context/providers/AuthProvider";
// import { getMobilePartner } from "../../constants/PhoneCode";

// function MobileMoneyOption({
//   mobilePartner,
//   mobilePartnerErr,
//   mobilePartnerHelperText,
//   setMobilePartner,
//   phonenumber,
//   setPhonenumber,
//   phonenumberErr,
//   phonenumberHelperText,
//   confirmPhonenumber,
//   setConfirmPhonenumber,
//   confirmPhonenumberErr,
//   confirmPhonenumberHelperText,
//   value,
// }) {
//   const { user } = useAuth();
//   const [expand, setExpand] = useState(value === "momo");

//   useEffect(() => {
//     if (value === "momo" || !user?.id) {
//       setExpand(true);
//     } else {
//       setExpand(false);
//     }
//   }, [value, user]);

//   const handleChecked = (e) => {
//     if (e.target.checked) {
//       setPhonenumber(user?.phonenumber);
//       setConfirmPhonenumber(user?.phonenumber);
//       // const partner = getMobilePartner(user.phonenumber);
//       // setMobilePartner(partner.providerName);
//     } else {
//       setPhonenumber("");
//       setConfirmPhonenumber("");
//       // setMobilePartner("");
//     }
//   };

//   return (
//     <Accordion
//       sx={{ width: "100%" }}
//       expanded={expand}
//       onChange={() => setExpand(!expand)}
//     >
//       <AccordionSummary
//         sx={{ backgroundColor: "whitesmoke", px: 1, borderRadius: 1 }}
//         expandIcon={<ArrowDropDownRounded />}
//       >
//         <FormControlLabel
//           label="Mobile Money"
//           control={
//             <Radio
//               size="small"
//               value="momo"
//               onClick={() => setExpand(!expand)}
//               sx={{ pointerEvents: "all" }}
//             />
//           }
//           onClick={() => setExpand(!expand)}
//           sx={{ pointerEvents: "none" }}
//         />
//       </AccordionSummary>
//       <AccordionDetails>
//         <Stack spacing={2} pt={2}>
//           <MobilePartner
//             size="small"
//             value={mobilePartner || ""}
//             setValue={setMobilePartner}
//             error={mobilePartnerErr}
//             helperText={mobilePartnerHelperText}
//           />
//           <TextField
//             type="tel"
//             inputMode="tel"
//             variant="outlined"
//             label="Mobile Money Number"
//             fullWidth
//             required
//             size="small"
//             value={phonenumber}
//             onChange={(e) => setPhonenumber(e.target.value)}
//             error={!!phonenumberErr}
//             helperText={phonenumberHelperText}
//           />
//           <TextField
//             type="tel"
//             inputMode="tel"
//             variant="outlined"
//             label="Confirm Mobile Number"
//             fullWidth
//             required
//             size="small"
//             value={confirmPhonenumber}
//             onChange={(e) => setConfirmPhonenumber(e.target.value)}
//             error={!!confirmPhonenumberErr}
//             helperText={confirmPhonenumberHelperText}
//           />
//           {user?.phonenumber && (
//             <FormControlLabel
//               control={<Switch size="small" />}
//               label="Use Phone Number"
//               onChange={handleChecked}
//             />
//           )}
//         </Stack>
//       </AccordionDetails>
//     </Accordion>
//   );
// }

// export default MobileMoneyOption;
