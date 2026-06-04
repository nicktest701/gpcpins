import { List, Paper, Stack, Typography, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MeterCardList = ({ meters }) => {
  const navigate = useNavigate();


  const handleCardClick = (meter) => {
    console.log("Card clicked for meter:", meter);
    // customDispatch({
    //   type: "openViewMeter",
    //   payload: { open: true, details: meter },
    // });
        navigate(`/electricity/prepaid/${meter.number}/buy`, {
        state: {
          meterDetails: {
            number: meter?.number,
            name: meter.name,
            address: meter.address,
            spn: meter.spn,
            // any other data
          },
        },
      });
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