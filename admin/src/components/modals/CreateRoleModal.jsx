import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  MenuItem,
  Checkbox,
  ListItemText,
  ListSubheader,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createRole, getPermissions } from "../../api/roleAPI";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../alert/alertType";

import DialogContainer from "../../components/dialogs/DialogContainer";

// Static Category configuration list
const CATEGORIES = ["Administrator", "Employee"];

// Schema: Flags the name as a reserved name if it matches any category
const schema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .test(
      "is-not-category",
      "This is a reserved category name and cannot be used as a role name",
      (value) =>
        !value ||
        !CATEGORIES.map((c) => c.toLowerCase()).includes(
          value.trim().toLowerCase()
        )
    ),
  category: yup.string().required("Category is required"),
  description: yup.string().nullable(),
  permissionIds: yup.array().of(yup.string()),
});

const CreateRoleModal = ({ open, onClose }) => {
  const { customDispatch } = useCustomContext();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allPermissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      permissionIds: [],
    },
  });

  const selectedPermissionIds = watch("permissionIds") || [];

  const mutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      customDispatch(globalAlertType("success", "Role created"));
      onClose();
      reset();
      setSearchQuery("");
    },
    onError: (error) => {
      customDispatch(
        globalAlertType("error", error.message || "Creation failed")
      );
    },
  });

  const filteredPermissions = useMemo(() => {
    return allPermissions.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPermissions, searchQuery]);

  const groupedPermissions = useMemo(() => {
    const groups = {};
    filteredPermissions.forEach((p) => {
      const resource = p.resource || "General";
      if (!groups[resource]) groups[resource] = [];
      groups[resource].push(p);
    });
    return groups;
  }, [filteredPermissions]);

  const isAllFilteredSelected = useMemo(() => {
    if (filteredPermissions.length === 0) return false;
    return filteredPermissions.every((p) =>
      selectedPermissionIds.includes(p.id)
    );
  }, [filteredPermissions, selectedPermissionIds]);

  const isFilteredSomeSelected = useMemo(() => {
    if (filteredPermissions.length === 0) return false;
    const count = filteredPermissions.filter((p) =>
      selectedPermissionIds.includes(p.id)
    ).length;
    return count > 0 && count < filteredPermissions.length;
  }, [filteredPermissions, selectedPermissionIds]);

  const handleSelectAllToggle = (e) => {
    e.stopPropagation();
    const filteredIds = filteredPermissions.map((p) => p.id);

    if (isAllFilteredSelected) {
      const remainingIds = selectedPermissionIds.filter(
        (id) => !filteredIds.includes(id)
      );
      setValue("permissionIds", remainingIds);
    } else {
      const uniqueMergedIds = Array.from(
        new Set([...selectedPermissionIds, ...filteredIds])
      );
      setValue("permissionIds", uniqueMergedIds);
    }
  };

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const handleModalClose = () => {
    onClose();
    reset();
    setSearchQuery("");
  };

  return (
    <DialogContainer
      open={open}
      onClose={handleModalClose}
      title="Create New Role"
      subtitle="Define a new role and assign permissions"
      onConfirm={handleSubmit(onSubmit)}
      loading={mutation.isPending}
      confirmText="Create"
      maxWidth="sm"
    >
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Role Name"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            margin="normal"
          />
        )}
      />

      <Controller
        name="category"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            label="Category"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            margin="normal"
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
        )}
      />

      <Controller
        name="permissionIds"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Permissions"
            fullWidth
            margin="normal"
            SelectProps={{
              multiple: true,
              renderValue: (selectedIds) =>
                allPermissions
                  .filter((p) => selectedIds.includes(p.id))
                  .map((p) => p.name)
                  .join(", "),
              MenuProps: {
                autoFocus: false,
                PaperProps: { style: { maxHeight: 450 } },
              },
            }}
          >
            <ListSubheader
              disableSticky
              style={{ backgroundColor: "#fff", zIndex: 1 }}
            >
              <TextField
                size="small"
                autoFocus
                placeholder="Search permissions..."
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Escape") {
                    e.stopPropagation();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon size="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery("");
                        }}
                        edge="end"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                style={{ padding: "4px 0px" }}
              />
            </ListSubheader>

            {filteredPermissions.length > 0 && (
              <div
                onClick={handleSelectAllToggle}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 16px",
                  cursor: "pointer",
                  fontWeight: 600,
                  backgroundColor: "#f5f5f5",
                  userSelect: "none",
                }}
              >
                <Checkbox
                  checked={isAllFilteredSelected}
                  indeterminate={isFilteredSomeSelected}
                  style={{ paddingLeft: 0, paddingRight: 11 }}
                />
                <ListItemText
                  primary={
                    isAllFilteredSelected
                      ? "Deselect All Filtered"
                      : "Select All Filtered"
                  }
                />
              </div>
            )}

            {filteredPermissions.length === 0 && (
              <MenuItem disabled>
                <ListItemText primary="No permissions found" />
              </MenuItem>
            )}

            {Object.keys(groupedPermissions).map((resourceName) => [
              <ListSubheader
                key={`header-${resourceName}`}
                color="primary"
                style={{ fontWeight: "bold", lineHeight: "36px" }}
              >
                {resourceName.toUpperCase()}
              </ListSubheader>,
              ...groupedPermissions[resourceName].map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  <Checkbox checked={field.value.indexOf(p.id) > -1} />
                  <ListItemText primary={p.description} />
                </MenuItem>
              )),
            ])}
          </TextField>
        )}
      />
    </DialogContainer>
  );
};

