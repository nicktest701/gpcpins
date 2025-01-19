import { SERVICE_PROVIDER } from "../mocks/columns";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

function ServiceProvider({
  size,
  label,
  value,
  setValue,
  helperText,
  error,
  handleBlur,
}) {
  return (
    <TextField
      label={label || "EVD Provider"}
      size={size || "small"}
      select
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onBlur={handleBlur}
      fullWidth
      error={error}
      helperText={helperText}
    >
      <MenuItem selected disabled value="None">
        Select Network Type
      </MenuItem>
      {SERVICE_PROVIDER.map((provider) => (
        <MenuItem
          key={provider.id}
          value={provider.value}
          sx={{ display: "flex", gap: 2 }}
        >
          <Typography> {provider.label}</Typography>
        </MenuItem>
      ))}
    </TextField>
  );
}

export default ServiceProvider;
