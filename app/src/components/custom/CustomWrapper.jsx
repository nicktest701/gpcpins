import { Box } from "@mui/material";
import CustomBreadCrumb from "./CustomBreadCrumb";
import React from "react";

function CustomWrapper({ children, title, item, img }) {
  return (
    <Box
      sx={{
        flex: 1,
        height: "100svh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CustomBreadCrumb title={title} item={item} />
      <Box
        sx={{
      
            height: "100%",
            width: "100%",
             mx: "auto",
          background: `linear-gradient(to top right,rgba(0,0,0,0.3),rgba(0,0,0,0.3)),url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          paddingX: { xs: 3, md: 2 },
          paddingY: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default React.memo(CustomWrapper);
