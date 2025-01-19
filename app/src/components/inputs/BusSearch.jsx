import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { TOWNS } from "../../mocks/towns";

const BusSearch = ({ label, value, setValue, icon, inputColor }) => {
  return (
    <Autocomplete
      options={TOWNS}
      freeSolo
      closeText=""
      disableClearable
      fullWidth
      loadingText="Please wait..."
      isOptionEqualToValue={(option, value) =>
        value === undefined ||
        value === null ||
        value === "" ||
        option === value
      }
      getOptionLabel={(option) => option || ""}
      value={value}
      onChange={(e, value) => setValue(value)}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label={label}
            placeholder={label}
            fullWidth
            // size='small'
            InputProps={{
              ...params.InputProps,
              sx: { color: inputColor || "#fff" },
              startAdornment: (
                <InputAdornment position="start">{icon}</InputAdornment>
              ),
              endAdornment: <InputAdornment position="end"></InputAdornment>,
            }}
          />
        );
      }}
    />
  );
};

export default BusSearch;
