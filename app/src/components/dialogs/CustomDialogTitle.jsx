import PropTypes from "prop-types";
import CloseSharp from "@mui/icons-material/CloseSharp";
import {
  DialogTitle,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

function CustomDialogTitle({ title, subtitle, onClose }) {
  return (
    <>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box style={{ flex: 1 }}>
            <Typography
              variant="body2"
              fontWeight="bold"
              textTransform="uppercase"
              color="secondary.main"
            >
              {title}
            </Typography>
            <Typography variant="body2" color="primary">
              {subtitle}
            </Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseSharp />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
      <Divider />
    </>
  );
}

CustomDialogTitle.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func,
};

export default CustomDialogTitle;
