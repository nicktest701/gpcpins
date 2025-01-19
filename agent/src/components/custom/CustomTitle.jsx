import { Divider, Stack, Typography } from "@mui/material";

function CustomTitle({ title, titleVariant, subtitle }) {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
        py={2}
      >
        {/* <Box
          sx={{
            display: { xs: 'none', md: 'inline-block' },
          }}
        >
          {icon}
        </Box> */}
        <Stack>
          <Typography variant={titleVariant || "h3"}>{title}</Typography>
          <Typography variant="body2" color="primary.main">
            {subtitle}
          </Typography>
        </Stack>
      </Stack>

      <Divider />
    </>
  );
}

export default CustomTitle;
