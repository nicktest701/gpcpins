import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import "../../styles/date-range-picker.css"; // main style file
import { DateRangePicker, DateRange } from "react-date-range";
import moment from "moment";

function CustomDateRangePicker({
  open,
  setOpen,
  date = [
    {
      startDate: moment().toDate(),
      endDate: moment().toDate(),
      key: "selection",
    },
  ],
  setDate,
  refetchData,
}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  const handleRefetch = () => {
    refetchData();
    setOpen(false);
  };

  const handleChange = (item) => {
    setDate([item.selection]);
  };

  return (
    <Dialog
      open={open}
      maxWidth={matches ? "lg" : "sm"}
      fullWidth
      hideBackdrop
      sx={{ width: "fit-content" }}
    >
      <DialogContent sx={{ display: "grid", placeItems: "center" }}>
        {matches ? (
          <DateRangePicker
            onChange={handleChange}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={date}
            direction={matches ? "horizontal" : "vertical"}
          />
        ) : (
          <DateRange
            editableDateInputs={true}
            onChange={handleChange}
            moveRangeOnFirstSelection={false}
            ranges={date}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Close</Button>
        <Button variant="contained" onClick={handleRefetch}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomDateRangePicker;
