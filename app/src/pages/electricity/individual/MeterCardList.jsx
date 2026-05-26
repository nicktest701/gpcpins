import { List, Paper, Stack, Typography, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCustomContext } from "../../../context/providers/CustomProvider";

const MeterCardList = ({ meters }) => {
  const navigate = useNavigate();
  const { customDispatch } = useCustomContext();

  const handleCardClick = (meter) => {
    customDispatch({
      type: "openViewMeter",
      payload: { open: true, details: meter },
    });
    navigate(`/electricity/meters/${meter.id}`);
  };

  return (
    <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {meters.map((meter) => (
        <Paper
          key={meter.id}
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            cursor: "pointer",
            transition: "0.2s",
            "&:hover": { bgcolor: "action.hover" },
          }}
          onClick={() => handleCardClick(meter)}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body1" fontWeight="bold">
                {meter.number}
              </Typography>
              <Chip
                label={meter.type}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>
            {meter.spn && (
              <Typography variant="body2" color="text.secondary">
                SPN: {meter.spn}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Name: {meter.name || "Not set"}
            </Typography>
            <Button
              variant="contained"
              size="small"
              fullWidth
              sx={{ mt: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(meter);
              }}
            >
              Buy Prepaid Units
            </Button>
          </Stack>
        </Paper>
      ))}
    </List>
  );
};

export default MeterCardList;