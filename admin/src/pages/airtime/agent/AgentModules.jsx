// src/pages/agents/AgentModules.jsx
import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Switch,
  Box,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAgentModules } from "../../../api/agentAPI";
import { useCustomContext } from "../../../context/providers/CustomProvider";
import { globalAlertType } from "../../../components/alert/alertType";

// All available modules with descriptions
const AVAILABLE_MODULES = [
  { id: "airtime", label: "Airtime Transfer", description: "Send airtime to any mobile network" },
  { id: "bundle", label: "Data Bundle", description: "Purchase and manage data bundles" },
  { id: "prepaid", label: "Prepaid Unit", description: "Buy prepaid electricity units" },
];

const AgentModules = ({ agentId, currentModules = [] }) => {
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();
  const [modules, setModules] = useState(currentModules);

  // Sync when prop changes (e.g., after save)
  useEffect(() => {
    setModules(currentModules);
  }, [currentModules]);

  const mutation = useMutation({
    mutationFn: updateAgentModules,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", "Modules updated successfully"));
      queryClient.invalidateQueries(["agent", agentId]);
      queryClient.invalidateQueries(["agents"]);
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error.message || "Failed to update modules"));
    },
  });

  const handleToggle = (moduleId) => {
    const newModules = modules.includes(moduleId)
      ? modules.filter((m) => m !== moduleId)
      : [...modules, moduleId];
    setModules(newModules);
    // Immediately save changes
    mutation.mutate({ id: agentId, modules: newModules });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 1.2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Manage Agent Modules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select the modules this agent can access. They can manage{' '}
            <strong>one or more</strong> modules.
          </Typography>
          {modules.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Currently enabled modules:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                {modules.map((moduleId) => {
                  const module = AVAILABLE_MODULES.find((m) => m.id === moduleId);
                  return (
                    <Chip
                      key={moduleId}
                      label={module?.label || moduleId}
                      color="primary"
                      size="small"
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>

        <Divider />

        {/* {mutation.isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={32} />
          </Box>
        )} */}

        <List disablePadding>
          {AVAILABLE_MODULES.map((module) => {
            const isChecked = modules.includes(module.id);
            return (
              <ListItem key={module.id} divider sx={{ px: 0 }}>
                <ListItemText
                  primary={module.label}
                  secondary={module.description}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
                <Switch
                  edge="end"
                  checked={isChecked}
                  onChange={() => handleToggle(module.id)}
                  disabled={mutation.isLoading}
                  inputProps={{
                    "aria-label": `Toggle ${module.label}`,
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Stack>
    </Paper>
  );
};

export default AgentModules;