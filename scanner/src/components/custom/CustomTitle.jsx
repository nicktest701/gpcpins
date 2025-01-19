import { Divider, Stack, Typography, Box } from "@mui/material";
import Breadcrumb from "../Breadcrumb";

function CustomTitle({ title, icon, titleVariant, subtitle, divider }) {
  return (
    <Box mb={4}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="flex-start"
        alignItems="center"
        pt={2}
        bgcolor="transparent"
        gap={1}
      >
        {/* {icon} */}
        <Typography
          textAlign={{ xs: "center", md: "left" }}
          variant={titleVariant || "h4"}
          mb={0}
          color="secondary"
        >
          {title}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        // fontStyle="italic"
        color="primary"
        // color="#aaa"
        textAlign={{ xs: "center", md: "left" }}
        pb={2}
      >
        {subtitle}
      </Typography>

      {/* <Divider /> */}
      {title !== "Dashboard" && <Breadcrumb pageName={title} />}
    </Box>
  );
}

export default CustomTitle;
