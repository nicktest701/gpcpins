import {
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import { useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import _ from "lodash";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { AuthContext } from "../../context/providers/AuthProvider";
import Password from "./Password";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import { generateRandomCode } from "../../config/generateRandomCode";
import { hidePhoneNumber } from "../../config/hideDetails";
import ResetPhoneNumber from "../../components/modals/ResetPhoneNumber";
import ProfilePhoto from "./ProfilePhoto";
import { Edit } from "@mui/icons-material";

const Personal = () => {
  const { user } = useContext(AuthContext);
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
        <Box
          sx={{
       
            borderRadius: 2,
            px: 2,
            py: 6,
           
             mb:8
          }}
        >
          <Typography variant="h4">Personal Details</Typography>
          <Typography paragraph variant="caption" color="secondary.main">
            General Information
          </Typography>

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
                disabled: true,
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
                  ? hidePhoneNumber(user?.phonenumber)
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
              }}
            />
          </Stack>
        </Box>
        <ResetPhoneNumber />
      </AnimatedContainer>

      <Password />
    </>
  );
};

export default Personal;
