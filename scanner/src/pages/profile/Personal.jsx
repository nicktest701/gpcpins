import {
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";

import { Link, useSearchParams } from "react-router-dom";
import _ from "lodash";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { useAuth } from "../../context/providers/AuthProvider";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import { generateRandomCode } from "../../config/generateRandomCode";
import { hidePhoneNumber } from "../../config/hideDetails";
import ResetPhoneNumber from "../../components/modals/ResetPhoneNumber";
import ProfilePhoto from "./ProfilePhoto";
import { Edit } from "@mui/icons-material";

const Personal = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  //verify phone number
  const openVerifyPhoneNumber = () => {
    setSearchParams((params) => {
      params.set("x_token", generateRandomCode(200));
      return params;
    });
  };

  return (
    <>
      <AnimatedContainer>
        <Typography variant="h4">Personal Details</Typography>
        <Typography paragraph variant="caption" color="secondary.main">
          General Information
        </Typography>

        <ProfilePhoto />

        <Stack spacing={2} paddingTop={3}>
          <CustomFormControl>
            <TextField
              label="First Name"
              fullWidth
              required
              value={user?.firstname}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Link to="/profile/updates/firstname">
                      <IconButton>
                        <Edit />
                      </IconButton>
                    </Link>
                  </InputAdornment>
                ),
                readOnly: true,
              }}
            />
            <TextField
              label="Last Name"
              fullWidth
              required
              value={user?.lastname}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Link to="/profile/updates/lastname">
                      <IconButton>
                        <Edit />
                      </IconButton>
                    </Link>
                  </InputAdornment>
                ),
                readOnly: true,
              }}
            />
          </CustomFormControl>

          <TextField
            type="email"
            inputMode="email"
            variant="outlined"
            label="Email Address"
            fullWidth
            required
            value={user?.email}
            InputProps={{
              readOnly: true,
              disabled: true,
            }}
          />

          <TextField
            type="tel"
            inputMode="tel"
            variant="outlined"
            label="Phone Number"
            fullWidth
            required
            value={
              user?.phonenumber
                ? hidePhoneNumber(user.phonenumber)
                : user?.phonenumber
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {!_.isEmpty(user?.phonenumber) ? (
                    <IconButton onClick={openVerifyPhoneNumber}>
                      <Edit />
                    </IconButton>
                  ) : (
                    <Link
                      to="/profile/updates/phonenumber"
                      state={{
                        phonenumber: "0000000000",
                      }}
                    >
                      <Button>ADD NEW</Button>
                    </Link>
                  )}
                </InputAdornment>
              ),
              readOnly: !_.isEmpty(user?.phonenumber),
              // disabled: !_.isEmpty(user?.phonenumber),
            }}
          />

          {/* <LoadingButton
                  variant="contained"
                  onClick={handleSubmit}
                  loading={isLoading}
                  loadingIndicator={
                    <CircularProgress color="inherit" size={16} />
                  }
                  sx={{ alignSelf: "flex-start" }}
                >
                  {isLoading ? "Saving" : "Save Changes"}
                </LoadingButton> */}
        </Stack>

        <ResetPhoneNumber />
      </AnimatedContainer>

      {/* <Password /> */}
    </>
  );
};

export default Personal;
