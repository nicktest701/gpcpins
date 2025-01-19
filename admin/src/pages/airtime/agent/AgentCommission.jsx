import { useState, useContext } from "react";
import { LoadingButton } from "@mui/lab";
import {
  Stack,
  InputAdornment,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ServiceProvider from "../../../components/ServiceProvider";
import CustomTitle from "../../../components/custom/CustomTitle";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAgentCommission, postAgentCommission } from "../../../api/agentAPI";
import { globalAlertType } from "../../../components/alert/alertType";
import { CustomContext } from "../../../context/providers/CustomProvider";
function AgentCommission() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const [provider, setProvider] = useState("");
  const [rate, setRate] = useState(0);
  const [rateErr, setRateErr] = useState("");

  const { data } = useQuery({
    queryKey: ["agent-commission", id],
    queryFn: () => getAgentCommission(id),
    enabled: !!id,
    initialData: [],
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: postAgentCommission,
  });

  const onSubmit = () => {
    if (rate < 0) {
      setRateErr("Rate cannot be less than 0%");
      return;
    }
    const values = {
      agent_id: id,
      provider,
      rate,
    };

    mutate(values, {
      onSettled: () => {
        queryClient.invalidateQueries(["agent-commission", id]);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", "Changes Saved!"));
      },

      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  return (
    <Box sx={{ bgcolor: "#fff", p: 2 }}>
      <CustomTitle
        titleVariant="h4"
        title="Commission"
        subtitle="Manage and calculate commissions or your dedicated agents "
      />

      <List sx={{ border: "1px solid lightgray" }}>
        <ListItem divider>
          <ListItemText primary="Provider" />
        </ListItem>
        {data?.map((commission) => {
          return (
            <ListItem key={commission?._id} divider>
              <ListItemText
                primary={
                  commission?.provider === "Vodafone"
                    ? "Telecel"
                    : commission?.provider
                }
                secondary={`${commission?.rate}%`}
                secondaryTypographyProps={{ color: "secondary.main" }}
              />
            </ListItem>
          );
        })}
      </List>
      <Stack spacing={2} pt={4}>
        <ServiceProvider
          label="Network Type"
          size="small"
          value={provider}
          setValue={setProvider}
        />

        <TextField
          size="small"
          type="number"
          inputMode="numeric"
          placeholder="Rate"
          label="Commission Rate"
          fullWidth
          required
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
          value={rate}
          focused
          onChange={(e) => setRate(e.target.value)}
          error={Boolean(rateErr)}
          helperText={rateErr}
        />
        <LoadingButton
          variant="contained"
          sx={{
            alignSelf: "flex-start",
          }}
          disabled={provider === "" || rate === null}
          loading={isLoading}
          onClick={onSubmit}
        >
          Save Changes
        </LoadingButton>
      </Stack>
    </Box>
  );
}

export default AgentCommission;
