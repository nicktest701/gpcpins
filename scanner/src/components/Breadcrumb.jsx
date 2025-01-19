import { Box, Typography, Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";

const Breadcrumb = ({ pageName }) => {
  return (
    <Box
      mb={6}
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      alignItems={{ sm: "center" }}
      justifyContent={{ sm: "flex-end" }}
      gap={3}
    >
      {/* <Typography variant="h2" fontWeight="fontWeightBold" color="textPrimary">
        {pageName}
      </Typography> */}

      <Breadcrumbs aria-label="breadcrumb">
        <Link
          to="/"
          underline="hover"
          color="inherit"
          style={{
            textDecoration: "none",
            color: "var(--secondary)",
          }}
        >
          Dashboard
        </Link>
        <Typography color="primary" fontWeight="fontWeightMedium">
          {pageName}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
