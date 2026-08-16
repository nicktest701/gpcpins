import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Stack,
} from "@mui/material";
import { Visibility, AccessTime } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import CustomTitle from "@/components/custom/CustomTitle";
import { DataTable } from "@/components/tables/datatable";
import { getComplaints } from "../../api/complaintAPI";
import { useAuth } from "@/context/providers/AuthProvider";

const statusColors = {
  pending: "warning",
  open: "info",
  resolved: "success",
  unresolved: "error",
};

const statusLabels = {
  pending: "Pending",
  open: "Open",
  resolved: "Resolved",
  unresolved: "Unresolved",
};

const serviceLabels = {
  prepaid: "Prepaid",
  airtime: "Airtime Transfer",
  bundle: "Data Bundle",
  voucher: "Vouchers / Tickets",
};

const STATUS_OPTIONS = Object.keys(statusLabels);

const permissionToServiceMap = {
  "Manage Airtime Transfer Complaints": { value: "airtime", label: "Airtime Transfer" },
  "Manage Data Bundle Complaints": { value: "bundle", label: "Data Bundle" },
  "Manage Prepaid Complaints": { value: "prepaid", label: "Prepaid" },
  "Manage Vouchers & Tickets Complaints": { value: "voucher", label: "Vouchers / Tickets" },
};

