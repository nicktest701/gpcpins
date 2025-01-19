import PropTypes from "prop-types";
import CloseSharp from "@mui/icons-material/CloseSharp";
import {
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

function CustomDialogTitle({ title, subtitle, onClose }) {
  return (
    <DialogTitle>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography
            variant="h5"
            fontWeight="bold"
            textTransform="uppercase"
            color="secondary"
          >
            {title}
          </Typography>
          <Typography variant="body2" color="">
            {subtitle}
          </Typography>
        </div>
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseSharp />
          </IconButton>
        )}
      </Stack>
      {/* <Divider/> */}
    </DialogTitle>
  );
}

CustomDialogTitle.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func,
};

export default CustomDialogTitle;
