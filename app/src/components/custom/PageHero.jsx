import { Box, Typography } from "@mui/material";


const PageHero = ({ title, subtitle, bgImage }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        background: `linear-gradient(to top right,rgba(0,0,0,0.8),rgba(0,0,0,0.7)),url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: { xs: "45svh", md: "35svh" },
        mx: "auto",
      }}
    >
      <Typography variant="h3" className="hero-title" paragraph>
        {title}
      </Typography>
      {subtitle && <Typography textAlign="center">{subtitle}</Typography>}
    </Box>
  );
};

export default PageHero;
