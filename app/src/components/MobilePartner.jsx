import { MOBILE_PROVIDER } from "../mocks/columns";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";

function MobilePartner({ size, label, value, setValue, helperText, error }) {
  return (
    <TextField
      label={label || "Mobile Money Partner"}
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
      {MOBILE_PROVIDER.map((provider) => (
        <MenuItem
          key={provider.id}
          value={provider.value}
          sx={{ display: "flex", gap: 2, fontSize: 14 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Avatar
              variant="square"
              alt="network"
              src={provider.image}
              style={{ width: "28px", height: 16, objectFit: "contain" }}
            />
            {provider.label}
          </div>
        </MenuItem>
      ))}
    </TextField>
  );
}

export default MobilePartner;
