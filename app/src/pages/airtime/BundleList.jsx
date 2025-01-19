import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingButton from "@mui/lab/LoadingButton";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBundleList } from "../../api/paymentAPI";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { useContext, useState } from "react";
import Swal from "sweetalert2";
import { currencyFormatter } from "../../constants";
import { generateRandomCode } from "../../config/generateRandomCode";
import { CustomContext } from "../../context/providers/CustomProvider";

function BundleList({ setSelectedBundle, selectedBundle }) {
  const { customDispatch } = useContext(CustomContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bundleType, setBundleType] = useState("");

  const bundles = useQuery({
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
  });

  const handleChange = (e) => {
    setBundleType(e.target.value);
    const bundle = bundles?.data?.find(
      (bundle) => bundle?.plan_id === e.target.value
    );
    setSelectedBundle(bundle);
  };

  const handleProceed = () => {
    setSearchParams((params) => {
      params.set("kyTNM", generateRandomCode(150));
      params.set("plan_id", selectedBundle?.plan_id);
      params.set("plan_name", selectedBundle?.plan_name);
      params.set("plan_volume", selectedBundle?.volume);
      params.set("plan_price", selectedBundle?.price);
      params.set("amount", selectedBundle?.price);
      params.delete("show_list");
      return params;
    });
  };

  const handleClose = () => {
    Swal.fire({
      title: "Processing",
      text: `Do you wish to cancel your transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        customDispatch({
          type: "set_Airtime_Bundle_Amount",
          payload: 0,
        });

        setSearchParams((params) => {
          params.delete("show_list");
          return params;
        });
        navigate(
          "/airtime?link=6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
        );
      }
    });
  };

  return (
    <Dialog
      open={Boolean(searchParams?.get("show_list"))}
      maxWidth="md"
      fullWidth
    >
      <CustomDialogTitle
        title={`${state?.bundleInfo?.provider} Data Bundle`}
        subtitle="Select your preferred bundle"
        onClose={handleClose}
      />
      <DialogContent>
        {bundles.isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "30svh",
            }}
          >
            <CircularProgress />
          </div>
        ) : bundles?.isError ? (
          <Stack>
            <Typography textAlign="center">
              An unknown error has occurred!
            </Typography>
          </Stack>
        ) : (
          <RadioGroup value={bundleType} onChange={handleChange}>
            <Box style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {bundles.data?.map((bundle) => {
                return (
                  <Tooltip
                    key={bundle?.plan_id}
                    title={
                      <Stack>
                        <small>{bundle?.category}</small>
                        <small>{bundle?.plan_name}</small>
                        <small>{bundle?.type}</small>
                        <small>{bundle?.volume}</small>
                        <small> {currencyFormatter(bundle?.price)}</small>
                        <small>
                          {" "}
                          {isNaN(bundle?.validity)
                            ? bundle?.validity
                            : `${bundle?.validity} days`}
                        </small>
                      </Stack>
                    }
                    placement="bottom"
                  >
                    <FormControlLabel
                      control={<Radio />}
                      label={
                        <Stack>
                          {/* <small> {bundle?.category}</small> */}
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            textTransform="capitalize"
                          >
                            {bundle?.plan_name}
                          </Typography>
                          <Typography variant="caption" color="primary">
                            {bundle?.volume}
                          </Typography>
                          <Typography variant="caption">
                            {currencyFormatter(bundle?.price)}
                          </Typography>
                          <small>
                            {" "}
                            {isNaN(bundle?.validity)
                              ? bundle?.validity
                              : `${bundle?.validity} days`}
                          </small>
                        </Stack>
                      }
                      value={bundle?.plan_id}
                      sx={{
                        flex: { xs: 1, md: 0.5 },
                        border: "1px solid lightgray",
                        borderRadius: 1,
                        p: 1,
                        bgcolor:
                          bundleType === bundle?.plan_id
                            ? "secondary.main"
                            : "white",
                        color:
                          bundleType === bundle?.plan_id
                            ? "white"
                            : "secondary.main",
                        "&:hover": {
                          bgcolor: "whitesmoke",
                        },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </RadioGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          disabled={bundleType === ""}
          onClick={handleProceed}
        >
          Proceed
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default BundleList;
