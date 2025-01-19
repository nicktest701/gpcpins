import { DangerousRounded } from "@mui/icons-material";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { Link } from "react-router-dom";

function ServiceNotAvaialble({ open, message }) {
  return (
    <Dialog
      // TransitionComponent={Transition}
      open={open}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent>
        <Stack justifyContent="center" alignItems="center">
          <DangerousRounded color="primary" style={{ width: 80, height: 80 }} />
          <Typography variant="h5" textAlign="center" paragraph>
            Service currently not available!
          </Typography>
          {message ? (
            <Typography variant="caption" textAlign="center" paragraph>
              {message}
            </Typography>
          ) : (
            <Typography variant="caption" textAlign="center" paragraph>
              We could not establish a connection to the server at the moment.
              Please try again between the hours of <b>07:00AM</b> and{" "}
              <b>10:00PM</b>.
            </Typography>
          )}

          <Link
            to="/"
            style={{
              backgroundColor: "green",
              padding: "8px 30px",
              color: "#fff",
            }}
          >
            OK
          </Link>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default ServiceNotAvaialble;
