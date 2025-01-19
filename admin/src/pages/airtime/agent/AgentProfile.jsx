import { Container, Stack, Box, Typography, IconButton } from "@mui/material";
import CustomFormControl from "../../../components/inputs/CustomFormControl";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { EditRounded } from "@mui/icons-material";

import { generateRandomCode } from "../../../config/generateRandomCode";
import PersonalDetailsItem from "../../../components/custom/PersonalDetailsItem";
import { AuthContext } from "../../../context/providers/AuthProvider";
import { useContext } from "react";

const AgentProfile = ({ values }) => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpenEdit = (value) => {
    setSearchParams((params) => {
      params.set(value, generateRandomCode(50));

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
          <Typography variant="h4" paragraph p={1} mt={1}>
            Personal Details
          </Typography>
          {user?.permissions?.includes("Edit agents") && (
            <IconButton onClick={() => handleOpenEdit("personal")}>
              <EditRounded />
            </IconButton>
          )}
        </Box>
        <Stack spacing={2}>
          <CustomFormControl>
            <PersonalDetailsItem label="First Name" value={values?.firstname} />
            <PersonalDetailsItem label="Last Name" value={values?.lastname} />
          </CustomFormControl>
          <PersonalDetailsItem label="Username" value={values?.username} />

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
        </Stack>
      </Container>
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
          <Typography variant="h4" paragraph p={1} mt={1}>
            Contact Details
          </Typography>
          {user?.permissions?.includes("Edit agents") && (
            <IconButton onClick={() => handleOpenEdit("contact")}>
              <EditRounded />
            </IconButton>
          )}
        </Box>
        <Stack spacing={2}>
          <CustomFormControl>
            <PersonalDetailsItem
              label="Telephone No."
              value={values?.phonenumber}
            />

            <PersonalDetailsItem label="Email Address" value={values?.email} />
          </CustomFormControl>

          <PersonalDetailsItem
            label="Residential Address"
            value={values?.residence}
          />
        </Stack>
      </Container>
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
          <Typography variant="h4" paragraph p={1} mt={1}>
            Business Information
          </Typography>
          {user?.permissions?.includes("Edit agents") && (
            <IconButton onClick={() => handleOpenEdit("business")}>
              <EditRounded />
            </IconButton>
          )}
        </Box>
        <Stack spacing={2}>
          <PersonalDetailsItem
            label="Business Name"
            value={values?.business_name}
          />
          <PersonalDetailsItem
            label="Location"
            value={values?.business_location}
          />
          <PersonalDetailsItem
            label="Description"
            value={values?.business_description}
          />

          <CustomFormControl>
            <PersonalDetailsItem
              label="Telephone No."
              value={values?.business_phonenumber}
            />

            <PersonalDetailsItem
              label="Email Address"
              value={values?.business_email}
            />
          </CustomFormControl>
        </Stack>
      </Container>
    </Box>
  );
};

export default AgentProfile;
