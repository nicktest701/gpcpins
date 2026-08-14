import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import moment from "moment";

// The activity log is a chronological feed, not a sequence of steps to complete,
// so a timeline (dot + connecting line) is the honest pattern here — the old
// MUI <Stepper> implied progress through stages, which isn't what this data is.
function CustomStepper({ logs }) {
  if (!logs?.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No recent activity yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={0}>
      {logs.map((log, index) => (
        <Stack key={log?.id ?? index} direction="row" spacing={1.5}>
          <Stack alignItems="center" sx={{ width: 16, flexShrink: 0 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                mt: "6px",
                borderRadius: "50%",
                flexShrink: 0,
                bgcolor: index === 0 ? "secondary.main" : (theme) => alpha(theme.palette.text.primary, 0.25),
              }}
            />
            {index < logs.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  width: "1px",
                  minHeight: 26,
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.1),
                }}
              />
            )}
          </Stack>
          <Box sx={{ pb: 2.5 }}>
            <Typography variant="body2" fontWeight={500} color="text.primary">
              {log?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {moment(log?.createdAt).fromNow()}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

export default CustomStepper;