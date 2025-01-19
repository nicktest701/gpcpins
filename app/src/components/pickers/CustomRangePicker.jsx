import { Stack, TextField } from "@mui/material";
import { RefreshRounded } from "@mui/icons-material";
import moment from "moment";

function CustomRangePicker({ date, setDate, setOpen, refetch }) {
  const resetDateRange = () => {
    setDate([
      {
        startDate: new Date("2024-01-01"),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    if (refetch) {
      refetch();
    }
  };
  return (
    <Stack direction="row" sx={{ position: "relative" }}>
      <TextField
        label="Select Date Range"
        size="small"
        sx={{
          borderRadius: 0,
          width: 250,
        }}
        onClick={() => setOpen(true)}
        value={`${moment(date[0]?.startDate).format("ll")} -${moment(
          date[0]?.endDate
        ).format("ll")}`}
        InputProps={{
          readOnly: true,
        }}
        inputProps={{
          style: { cursor: "pointer" },
        }}
      />
      <RefreshRounded
        onClick={resetDateRange}
        sx={{ position: "absolute", right: 8, top: 8 }}
      />
    </Stack>
  );
}

export default CustomRangePicker;
