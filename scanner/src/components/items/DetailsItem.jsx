import { Link, Popover, Stack, Typography } from "@mui/material";
import React from "react";

const DetailsItem = ({ details }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "details" : undefined;

  return (
    <>
      <Link
        aria-describedby={id}
        onClick={handleClick}
        sx={{
          cursor: "pointer",
        }}
      >
        View
      </Link>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        elevation={1}
      >
        <Stack padding={2} spacing={1}>
          {/* theatre */}
          {details?.theatre && (
            <Stack direction="row" columnGap={2}>
              <Typography sx={{ fontWeight: "bold" }} variant="body2">
                Theatre
              </Typography>
              <Typography variant="body2">{details?.theatre}</Typography>
            </Stack>
          )}
      

          {/* venue */}
          {details?.venue && (
            <Stack direction="row" columnGap={2}>
              <Typography sx={{ fontWeight: "bold" }} variant="body2">
                Venue
              </Typography>
              <Typography variant="body2">{details?.venue}</Typography>
            </Stack>
          )}
          <Stack direction="row" columnGap={2}>
            <Typography sx={{ fontWeight: "bold" }} variant="body2">
              Date
            </Typography>
            <Typography variant="body2">{details?.date}</Typography>
          </Stack>
          <Stack direction="row" columnGap={2}>
            <Typography sx={{ fontWeight: "bold" }} variant="body2">
              Time
            </Typography>
            <Typography variant="body2">{details?.time}</Typography>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};

export default DetailsItem;
