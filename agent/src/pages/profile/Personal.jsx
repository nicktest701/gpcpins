import {
  Stack,
  TextField,
  IconButton,
  Button,
  InputAdornment,
  Typography,
} from "@mui/material";

import { useContext } from "react";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { Link, useSearchParams } from "react-router-dom";
import _ from "lodash";
import { Edit } from "@mui/icons-material";
import { AuthContext } from "../../context/providers/AuthProvider";
import Password from "./Password";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import { hidePhoneNumber } from "../../config/hideDetails";
import ResetPhoneNumber from "../../components/modals/ResetPhoneNumber";
import { generateRandomCode } from "../../config/generateRandomCode";
import ProfilePhoto from "./ProfilePhoto";

const Personal = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  //verify phone number
  const openVerifyPhoneNumber = () => {
    setSearchParams((params) => {
      params.set("x_token", generateRandomCode(100));
      return params;
    });
  };

  return (
    <>
      <AnimatedContainer>
        <Typography variant="h5">Personal Details</Typography>
        <Typography paragraph variant="caption" color="secondary.main">
          General Information
        </Typography>

        {/* <Divider>
        <Chip label='General Information' />
      </Divider> */}
        <ProfilePhoto />

        <Stack spacing={2} paddingTop={3}>
          <CustomFormControl>
            <TextField
              size="small"
              label="First Name"
              fullWidth
              required
              value={user?.firstname}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Link to="/profile/updates/firstname">
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </Link>
                  </InputAdornment>
                ),
                readOnly: true,
              }}
            />
            <TextField
              size="small"
              label="Last Name"
              fullWidth
              required
              value={user?.lastname}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Link to="/profile/updates/lastname">
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </Link>
                  </InputAdornment>
                ),
                readOnly: true,
              }}
            />
          </CustomFormControl>
          {/* <TextField
            size="small"
            label="username"
            fullWidth
            required
            value={user?.username}
            InputProps={{
              readOnly: true,
            }}
          /> */}

          <TextField
            size="small"
            type="email"
            inputMode="email"
            variant="outlined"
            label="Email Address"
            fullWidth
            required
            value={user?.email}
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            size="small"
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
                    <IconButton size="small" onClick={openVerifyPhoneNumber}>
                      <Edit />
                    </IconButton>
                  ) : (
                    <Link
                      to="/profile/updates/phonenumber"
                      state={{
                        phonenumber: "0000000000",
                      }}
                    >
                      <Button size="small">ADD NEW</Button>
                    </Link>
                  )}
                </InputAdornment>
              ),
              readOnly: !_.isEmpty(user?.phonenumber),
              // disabled: !_.isEmpty(user?.phonenumber),
            }}
          />
        </Stack>
      </AnimatedContainer>

      <Password />
      <ResetPhoneNumber />
    </>
  );
};

export default Personal;
