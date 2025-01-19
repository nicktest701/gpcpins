import {
  Stack,
  TextField,
  Typography,
  Button,
  IconButton,

} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { useContext } from "react";
import _ from "lodash";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { AuthContext } from "../../context/providers/AuthProvider";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import { hideNID, hidePhoneNumber } from "../../config/hideDetails";
import { Link, useSearchParams } from "react-router-dom";
import { generateRandomCode } from "../../config/generateRandomCode";
import ResetPhoneNumber from "../../components/modals/ResetPhoneNumber";
import { Edit } from "@mui/icons-material";
import ProfilePhoto from "./ProfilePhoto";

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
    <AnimatedContainer>
      <Typography variant="h4">Personal Details</Typography>
      <Typography paragraph variant="caption">
        General Information
      </Typography>

      <ProfilePhoto />

      <Stack spacing={2} paddingTop={3} width="100%">
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
          label="National ID Number"
          fullWidth
          value={user?.nid ? hideNID(user.nid) : user?.nid}
          InputProps={{
            readOnly: user?.nid !== "",
            disabled: user?.nid !== "",
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
          }}
        />
      </Stack>

      <ResetPhoneNumber />
    </AnimatedContainer>
  );
};

export default Personal;
