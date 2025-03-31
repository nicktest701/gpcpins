import {
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import { useContext } from "react";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { ArrowForward } from "@mui/icons-material";

function MeterListItem({ _id, spn, number, name, type }) {
  const { customDispatch } = useContext(CustomContext);

  const openMeterDetails = () => {
    customDispatch({
      type: "openViewMeter",
      payload: {
        open: true,
        details: {
          _id,
          number,
          name,
          type,
        },
      },
    });
  };

  const itemStyle = {
    // fontSize: 11,
    color: "secondary.main",
    fontWeight: "700",
  };

  return (
    <ListItemButton
      divider
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onClick={openMeterDetails}
    >
      <ListItemText
        primary={number}
        primaryTypographyProps={itemStyle}
        secondary={name || "N/A"}
        sx={{ display: { xs: "block", md: "none" } }}
      />

      <ListItemText
        primary={number}
        primaryTypographyProps={itemStyle}
        secondary="Meter No."
        sx={{ display: { xs: "none", md: "block" } }}
      />
      {spn && (
        <ListItemText
          primary={spn}
          primaryTypographyProps={itemStyle}
          secondary="SPN Number"
          sx={{ display: { xs: "none", md: "block" } }}
        />
      )}

      <ListItemText
        primary={name || "N/A"}
        primaryTypographyProps={itemStyle}
        secondary="Name"
        sx={{ display: { xs: "none", md: "block" } }}
      />
      <ListItemText
        primary={`${type} (IMES)`}
        primaryTypographyProps={itemStyle}
        secondary="Type"
        sx={{ display: { xs: "none", md: "block" } }}
      />
      <ListItemSecondaryAction color="secondary">
        Buy Prepaid
      </ListItemSecondaryAction>
    </ListItemButton>
  );
}

export default MeterListItem;