const AdminComplaints = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = user?.permissions || [];

  const authorizedOptions = useMemo(
    () =>
      Object.entries(permissionToServiceMap)
        .filter(([permission]) => permissions.includes(permission))
        .map(([, option]) => option),
    [permissions],
  );

  const [filters, setFilters] = useState({ status: "", service_type: "", search: "" });
  // 1-indexed, matching DataTable's public API and the logs page convention.
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const queryParams = useMemo(() => {
    const params = {
      status: filters.status || undefined,
      service_type: filters.service_type || undefined,
      search: filters.search || undefined,
      page,
      limit: rowsPerPage,
    };
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) delete params[key];
    });
    return params;
  }, [filters, page, rowsPerPage]);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-complaints", queryParams],
    queryFn: () => getComplaints(queryParams),
    keepPreviousData: true,
  });

  const complaints = response?.data ?? [];
  const totalCount = response?.pagination?.total ?? 0;

  const handleView = (id) => navigate(`/help-and-support/${id}`);

  const activeFilterCount = ["status", "service_type", "search"].filter(
    (key) => filters[key],
  ).length;

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ status: "", service_type: "", search: "" });
    setPage(1);
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      sortable: false,
      renderCell: (row) => (
        <Typography variant="caption" fontWeight="medium">
          #{row.id.slice(0, 8)}
        </Typography>
      ),
    },
    {
      field: "service_type",
      headerName: "Service",
      sortable: false,
      renderCell: (row) => (
        <Chip
          label={serviceLabels[row.service_type] || row.service_type}
          size="small"
          variant="outlined"
        />
      ),
    },
    { field: "transaction_id", headerName: "Transaction ID", sortable: false },
    {
      field: "meter_no",
      headerName: "Meter No",
      sortable: false,
      renderCell: (row) => row.meter_no || "—",
    },
    {
      field: "phonenumber",
      headerName: "Phone",
      sortable: false,
      renderCell: (row) => row.phonenumber || "—",
    },
    {
      field: "payment_mode",
      headerName: "Payment Mode",
      sortable: false,
      renderCell: (row) => (
        <Chip
          label={row.payment_mode === "wallet" ? "Wallet" : "Mobile Money"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: (row) => (
        <Chip
          label={statusLabels[row.status] || row.status}
          size="small"
          color={statusColors[row.status] || "default"}
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Date",
      sortable: false,
      renderCell: (row) => moment(row.created_at).format("DD/MM/YYYY"),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      hideable: false,
      align: "right",
      renderCell: (row) => (
        <Tooltip title="View details">
          <IconButton onClick={() => handleView(row.id)} size="small">
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <CustomTitle
        title="Complaints Management"
        subtitle="Monitor and resolve customer complaints from a single dashboard"
        icon={<AccessTime sx={{ width: 50, height: 50 }} color="primary" />}
      />

      <Box sx={{ maxWidth: "xl", mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        {/* ------------------------------------------------------------ Filter bar */}
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: "background.paper" }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              flexWrap="wrap"
            >
              {/* Status as color-coded toggle pills — reuses the exact
                  colors from the row-level status chips, so filtering and
                  reading the table share one visual language. */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label="All statuses"
                  size="small"
                  variant={filters.status ? "outlined" : "filled"}
                  color={filters.status ? "default" : "primary"}
                  onClick={() => setFilter("status", "")}
                  clickable
                />
                {STATUS_OPTIONS.map((status) => {
                  const active = filters.status === status;
                  return (
                    <Chip
                      key={status}
                      label={statusLabels[status]}
                      size="small"
                      clickable
                      variant={active ? "filled" : "outlined"}
                      color={statusColors[status]}
                      onClick={() => setFilter("status", active ? "" : status)}
                    />
                  );
                })}
              </Stack>

              <Box sx={{ flex: 1 }} />

              <Tooltip
                title={
                  authorizedOptions.length === 0
                    ? "You don't have permission to filter by service type"
                    : ""
                }
              >
                <TextField
                  select
                  label="Service type"
                  size="small"
                  value={filters.service_type}
                  onChange={(e) => setFilter("service_type", e.target.value)}
                  disabled={authorizedOptions.length === 0}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">All services</MenuItem>
                  {authorizedOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Tooltip>
            </Stack>

            {activeFilterCount > 0 && (
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="caption" color="text.secondary">
                  Active filters:
                </Typography>
                {filters.status && (
                  <Chip
                    size="small"
                    label={`Status: ${statusLabels[filters.status]}`}
                    onDelete={() => setFilter("status", "")}
                  />
                )}
                {filters.service_type && (
                  <Chip
                    size="small"
                    label={`Service: ${serviceLabels[filters.service_type]}`}
                    onDelete={() => setFilter("service_type", "")}
                  />
                )}
                {filters.search && (
                  <Chip
                    size="small"
                    label={`Search: "${filters.search}"`}
                    onDelete={() => setFilter("search", "")}
                  />
                )}
                <Button size="small" onClick={handleClearFilters}>
                  Clear all
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* ------------------------------------------------------------ Table */}
        <DataTable
          mode="server"
          title="Complaints"
          columns={columns}
          data={complaints}
          getRowId={(row) => row.id}
          loading={isLoading}
          fetching={isFetching}
          error={isError ? { message: "Couldn't load complaints." } : null}
          onRetry={refetch}
          onRefresh={refetch}
          searchable
          searchPlaceholder="Search complaints…"
          onSearchChange={(value) => setFilter("search", value)}
          exportable
          exportFileName="complaints"
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={setPage}
          onRowsPerPageChange={(newLimit) => {
            setRowsPerPage(newLimit);
            setPage(1);
          }}
          emptyState={{
            title: "No complaints found",
            description: "Try a different status, service type, or search term.",
          }}
        />
      </Box>
    </>
  );
};

export default AdminComplaints;



// import { useState } from "react";
// import {
//   Container,
//   Paper,
//   Typography,
//   TextField,
//   MenuItem,
//   Grid,
//   Chip,
//   IconButton,
//   Tooltip,
//   Button,
//   Stack,
// } from "@mui/material";
// import { Refresh, Visibility, AccessTime } from "@mui/icons-material";
// import { useQuery } from "@tanstack/react-query";
// import { getComplaints } from "../../api/complaintAPI";
// import { useNavigate } from "react-router-dom";
// import moment from "moment";
// import CustomTitle from "@/components/custom/CustomTitle";
// import CustomizedMaterialTable from "@/components/tables/CustomizedMaterialTable";
// import { useAuth } from "@/context/providers/AuthProvider";

// const statusColors = {
//   pending: "warning",
//   open: "info",
//   resolved: "success",
//   unresolved: "error",
// };

// const statusLabels = {
//   pending: "Pending",
//   open: "Open",
//   resolved: "Resolved",
//   unresolved: "Unresolved",
// };

// const serviceLabels = {
//   prepaid: "Prepaid",
//   airtime: "Airtime Transfer",
//   bundle: "Data Bundle",
//   voucher: "Vouchers / Tickets",
// };

// const AdminComplaints = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const permissions = user?.permissions || [];

//   // Map backend permissions to available client-side options
//   const permissionToServiceMap = {
//     "Manage Airtime Transfer Complaints": {
//       value: "airtime",
//       label: "Airtime Transfer",
//     },
//     "Manage Data Bundle Complaints": { value: "bundle", label: "Data Bundle" }, // Double space kept
//     "Manage Prepaid Complaints": { value: "prepaid", label: "Prepaid" },
//     "Manage Vouchers & Tickets Complaints": {
//       value: "voucher",
//       label: "Vouchers / Tickets",
//     },
//   };
//   // Filter options down to only what the user is authorized to see
//   const authorizedOptions = Object.entries(permissionToServiceMap)
//     .filter(([permission]) => permissions.includes(permission))
//     .map(([_, option]) => option);

//   const [filters, setFilters] = useState({
//     status: "",
//     service_type: "",
//     search: "",
//   });
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   // Build query params
//   const queryParams = {
//     status: filters.status || undefined,
//     service_type: filters.service_type || undefined,
//     search: filters.search || undefined,
//     page: page + 1,
//     limit: rowsPerPage,
//   };

//   Object.keys(queryParams).forEach((key) => {
//     if (queryParams[key] === undefined) delete queryParams[key];
//   });

//   const {
//     data: response,
//     isLoading,
//     isError,
//     refetch,
//   } = useQuery({
//     queryKey: ["admin-complaints", queryParams],
//     queryFn: () => getComplaints(queryParams),
//     keepPreviousData: true,
//   });

//   const complaints = response?.data || [];
//   const pagination = response?.pagination || { total: 0, page: 1, limit: 10 };

//   const handleView = (id) => {
//     navigate(`/help-and-support/${id}`);
//   };

//   const handleRefresh = () => refetch();


//   const handleClearFilters = () => {
//     setFilters({ status: "", service_type: "", search: "" });
//     setPage(0);
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//     setPage(0);
//   };

//   const handleSearchChange = (value) => {
//     handleFilterChange("search", value);
//   };

//   // const clearSearch = () => {
//   //   handleFilterChange("search", "");
//   // };
//   // Define table columns
//   const columns = [
//     {
//       title: "ID",
//       field: "id",
//       render: (rowData) => (
//         <Typography variant="caption" fontWeight="medium">
//           #{rowData.id.slice(0, 8)}
//         </Typography>
//       ),
//     },
//     {
//       title: "Service",
//       field: "service_type",
//       render: (rowData) => (
//         <Chip
//           label={serviceLabels[rowData.service_type] || rowData.service_type}
//           size="small"
//           variant="outlined"
//         />
//       ),
//     },
//     {
//       title: "Transaction ID",
//       field: "transaction_id",
//     },
//     {
//       title: "Meter No",
//       field: "meter_no",
//       render: (rowData) => rowData.meter_no || "—",
//     },
//     {
//       title: "Phone",
//       field: "phonenumber",
//       render: (rowData) => rowData.phonenumber || "—",
//     },
//     {
//       title: "Payment Mode",
//       field: "payment_mode",
//       render: (rowData) => (
//         <Chip
//           label={rowData.payment_mode === "wallet" ? "Wallet" : "Mobile Money"}
//           size="small"
//           variant="outlined"
//         />
//       ),
//     },
//     {
//       title: "Status",
//       field: "status",
//       render: (rowData) => (
//         <Chip
//           label={statusLabels[rowData.status] || rowData.status}
//           size="small"
//           color={statusColors[rowData.status] || "default"}
//           sx={{ color: "#fff" }}
//         />
//       ),
//     },
//     {
//       title: "Date",
//       field: "created_at",
//       render: (rowData) => moment(rowData.created_at).format("DD/MM/YYYY"),
//     },
//     {
//       title: "Actions",
//       field: "actions",
//       render: (rowData) => (
//         <Tooltip title="View Details">
//           <IconButton onClick={() => handleView(rowData.id)} size="small">
//             <Visibility fontSize="small" />
//           </IconButton>
//         </Tooltip>
//       ),
//     },
//   ];

//   return (
//     <>
//       <CustomTitle
//         title="Complaints Management"
//         subtitle="Monitor and resolve customer complaints from a single dashboard"
//         icon={<AccessTime sx={{ width: 50, height: 50 }} color="primary" />}
//         refresh={
//           <Tooltip title="Refresh">
//             <IconButton onClick={handleRefresh}>
//               <Refresh />
//             </IconButton>
//           </Tooltip>
//         }
//       />

//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         {/* Filters and Search */}
//         <Paper sx={{ p: 2, mb: 3 }}>
//           <Typography variant="body2">Table Filters</Typography>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={12} sm={3}>
//               <TextField
//                 select
//                 label="Status"
//                 size="small"
//                 fullWidth
//                 value={filters.status}
//                 onChange={(e) => handleFilterChange("status", e.target.value)}
//               >
//                 <MenuItem value="">All</MenuItem>
//                 <MenuItem value="pending">Pending</MenuItem>
//                 <MenuItem value="open">Open</MenuItem>
//                 <MenuItem value="resolved">Resolved</MenuItem>
//                 <MenuItem value="unresolved">Unresolved</MenuItem>
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={3}>
//               <TextField
//                 select
//                 label="Service Type"
//                 size="small"
//                 fullWidth
//                 value={filters.service_type}
//                 onChange={(e) =>
//                   handleFilterChange("service_type", e.target.value)
//                 }
//                 disabled={authorizedOptions.length === 0} // Disables field if user has no options
//               >
//                 <MenuItem value="">All</MenuItem>
//                 {authorizedOptions.map((option) => (
//                   <MenuItem key={option.value} value={option.value}>
//                     {option.label}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={2}>
//               <Stack direction="row" spacing={1}>
//                 <Button
//                   variant="outlined"
//                   onClick={handleClearFilters}
//                   fullWidth
//                 >
//                   Clear
//                 </Button>
//               </Stack>
//             </Grid>
//           </Grid>
//         </Paper>

//         {/* Table */}
//         <CustomizedMaterialTable
//           isLoading={isLoading}
//           columns={columns}
//           data={complaints}
//           title="Complaints"
//           onRefresh={handleRefresh}
//           showExportButton={true}
//           search={true} // search is handled externally
//           onSearchChange={handleSearchChange}
//           options={{
//             exportFileName: "complaints",
//             pageSize: rowsPerPage,
//             page: page,

//             totalCount: pagination.total,
//           }}
//           page={page}
//           onPageChange={(newPage) => setPage(newPage)}
//           onRowsPerPageChange={(newRows) => {
//             setRowsPerPage(newRows);
//             setPage(0);
//           }}
//           emptyMessage="No complaints found matching your filters."
//           style={{ marginTop: 0 }}
//         />
//       </Container>
//     </>
//   );
// };

// export default AdminComplaints;
