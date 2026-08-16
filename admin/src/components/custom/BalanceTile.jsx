import { cloneElement } from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { WarningAmberRounded } from "@mui/icons-material";

function BalanceTile({ label, value, sublabel, icon, color = "#0F172A", isLow }) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 220,
        p: 2.5,
        borderRadius: 1.2,
        borderColor: (theme) =>
          isLow ? alpha(theme.palette.warning.main, 0.5) : alpha(theme.palette.text.primary, 0.08),
        bgcolor: (theme) => (isLow ? alpha(theme.palette.warning.main, 0.06) : "background.paper"),
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box
          sx={{
            width: 38,
            height: 38,
            display: "grid",
            placeItems: "center",
            borderRadius: 1.2,
            bgcolor: alpha(color, 0.12),
            color,
          }}
        >
          {cloneElement(icon, { sx: { fontSize: 20, color: "inherit" } })}
        </Box>
        {isLow && (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 5,
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.15),
              color: "warning.dark",
            }}
          >
            <WarningAmberRounded sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={600}>
              Low
            </Typography>
          </Stack>
        )}
      </Stack>

      <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mt: 2 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
        {label}
      </Typography>
      {sublabel && (
        <Typography variant="caption" color="text.disabled">
          {sublabel}
        </Typography>
      )}
    </Card>
  );
}

export default BalanceTile;
