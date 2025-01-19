import { Typography, Box } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useSearchParams } from "react-router-dom";
import ToggleModule from "./ToggleModule";
import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getModuleStatus, postModuleStatus } from "../../api/categoryAPI";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";
import { AuthContext } from "../../context/providers/AuthProvider";

function Module() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [checked, setChecked] = useState({
    voucher: true,
    prepaid: true,
    airtime: true,
  });

  useQuery({
    queryKey: ["module-status"],
    queryFn: () => getModuleStatus(),
    initialData: [{ active: true }, { active: true }, { active: true }],
    onSuccess: (data) => {
      setChecked({
        voucher: Boolean(data[0]?.active),
        prepaid: Boolean(data[1]?.active),
        airtime: Boolean(data[2]?.active),
      });
    },
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postModuleStatus,
  });
  const handleOpenModule = (e, mode) => {
    const module =
      mode === "v"
        ? "Vouchers & Tickets"
        : mode === "p"
        ? "Prepaid Units"
        : mode === "a"
        ? "Airtime & Data Bundle"
        : "";

    if (e.target.checked === true) {
      const data = {
        title: mode,
        message: "",
        active: true,
      };

      Swal.fire({
        title: module,
        text: `Do you wish to activate ${module} module?`,
        showCancelButton: true,
      }).then(({ isConfirmed }) => {
        if (isConfirmed) {
          mutateAsync(data, {
            onSettled: () => {
              queryClient.invalidateQueries(["module-status"]);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType("info", data));
            },
            onError: (errorFF) => {
              customDispatch(globalAlertType("error", errorFF));
            },
          });
        }
      });

      return;
    }

    setSearchParams((params) => {
      params.set("toggle_module", true);
      params.set("mode", mode);
      return params;
    });
  };

  return (
    <Box
      sx={{
        margin: "auto",
        mt: 4,
        p: 3,
        bgcolor: "#fff",
      }}
    >
      <Typography variant="h4">Module Management</Typography>
      <Typography variant="body2">
        Empower Your Website&apos;s Functionality.Control who can view and
        access the various modules and categories in your website.
      </Typography>

      <Box sx={{ pt: 5 }}>
        <Accordion
          defaultExpanded
          sx={{
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ fontSize: 18, fontWeight: "700", bgcolor: "#ccc" }}
          >
            Vouchers & Tickets
          </AccordionSummary>
          <AccordionDetails>
            Designed to facilitate the management and distribution of vouchers
            and tickets for various purposes. Whether it&apos;s promotional
            vouchers, event tickets, this module offers a seamless solution for
            handling transactions and redeeming offers.
          </AccordionDetails>
          {user?.permissions?.includes("Manage Modules") && (
            <AccordionActions>
              <FormControlLabel
                control={<Switch color="secondary" />}
                label={checked.voucher ? "DEACTIVATE" : "ACTIVATE"}
                name="voucher"
                checked={checked.voucher}
                value={checked.voucher}
                onChange={(e) => handleOpenModule(e, "v")}
              />
            </AccordionActions>
          )}
        </Accordion>
        <Accordion
          defaultExpanded
          sx={{
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
            sx={{ fontSize: 18, fontWeight: "700", bgcolor: "#ccc" }}
          >
            Prepaid Units
          </AccordionSummary>
          <AccordionDetails>
            Through this module, customers can top up their electricity units
            online, eliminating the need for physical visits to payment centers
            or manual meter readings.
          </AccordionDetails>
          {user?.permissions?.includes("Manage Modules") && (
            <AccordionActions>
              <FormControlLabel
                control={<Switch color="secondary" />}
                label={checked.prepaid ? "DEACTIVATE" : "ACTIVATE"}
                name="prepaid"
                checked={checked.prepaid}
                value={checked.prepaid}
                onChange={(e) => handleOpenModule(e, "p")}
              />
            </AccordionActions>
          )}
        </Accordion>
        <Accordion
          defaultExpanded
          sx={{
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3-content"
            id="panel3-header"
            sx={{ fontSize: 18, fontWeight: "700", bgcolor: "#ccc" }}
          >
            Airtime & Bundle
          </AccordionSummary>
          <AccordionDetails>
            With this feature, visitors can easily top up their prepaid mobile
            phone accounts or buy data bundles directly from your platform.
          </AccordionDetails>

          {user?.permissions?.includes("Manage Modules") && (
            <AccordionActions>
              <FormControlLabel
                control={<Switch color="secondary" />}
                label={checked.airtime ? "DEACTIVATE" : "ACTIVATE"}
                name="airtime"
                checked={checked.airtime}
                value={checked.airtime}
                onChange={(e) => handleOpenModule(e, "a")}
              />
            </AccordionActions>
          )}
        </Accordion>
      </Box>
      <ToggleModule />
      {isLoading && <GlobalSpinner />}
    </Box>
  );
}

export default Module;
