import { Stack } from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

import PropTypes from "prop-types";

const ItemCard = ({ title, value, icon }) => {
  return (
    <Card
      sx={{
        border: "1px solid whitesmoke",
        position: "relative",
        px: 3,
        py: 3,
        borderRadius: 2,
        width: "100%",
        bgcolor: "#fff",
        // bgcolor: bg || "#fff",
        boxShadow: (theme) => theme.customShadows.z8,
      }}
      elevation={1}
    >
      <Stack spacing={0.5}>
        <Typography variant="h6" color="primary">
          {title}
        </Typography>

        <div
          style={{
            position: "absolute",
            right: 10,
            bottom: 5,
          }}
        >
          {icon}
        </div>
        {/* {typeof value === "number" || typeof value === "string" ? ( */}
        <Typography
          variant="h5"
          textAlign="center"
          fontWeight="bold"
          sx={{ paddingY: 1 }}
        >
          {value}
        </Typography>
        {/* ) : (
          <>{value}</>
        )} */}
      </Stack>
    </Card>
  );
};

ItemCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.number,
  icon: PropTypes.node,
};

export default ItemCard;
