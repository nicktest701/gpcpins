import { Box, Stack, Typography, useTheme, useMediaQuery } from "@mui/material";

/**
 * CustomTitle Component
 *
 * @param {string} title - Main title text
 * @param {string} subtitle - Optional subtitle text
 * @param {React.ReactNode} icon - Optional icon displayed before title
 * @param {'left'|'center'|'right'} align - Text alignment (default: 'left')
 * @param {boolean} withDivider - Whether to show a small colored divider under title
 * @param {string} titleVariant - MUI typography variant for title (responsive fallback)
 * @param {string} subtitleVariant - MUI typography variant for subtitle
 */
function CustomTitle({
  title,
  subtitle,
  icon,
  align = "left",
  withDivider = false,
  titleVariant,
  subtitleVariant = "body2",
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Responsive title variant
  const titleVariantValue = titleVariant || (isMobile ? "h4" : "h2");

  return (
    <Box sx={{ my: 3,mb:5, textAlign: align }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        // justifyContent={align === "center" ? "center" : "flex-start"}
      >
        {icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        )}

        <Stack
          direction="column"
          alignItems="start"
          spacing={1}
          // justifyContent={align === "center" ? "center" : "flex-start"}
        >
          <Typography
            variant={titleVariantValue}
            fontWeight="bold"
            color="text.primary"
            sx={{ letterSpacing: "-0.02em" }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant={subtitleVariant}
              color="text.secondary"
              sx={{
                mx: align === "center" ? "auto" : 0,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>

      {withDivider && (
        <Box
          sx={{
            height: 3,
            width: 50,
            bgcolor: "primary.main",
            mt: 1.5,
            borderRadius: 1.5,
            mx: align === "center" ? "auto" : 0,
          }}
        />
      )}
    </Box>
  );
}

export default CustomTitle;
