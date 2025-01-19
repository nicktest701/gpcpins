import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function VoucherPlaceHolderItem({ title, value }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography fontWeight="bold" variant="caption">{title}</Typography>
      <Typography variant="caption">{value}</Typography>
    </Stack>
  );
}

export default VoucherPlaceHolderItem;