export default CreateRoleModal;

// import { useState, useMemo } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   MenuItem,
//   Checkbox,
//   ListItemText,
//   ListSubheader,
//   InputAdornment,
//   IconButton,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import ClearIcon from "@mui/icons-material/Clear";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { createRole, getPermissions } from "../../api/roleAPI";
// import { useCustomContext } from "../../context/providers/CustomProvider";
// import { globalAlertType } from "../alert/alertType";
// import { LoadingButton } from "@mui/lab";

// // Static Category configuration list
// const CATEGORIES = [
//   "Administrator",
//   "Employee",
//   // "Agent",
//   // "Verifier",
//   // "System User",
// ];

// // 1. UPDATED SCHEMA: Flags the name as a reserved name if it matches any category
// const schema = yup.object({
//   name: yup
//     .string()
//     .required("Name is required")
//     .test(
//       "is-not-category",
//       "This is a reserved category name and cannot be used as a role name",
//       (value) =>
//         !value ||
//         !CATEGORIES.map((c) => c.toLowerCase()).includes(
//           value.trim().toLowerCase(),
//         ),
//     ),
//   category: yup.string().required("Category is required"),
//   description: yup.string().nullable(),
//   permissionIds: yup.array().of(yup.string()),
// });

// const CreateRoleModal = ({ open, onClose }) => {
//   const { customDispatch } = useCustomContext();
//   const [searchQuery, setSearchQuery] = useState("");

//   const { data: allPermissions = [] } = useQuery({
//     queryKey: ["permissions"],
//     queryFn: getPermissions,
//   });

//   const { control, handleSubmit, reset, setValue, watch } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       name: "",
//       category: "",
//       description: "",
//       permissionIds: [],
//     },
//   });

//   const selectedPermissionIds = watch("permissionIds") || [];

//   const mutation = useMutation({
//     mutationFn: createRole,
//     onSuccess: () => {
//       customDispatch(globalAlertType("success", "Role created"));
//       onClose();
//       reset();
//       setSearchQuery("");
//     },
//     onError: (error) => {
//       customDispatch(
//         globalAlertType("error", error.message || "Creation failed"),
//       );
//     },
//   });

//   const filteredPermissions = useMemo(() => {
//     return allPermissions.filter((p) =>
//       p.name.toLowerCase().includes(searchQuery.toLowerCase()),
//     );
//   }, [allPermissions, searchQuery]);

//   const groupedPermissions = useMemo(() => {
//     const groups = {};
//     filteredPermissions.forEach((p) => {
//       const resource = p.resource || "General";
//       if (!groups[resource]) groups[resource] = [];
//       groups[resource].push(p);
//     });
//     return groups;
//   }, [filteredPermissions]);

//   // 2. COUNTER LOGIC: Calculates how many selected items belong to each specific resource group
//   // const groupSelectionCounts = useMemo(() => {
//   //   const counts = {};
//   //   allPermissions.forEach((p) => {
//   //     const resource = p.resource || "General";
//   //     if (!counts[resource]) counts[resource] = 0;
//   //     if (selectedPermissionIds.includes(p.id)) {
//   //       counts[resource] += 1;
//   //     }
//   //   });
//   //   return counts;
//   // }, [allPermissions, selectedPermissionIds]);

//   const isAllFilteredSelected = useMemo(() => {
//     if (filteredPermissions.length === 0) return false;
//     return filteredPermissions.every((p) =>
//       selectedPermissionIds.includes(p.id),
//     );
//   }, [filteredPermissions, selectedPermissionIds]);

//   const isFilteredSomeSelected = useMemo(() => {
//     if (filteredPermissions.length === 0) return false;
//     const count = filteredPermissions.filter((p) =>
//       selectedPermissionIds.includes(p.id),
//     ).length;
//     return count > 0 && count < filteredPermissions.length;
//   }, [filteredPermissions, selectedPermissionIds]);

//   const handleSelectAllToggle = (e) => {
//     e.stopPropagation();
//     const filteredIds = filteredPermissions.map((p) => p.id);

//     if (isAllFilteredSelected) {
//       const remainingIds = selectedPermissionIds.filter(
//         (id) => !filteredIds.includes(id),
//       );
//       setValue("permissionIds", remainingIds);
//     } else {
//       const uniqueMergedIds = Array.from(
//         new Set([...selectedPermissionIds, ...filteredIds]),
//       );
//       setValue("permissionIds", uniqueMergedIds);
//     }
//   };

