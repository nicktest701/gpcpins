import {
  Container,
  Stack,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { useContext } from "react";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { EditRounded } from "@mui/icons-material";
import { generateRandomCode } from "../../config/generateRandomCode";
import PersonalDetailsItem from "../../components/custom/PersonalDetailsItem";
import { AuthContext } from "../../context/providers/AuthProvider";

const UserProfile = ({ values }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  const handleOpenEdit = () => {
    setSearchParams((params) => {
      params.set("personal", generateRandomCode(50));
      return params;
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Container
        sx={{
          bgcolor: "#fff",
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" paragraph py={1} mt={1}>
            Personal Details
          </Typography>
          {user?.permissions?.includes("Edit users") && (

            <IconButton onClick={handleOpenEdit}>
            <EditRounded />
          </IconButton>
          )}
        </Box>
        <Stack spacing={2}>
          <CustomFormControl>
            <PersonalDetailsItem label="First Name" value={values?.firstname} />
            <PersonalDetailsItem label="Last Name" value={values?.lastname} />
          </CustomFormControl>

          <CustomFormControl>
            <PersonalDetailsItem
              label="Date Of Birth"
              value={moment(values?.dob).format("Do MMMM,YYYY")}
            />
            <PersonalDetailsItem
              label="Telephone No."
              value={values?.phonenumber}
            />
          </CustomFormControl>

          <PersonalDetailsItem
            label="National ID / Voter's ID Number"
            value={values?.nid}
          />

          <CustomFormControl>
            <PersonalDetailsItem
              label="Telephone No."
              value={values?.phonenumber}
            />

            <PersonalDetailsItem label="Email Address" value={values?.email} />
          </CustomFormControl>
        </Stack>
      </Container>
    </Box>
  );
};

export default UserProfile;
