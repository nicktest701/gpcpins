import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { useSearchParams } from "react-router-dom";

const AirtimePrompt = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("data");
      params.delete("airtime-prompt");
      return params;
    });
  };
  return (
    <Dialog
      open={Boolean(searchParams.get("airtime-prompt"))}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <CustomDialogTitle title="Processing Completed" onClose={handleClose} />

      <DialogContent>
        {searchParams.get("data") !== null &&
          JSON.parse(searchParams.get("data")).map((item, index) => {
            return (
              <Stack key={item?.trxn} py={2}>
                <Chip
                  label="Completed"
                  sx={{ alignSelf: "flex-end" }}
                  color="success"
                />
                <Typography fontWeight="bold">{item?.network}</Typography>
                <Typography>{item?.message}</Typography>
                <Divider />
              </Stack>
            );
          })}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AirtimePrompt;
