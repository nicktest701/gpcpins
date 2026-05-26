import { useState } from "react";
import {
  Button,
  Popover,
  Typography,
  Divider,
  Box,
  // useMediaQuery,
} from "@mui/material";
import { HelpOutline as HelpIcon } from "@mui/icons-material";

export default function MomoGuide() {
  const [anchorEl, setAnchorEl] = useState(null);
  // const isDesktop = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "momo-guide-popover" : undefined;

  return (
    <>
      <Button
        variant="text"
        onClick={handleClick}
        sx={{
          textTransform: "none",
          color: "text.secondary",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <HelpIcon fontSize="small" sx={{ mr: 0.5 }} />
        Note receiving prompt?
        <Typography
          component="span"
          variant="body2"
          sx={{
            ml: 1,
            textDecoration: "underline",
            color: "info.main",
            fontWeight: 500,
          }}
        >
          View Help
        </Typography>
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "90vw", sm: 400, md: 480 },
              maxWidth: "100%",
              maxHeight: { xs: "80vh", md: "90vh" },
              overflowY: "auto",
              p: 2,
              borderRadius: 2,
              boxShadow: 4,
            },
          },
        }}
        // For mobile: position near the button, but MUI Popover handles it well.
        // If you need center alignment on mobile, you can conditionally set anchorOrigin.
        // Here we keep it anchored to the button (better UX).
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          How to Approve Transactions
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* MTN MOMO Section */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="error.main"
            fontWeight="bold"
            textTransform="uppercase"
          >
            MTN MOMO
          </Typography>
          <Box
            component="ol"
            sx={{ pl: 2, mt: 1, "& li": { fontSize: "0.75rem", mb: 0.5 } }}
          >
            <li>
              Dial <strong>*170#</strong> and select <strong>Option 10</strong>,
              My Wallet.
            </li>
            <li>
              Select <strong>Option 3</strong> for My Approvals.
            </li>
            <li>Enter your PIN to get your Pending Approval List.</li>
            <li>Select the pending transaction to approve.</li>
            <li>
              Select <strong>Option 1 YES</strong> to approve the transaction or{" "}
              <strong>Option 2 NO</strong> to reject the transaction.
            </li>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Vodafone Cash Section */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="error.main"
            fontWeight="bold"
            textTransform="uppercase"
          >
            Vodafone Cash
          </Typography>
          <Box
            component="ol"
            sx={{ pl: 2, mt: 1, "& li": { fontSize: "0.75rem", mb: 0.5 } }}
          >
            <li>
              Dial <strong>*110#</strong> and select <strong>Option 6</strong>{" "}
              My Account.
            </li>
            <li>
              Select <strong>Option 5</strong> Approvals.
            </li>
            <li>Enter your PIN to get your Pending Approval List.</li>
            <li>Select the pending transaction to approve.</li>
            <li>
              Select <strong>Option 1 YES</strong> to approve the transaction or{" "}
              <strong>Option 2 NO</strong> to reject the transaction.
            </li>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Airtel Money Section */}
        <Box>
          <Typography
            variant="subtitle2"
            color="error.main"
            fontWeight="bold"
            textTransform="uppercase"
          >
            Airtel Money
          </Typography>
          <Box
            component="ol"
            sx={{ pl: 2, mt: 1, "& li": { fontSize: "0.75rem", mb: 0.5 } }}
          >
            <li>
              Dial <strong>*110#</strong> and select <strong>Option 6</strong>{" "}
              My Account.
            </li>
            <li>
              Select <strong>Option 5</strong> Approvals.
            </li>
            <li>Enter your PIN to get your Pending Approval List.</li>
            <li>Select the pending transaction to approve.</li>
            <li>
              Select <strong>Option 1 YES</strong> to approve the transaction or{" "}
              <strong>Option 2 NO</strong> to reject the transaction.
            </li>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
