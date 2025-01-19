import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function CustomTimePicker({
  label,
  size,
  value,
  setValue,
  error,
  helperText
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <TimePicker
        label={label}
        value={value}
        onChange={(time) => setValue(time)}
        slotProps={{
          textField: {
            size: size || 'small',
            fullWidth: true,
            error: error,
            helperText: helperText,
          },
        }}
      />
    </LocalizationProvider>
  );
}
