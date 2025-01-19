import { Divider, Stack, Typography, Box } from "@mui/material";

function CustomTitle({ title, icon, titleVariant, subtitle, divider }) {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        p={2}
        my={2}
        bgcolor="#fff"
        sx={{
          // borderRadius: "16px",
          mb: 4,
        }}
        // boxShadow='0 3px 5px rgba(0,0,0,0.08)'
      >
        {/* <Box
          sx={{
            display: { xs: "none", md: "inline-block" },
          }}
        >
          {icon}
        </Box> */}
        <Stack>
          <Typography
            color="secondary"
            textAlign="left"
            variant={titleVariant || "h4"}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            // color="#aaa"
            textAlign="left"
          >
            {subtitle}
          </Typography>
        </Stack>
      </Stack>
      {divider && <Divider />}
    </>
  );
}

export default CustomTitle;
