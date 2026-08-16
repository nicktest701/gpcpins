import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardActionArea,
  Chip,
  Fade,
  useTheme,
  alpha,
  Avatar,
  Stack,
} from "@mui/material";
import {
  LocalOfferRounded,
  TheatersRounded,
  PhoneAndroidRounded,
  WifiRounded,
  ElectricBoltRounded,
} from "@mui/icons-material";
import moment from "moment";
import { AuthContext, useAuth } from "../../context/providers/AuthProvider";
import CustomTitle from "../../components/custom/CustomTitle";
import { IMAGES } from "@/constants";

// Each service maps to a semantic theme color (not a hardcoded hex) so
// cards stay correct if the theme or palette ever changes.
// `path` is the route the card navigates to on click — leave it null
// for services that don't have a landing page yet; the card shows a
// "Coming soon" state instead of linking somewhere wrong.
const SERVICES = [
  {
    id: "vouchers",
    title: "Vouchers & Checkers",
    icon: LocalOfferRounded,
    description:
      "Generate and manage vouchers and checkers for exams, placements, and more.",
    colorKey: "primary",
    path: "/evoucher",
  },
  {
    id: "tickets",
    title: "Tickets",
    icon: TheatersRounded,
    description: "Book and manage event, cinema, stadium, and bus tickets.",
    colorKey: "secondary",
    path: "/evoucher",
  },
  {
    id: "airtime",
    title: "Airtime Transfer",
    icon: PhoneAndroidRounded,
    description: "Send airtime to any mobile network instantly.",
    colorKey: "info",
    path: "/airtime",
  },
  {
    id: "data",
    title: "Data Bundle",
    icon: WifiRounded,
    description: "Purchase and manage data bundles for all networks.",
    colorKey: "warning",
    path: '/airtime',
  },
  {
    id: "prepaid",
    title: "Prepaid Units",
    icon: ElectricBoltRounded,
    description: "Buy prepaid electricity units for your meter.",
    colorKey: "success",
    path: "/electricity",
  },
];

function greeting() {
  const hour = moment().hour();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function ServiceCard({ service }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const Icon = service.icon;
  const color = theme.palette[service.colorKey]?.main ?? theme.palette.primary.main;
  const disabled = !service.path;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        opacity: disabled ? 0.75 : 1,
        transition: theme.transitions.create(["box-shadow", "border-color", "transform"], {
          duration: 250,
        }),
        "&:hover": disabled
          ? undefined
          : {
              borderColor: color,
              boxShadow: `0 8px 24px ${alpha(color, 0.16)}`,
            },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      <CardActionArea
        disabled={disabled}
        // onClick={() => service.path && navigate(service.path)}
        sx={{
          height: "100%",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ width: "100%", mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 2.5,
              bgcolor: alpha(color, 0.12),
              color,
            }}
          >
            <Icon sx={{ fontSize: 30 }} />
          </Box>
          {disabled && (
            <Chip size="small" label="Coming soon" variant="outlined" />
          )}
        </Stack>

        <Typography variant="subtitle1" fontWeight="700" gutterBottom>
          {service.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {service.description}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

function EmployeeDashboard() {
  const { user } =useAuth()
  const salutation = useMemo(greeting, []);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Welcome section */}
      <Fade in timeout={800}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={5}>
          <Avatar
            alt=""
            src={IMAGES.hand}
            variant="rounded"
            sx={{ width: 44, height: 44 }}
          />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {salutation}, {user?.firstname || "there"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here&apos;s what&apos;s happening across your dashboard today.
            </Typography>
          </Box>
        </Stack>
      </Fade>

      {/* Services grid */}
      <CustomTitle
        title="Our Services"
        subtitle="Pick a service to get started."
      />
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {SERVICES.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <ServiceCard service={service} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default EmployeeDashboard;