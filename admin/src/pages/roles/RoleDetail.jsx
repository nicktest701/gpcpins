import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Switch,
  CircularProgress,
  Typography,
  Divider,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateRole, getPermissions } from "@/api/roleAPI";
import { useCustomContext } from "@/context/providers/CustomProvider";
import { globalAlertType } from "@/components/alert/alertType";

// Ordered list of resource groups
const GROUP_ORDER = [
  "Vouchers & Tickets",
  "Pins & Serials",
  "WAEC Checkers",
  "University & Polytechnic Forms",
  "Security Service Forms",
  "Cinema Tickets",
  "Stadium Tickets",
  "Bus Tickets",
  "Prepaid Units",
  "Airtime",
  "Agents",
  "Employees",
  "Users",
  "User Wallets",
  "Agent Wallets",
  "Messages",
  "Complaints",
  "Summary",
  "Settings",
];

// O(1) Map for index matching (case-insensitive for safety)
const GROUP_ORDER_MAP = new Map(
  GROUP_ORDER.map((name, index) => [name.toLowerCase().trim(), index])
);

const RoleDetail = ({ open, onClose, role }) => {
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();
  
  const { data: allPermissions = [], isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
    enabled: open,
  });

  const [selectedPerms, setSelectedPerms] = useState(new Set());
  
  // Track open/closed states for individual accordions
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (role?.permissions) {
      setSelectedPerms(new Set(role.permissions.map((p) => p.id)));
    } else {
      setSelectedPerms(new Set());
    }
    // Reset accordions to collapsed when opening a new role
    setExpandedGroups({});
  }, [role, open]);

  // Keep this as an Array so JavaScript preserves the explicit sorting order
  const sortedGroupedPermissions = useMemo(() => {
    const groups = {};
    
    allPermissions.forEach((perm) => {
      const resource = perm.resource || "Other";
      if (!groups[resource]) groups[resource] = [];
      groups[resource].push(perm);
    });

    return Object.entries(groups).sort(([groupA], [groupB]) => {
      const keyA = groupA.toLowerCase().trim();
      const keyB = groupB.toLowerCase().trim();
      
      const indexA = GROUP_ORDER_MAP.has(keyA) ? GROUP_ORDER_MAP.get(keyA) : Infinity;
      const indexB = GROUP_ORDER_MAP.has(keyB) ? GROUP_ORDER_MAP.get(keyB) : Infinity;
      
      return indexA - indexB;
    });
  }, [allPermissions]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRole(id, data),
    onSuccess: () => {
      customDispatch(globalAlertType("success", "Permissions updated"));
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onClose();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error.message || "Update failed"));
    },
  });

  const handleToggle = (permId) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const handleSelectAll = (e, perms, isAllSelected) => {
    e.stopPropagation(); // Prevents accordion from toggling open/close when clicking Select All
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => {
        if (isAllSelected) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      });
      return next;
    });
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [panel]: isExpanded,
    }));
  };

  // Master controller to toggle all accordion states simultaneously
  const handleMasterToggle = (shouldExpand) => {
    const nextState = {};
    if (shouldExpand) {
      sortedGroupedPermissions.forEach(([resource]) => {
        nextState[resource] = true;
      });
    }
    setExpandedGroups(nextState);
  };

  const handleSave = () => {
    if (!role) return;
    updateMutation.mutate({ 
      id: role.id, 
      data: { permissionIds: Array.from(selectedPerms) } 
    });
  };

  if (!role) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="h6" component="div">
            Manage Permissions – <strong>{role.name}</strong>
          </Typography>
          
          {/* Master Toggles near header */}
          {!isLoading && sortedGroupedPermissions.length > 0 && (
            <Box display="flex" gap={1}>
              <Button 
                size="small" 
                variant="text" 
                onClick={() => handleMasterToggle(true)}
              >
                Expand All
              </Button>
              <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
              <Button 
                size="small" 
                variant="text" 
                color="secondary"
                onClick={() => handleMasterToggle(false)}
              >
                Collapse All
              </Button>
            </Box>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ minHeight: 200 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              columnCount: { xs: 1, md: 2 },
              columnGap: 2,
              "& > *": {
                breakInside: "avoid",
                marginBottom: 2,
              },
            }}
          >
            {sortedGroupedPermissions.map(([resource, perms]) => {
              const allSelected = perms.every((p) => selectedPerms.has(p.id));
              const isExpanded = !!expandedGroups[resource];

              return (
                <Accordion
                  key={resource}
                  expanded={isExpanded}
                  onChange={handleAccordionChange(resource)}
                  elevation={0}
                  variant="outlined"
                  sx={{
                    bgcolor: "background.default",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      flexDirection: "row",
                      "& .MuiAccordionSummary-content": {
                        justifyContent: "space-between",
                        alignItems: "center",
                        mr: 1,
                      },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" textTransform='capitalize'>
                      {resource}
                    </Typography>
                    <Button
                      size="small"
                      onClick={(e) => handleSelectAll(e, perms, allSelected)}
                      variant="outlined"
                      color={allSelected ? "secondary" : "primary"}
                      sx={{ py: 0.25,borderRadius:1.2 }}
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 2, pt: 0 }}>
                    <Divider sx={{ mb: 1 }} />
                    <List dense disablePadding>
                      {perms.map((perm) => (
                        <ListItem key={perm.id} disableGutters>
                          <ListItemText
                            primary={perm.description}
                            secondary={`${perm.resource} / ${perm.action}`}
                            primaryTypographyProps={{ variant: "body2" }}
                            secondaryTypographyProps={{ variant: "caption" }}
                          />
                          <Switch
                            edge="end"
                            checked={selectedPerms.has(perm.id)}
                            onChange={() => handleToggle(perm.id)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updateMutation.isPending}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updateMutation.isPending || isLoading}
        >
          {updateMutation.isPending ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleDetail;