//   const onSubmit = (data) => {
//     mutation.mutate(data);
//   };

//   const handleModalClose = () => {
//     onClose();
//     reset();
//     setSearchQuery("");
//   };

//   return (
//     <Dialog open={open} onClose={handleModalClose} maxWidth="sm" fullWidth>
//       <DialogTitle>Create New Role</DialogTitle>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <DialogContent>
//           <Controller
//             name="name"
//             control={control}
//             render={({ field, fieldState }) => (
//               <TextField
//                 {...field}
//                 label="Role Name"
//                 fullWidth
//                 error={!!fieldState.error}
//                 helperText={fieldState.error?.message}
//                 margin="normal"
//               />
//             )}
//           />

//           <Controller
//             name="category"
//             control={control}
//             render={({ field, fieldState }) => (
//               <TextField
//                 {...field}
//                 select
//                 label="Category"
//                 fullWidth
//                 error={!!fieldState.error}
//                 helperText={fieldState.error?.message}
//                 margin="normal"
//               >
//                 {CATEGORIES.map((cat) => (
//                   <MenuItem key={cat} value={cat}>
//                     {cat}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             )}
//           />

//           <Controller
//             name="description"
//             control={control}
//             render={({ field }) => (
//               <TextField
//                 {...field}
//                 label="Description"
//                 fullWidth
//                 multiline
//                 rows={2}
//                 margin="normal"
//               />
//             )}
//           />

//           <Controller
//             name="permissionIds"
//             control={control}
//             render={({ field }) => (
//               <TextField
//                 {...field}
//                 select
//                 label="Permissions"
//                 fullWidth
//                 margin="normal"
//                 SelectProps={{
//                   multiple: true,
//                   renderValue: (selectedIds) =>
//                     allPermissions
//                       .filter((p) => selectedIds.includes(p.id))
//                       .map((p) => p.name)
//                       .join(", "),
//                   MenuProps: {
//                     autoFocus: false,
//                     PaperProps: { style: { maxHeight: 450 } },
//                   },
//                 }}
//               >
//                 <ListSubheader
//                   disableSticky
//                   style={{ backgroundColor: "#fff", zIndex: 1 }}
//                 >
//                   <TextField
//                     size="small"
//                     autoFocus
//                     placeholder="Search permissions..."
//                     fullWidth
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key !== "Escape") {
//                         e.stopPropagation();
//                       }
//                     }}
//                     onClick={(e) => e.stopPropagation()}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <SearchIcon size="small" />
//                         </InputAdornment>
//                       ),
//                       // 3. CLEAR BUTTON OPTIMIZATION: Renders dynamic cross button if input string has content
//                       endAdornment: searchQuery && (
//                         <InputAdornment position="end">
//                           <IconButton
//                             size="small"
//                             onClick={(e) => {
//                               e.stopPropagation(); // Prevents menu closure
//                               setSearchQuery("");
//                             }}
//                             edge="end"
//                           >
//                             <ClearIcon fontSize="small" />
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                     style={{ padding: "4px 0px" }}
//                   />
//                 </ListSubheader>

//                 {filteredPermissions.length > 0 && (
//                   <div
//                     onClick={handleSelectAllToggle}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       padding: "6px 16px",
//                       cursor: "pointer",
//                       fontWeight: 600,
//                       backgroundColor: "#f5f5f5",
//                       userSelect: "none",
//                     }}
//                   >
//                     <Checkbox
//                       checked={isAllFilteredSelected}
//                       indeterminate={isFilteredSomeSelected}
//                       style={{ paddingLeft: 0, paddingRight: 11 }}
//                     />
//                     <ListItemText
//                       primary={
//                         isAllFilteredSelected
//                           ? "Deselect All Filtered"
//                           : "Select All Filtered"
//                       }
//                     />
//                   </div>
//                 )}

//                 {filteredPermissions.length === 0 && (
//                   <MenuItem disabled>
//                     <ListItemText primary="No permissions found" />
//                   </MenuItem>
//                 )}

//                 {Object.keys(groupedPermissions).map((resourceName) => [
//                   <ListSubheader
//                     key={`header-${resourceName}`}
//                     color="primary"
//                     style={{ fontWeight: "bold", lineHeight: "36px" }}
//                   >
//                     {resourceName.toUpperCase()}
//                   </ListSubheader>,

//                   ...groupedPermissions[resourceName].map((p) => (
//                     <MenuItem key={p.id} value={p.id}>
//                       <Checkbox checked={field.value.indexOf(p.id) > -1} />
//                       <ListItemText primary={p.description} />
//                     </MenuItem>
//                   )),
//                 ])}
//               </TextField>
//             )}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleModalClose}>Cancel</Button>
//           <LoadingButton
//             type="submit"
//             variant="contained"
//             loading={mutation.isPending}
//           >
//             Create
//           </LoadingButton>
//         </DialogActions>
//       </form>
//     </Dialog>
//   );
// };
// export default CreateRoleModal;
