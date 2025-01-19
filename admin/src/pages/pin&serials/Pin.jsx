import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";

function Pin({
  isPinChecked,
  setIsPinChecked,
  pinNumber,
  setPinNumber,
  pinLength,
  setPinLength,
  pinOption,
  setPinOption,
}) {
  return (
    <Stack flex={1} spacing={2}>
      <FormControlLabel
        label="Pins"
        control={
          <Checkbox
            checked={isPinChecked}
            onChange={(e) => setIsPinChecked(!isPinChecked)}
            inputProps={{ "aria-label": "controlled" }}
            size='small'
          />
        }
      />

      {isPinChecked && (
        <>
          <TextField
            label="Number of Pins"
            size="small"
            fullWidth
            value={pinNumber}
            onChange={(e) => setPinNumber(e.target.value)}
          />
          <TextField
            size="small"
            label="Length"
            fullWidth
            value={pinLength}
            onChange={(e) => setPinLength(e.target.value)}
          />
          <FormControl>
            <FormLabel id="pins">Options</FormLabel>
            <RadioGroup
              row
              aria-labelledby="pins"
              name="pins-group"
              value={pinOption}
              onChange={(e) => setPinOption(e.target.value)}
            >
              <FormControlLabel
                value="letters"
                control={<Radio size="small" />}
                label="Letters only"
              />
              <FormControlLabel
                value="numbers"
                control={<Radio size="small" />}
                label="Numbers only"
              />
              <FormControlLabel
                value="both"
                control={<Radio size="small" />}
                label="Both"
              />
            </RadioGroup>
          </FormControl>
        </>
      )}
    </Stack>
  );
}

export default Pin;
