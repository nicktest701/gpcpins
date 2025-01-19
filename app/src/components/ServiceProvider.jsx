import { SERVICE_PROVIDER } from "../mocks/columns";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

function ServiceProvider({ size, label, value, setValue, helperText, error }) {
  return (
    <TextField
      label={label || "EVD Provider"}
      size={size || "small"}
      select
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Avatar
              variant="square"
              alt="service-provider"
              src={provider.image}
              style={{ width: "28px", height: 16, objectFit: "contain" }}
            />
            <Typography> {provider.label}</Typography>
          </div>
        </MenuItem>
      ))}
    </TextField>
  );
}

export default ServiceProvider;
