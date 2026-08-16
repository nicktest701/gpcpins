// UserProfile.jsx
import { useContext } from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import { EditRounded, Person, Cake, Badge, Phone, Email } from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import { generateRandomCode } from "../../config/generateRandomCode";
import { AuthContext } from "../../context/providers/AuthProvider";

// ─── Helper component for each detail row ──────────────────────────
const DetailRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      py: 0.75,
      px: 1,
      borderRadius: 1,
      transition: "background-color 0.2s",
      "&:hover": { bgcolor: "action.hover" },
    }}
  >
    <Box sx={{ color: "primary.main", display: "flex", alignItems: "center" }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="medium">
        {value || "N/A"}
      </Typography>
    </Box>
  </Box>
);

// ─── Main Component ──────────────────────────────────────────────────
function UserProfile({ values }) {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpenEdit = () => {
    setSearchParams((params) => {
      params.set("personal", generateRandomCode(50));
      return params;
    });
  };

  const canEdit = user?.permissions?.includes("Edit users");

  return (
    <Box sx={{ py: 2 }}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 1.2,
          p: 3,
          bgcolor: "background.paper",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: 4 },
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.lighter",
                  borderRadius: "50%",
                  p: 1,
                }}
              >
                <Person color="primary" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Personal Details
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage user personal information
                </Typography>
              </Box>
            </Stack>
            {canEdit && (
              <Tooltip title="Edit section" arrow>
                <IconButton
                  onClick={handleOpenEdit}
                  size="small"
                  sx={{ color: "primary.main" }}
                >
                  <EditRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Divider />
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <DetailRow icon={<Badge fontSize="small" />} label="First Name" value={values?.firstname} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow icon={<Badge fontSize="small" />} label="Last Name" value={values?.lastname} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow
                icon={<Cake fontSize="small" />}
                label="Date of Birth"
                value={values?.dob ? moment(values.dob).format("Do MMMM, YYYY") : "N/A"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow
                icon={<Phone fontSize="small" />}
                label="Telephone"
                value={values?.phonenumber}
              />
            </Grid>
            <Grid item xs={12}>
              <DetailRow
                icon={<Badge fontSize="small" />}
                label="National ID / Voter's ID"
                value={values?.nid}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow
                icon={<Email fontSize="small" />}
                label="Email Address"
                value={values?.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow
                icon={<Phone fontSize="small" />}
                label="Telephone"
                value={values?.phonenumber}
              />
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    </Box>
  );
}

export default UserProfile;