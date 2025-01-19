import { Stack } from "@mui/material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import moment from "moment";

export default function CustomDatePicker({
  label,
  size,
  value,
  setValue,
  minDate,
  borderRadius,
  error,
  helperText,
  inputColor,
}) {
  return (
    <Stack width="100%">
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DatePicker
          label={label}
          format="LL"
          value={value}
          minDate={minDate || moment()}
          onChange={(date) => setValue(date)}
          sx={{
            width: "100%",
            borderRadius: borderRadius || 1,
          }}
          slotProps={{
            field: {
              InputProps: {
                sx: {
                  color: inputColor || "",
                },
              },
            },
            textField: {
              size: size || "small",
              fullWidth: true,
              error: error,
              helperText: helperText,
            },
          }}
        />
      </LocalizationProvider>
    </Stack>
  );
}
