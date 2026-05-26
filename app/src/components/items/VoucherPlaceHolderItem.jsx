

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material";

function VoucherPlaceHolderItem({ title, value, img }) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      flex={1}
      sx={{
        py: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Typography variant="body2" fontWeight={500} color="text.secondary">
        {title}
      </Typography>
      <Typography variant="body2" fontWeight={400} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {img}
        {value}
      </Typography>
    </Stack>
  );
}

export default VoucherPlaceHolderItem;