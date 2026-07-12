import { Divider, Stack, Typography, Box, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function CustomTitle({
  title,
  icon,
  titleVariant,
  subtitle,
  divider,
  showBack = false,
  onBack,
  backButtonProps,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

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
          mb: 4,
          gap: 2,
               borderRadius: 3,
        }}
      >
        {showBack && (
          <IconButton
            onClick={handleBack}
            sx={{
              color: "text.secondary",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)",
                bgcolor: "action.hover",
              },
            }}
            {...backButtonProps}
          >
            <ArrowBack />
          </IconButton>
        )}
        <Stack>
          <Typography
            color="secondary"
            textAlign="left"
            textTransform="uppercase"
            variant={titleVariant || "h4"}
          >
            {title}
          </Typography>
          <Typography variant="body2" textAlign="left">
            {subtitle}
          </Typography>
        </Stack>
      </Stack>
      {divider && <Divider />}
    </>
  );
}

CustomTitle.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  titleVariant: PropTypes.string,
  subtitle: PropTypes.string,
  divider: PropTypes.bool,
  showBack: PropTypes.bool,
  onBack: PropTypes.func,
  backButtonProps: PropTypes.object,
};

export default CustomTitle;