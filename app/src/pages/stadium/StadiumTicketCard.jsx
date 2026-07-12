import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Stack,
  Chip,
  Avatar,
  Box,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { CalendarToday, LocationOn, SportsSoccer } from "@mui/icons-material";

function StadiumTicketCard({ id, details }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleNavigateToMatch = () => {
    navigate(`match/${id}?home=${details?.home}&away=${details?.away}`, {
      state: {
        details: {
          id,
          ...details,
        },
      },
    });
  };

  const matchDate = moment(new Date(details?.date));
  const matchTime = moment(new Date(details?.time));

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: theme.shadows[6],
        },
        border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          padding: "2px",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.4s ease",
        },
        "&:hover::before": {
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Stack spacing={2}>
          {/* Match Type Chip */}
          <Chip
            label={details?.matchType || "Match"}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: "flex-start", fontWeight: 600 }}
          />

          {/* Teams */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Stack alignItems="center" spacing={0.5}>
              <Avatar
                src={details?.homeImage}
                variant="rounded"
                sx={{ width: 48, height: 48 }}
              />
              <Typography variant="caption" align="center" fontWeight="medium">
                {details?.home}
              </Typography>
            </Stack>

            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              VS
            </Typography>

            <Stack alignItems="center" spacing={0.5}>
              <Avatar
                src={details?.awayImage}
                variant="rounded"
                sx={{ width: 48, height: 48 }}
              />
              <Typography variant="caption" align="center" fontWeight="medium">
                {details?.away}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          {/* Match details */}
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2">{details?.venue || "Venue"}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2">
                {matchDate.format("dddd, LL")}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SportsSoccer fontSize="small" color="action" />
              <Typography variant="body2">{matchTime.format("hh:mm a")}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleNavigateToMatch}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          Get Ticket
        </Button>
      </CardActions>
    </Card>
  );
}

export default StadiumTicketCard;