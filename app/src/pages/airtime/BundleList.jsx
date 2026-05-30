import { useContext, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  Stack,
  IconButton,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getBundleList } from "../../api/paymentAPI";
import { currencyFormatter } from "../../constants";
import { generateRandomCode } from "../../config/generateRandomCode";
import { CustomContext } from "../../context/providers/CustomProvider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";

function BundleList({ setSelectedBundle, selectedBundle }) {
  const { customDispatch } = useContext(CustomContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch bundles
  const {
    data: bundles,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "bundle-list",
      state?.bundleInfo?.type,
      state?.bundleInfo?.provider,
    ],
    queryFn: () => getBundleList(state?.bundleInfo?.network),
    enabled:
      state?.bundleInfo?.type === "Bundle" &&
      state?.bundleInfo?.provider !== "None" &&
      !!state?.bundleInfo?.network,
    retry: 1,
  });

  // Filter bundles by search term
  const filteredBundles = useMemo(() => {
    if (!bundles) return [];
    if (!searchTerm.trim()) return bundles;
    const term = searchTerm.trim().toLowerCase();
    return bundles.filter(
      (bundle) =>
        bundle.plan_name?.toLowerCase().includes(term) ||
        bundle.volume?.toLowerCase().includes(term) ||
        bundle.category?.toLowerCase().includes(term),
    );
  }, [bundles, searchTerm]);

  const handleSelectBundle = (bundle) => {
    setSelectedBundle(bundle);
  };

  const handleProceed = () => {
    if (!selectedBundle) return;

    setSearchParams((params) => {
      params.set("kyTNM", generateRandomCode(150));
      params.set("plan_id", selectedBundle.plan_id);
      params.set("plan_name", selectedBundle.plan_name);
      params.set("plan_volume", selectedBundle.volume);
      params.set("plan_price", selectedBundle.price);
      params.set("amount", selectedBundle.price);
      params.delete("show_list");
      return params;
    });
  };

  const handleClose = () => {
    Swal.fire({
      title: "Cancel bundle selection?",
      text: "Are you sure you want to cancel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        customDispatch({
          type: "set_Airtime_Bundle_Amount",
          payload: 0,
        });
        setSearchParams((params) => {
          params.delete("show_list");
          return params;
        });
        navigate(
          "/airtime?link=6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5",
        );
      }
    });
  };

  const clearSearch = () => setSearchTerm("");

  return (
    <Dialog
      open={Boolean(searchParams?.get("show_list"))}
      maxWidth="md"
      fullWidth
      onClose={handleClose}
    >
      <CustomDialogTitle
        title={`${state?.bundleInfo?.provider} Data Bundles`}
        subtitle="Select a data bundle to top up"
        onClose={handleClose}
      />

      <DialogContent>
        {/* Search input */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, volume, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Loading state */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load bundles. {error?.message || "Please try again."}
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredBundles.length === 0 && (
          <Alert severity="info">
            {searchTerm
              ? `No bundles match "${searchTerm}". Try a different search.`
              : "No bundles available for this provider."}
          </Alert>
        )}

        {/* Bundle grid */}
        {!isLoading && !isError && filteredBundles.length > 0 && (
          <Grid container spacing={2}>
            {filteredBundles.map((bundle) => {
              const isSelected = selectedBundle?.plan_id === bundle.plan_id;
              return (
                <Grid item xs={12} sm={6} md={4} key={bundle.plan_id}>
                  <Tooltip
                    title={
                      <Stack spacing={0.5}>
                        <Typography variant="caption">
                          <strong>Category:</strong> {bundle.category}
                        </Typography>
                        <Typography variant="caption">
                          <strong>Type:</strong> {bundle.type}
                        </Typography>
                        <Typography variant="caption">
                          <strong>Validity:</strong>{" "}
                          {isNaN(bundle.validity)
                            ? bundle.validity
                            : `${bundle.validity} days`}
                        </Typography>
                      </Stack>
                    }
                    placement="top"
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        bgcolor: isSelected
                          ? "primary.main"
                          : "background.paper",
                        color: isSelected ? "white" : "text.primary",
                        borderColor: isSelected ? "primary.main" : "divider",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 2,
                          borderColor: "primary.main",
                        },
                      }}
                      onClick={() => handleSelectBundle(bundle)}
                    >
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          {bundle.plan_name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={isSelected ? "white" : "text.secondary"}
                        >
                          {bundle.volume}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" mt={1}>
                          {currencyFormatter(bundle.price)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Valid for{" "}
                          {isNaN(bundle.validity)
                            ? bundle.validity
                            : `${bundle.validity} days`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          disabled={!selectedBundle || isError}
          onClick={handleProceed}
          loading={isLoading}
        >
          Proceed
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default BundleList;
