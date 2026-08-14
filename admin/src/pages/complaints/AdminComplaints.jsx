import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Stack,
} from "@mui/material";
import { Refresh, Visibility, AccessTime } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getComplaints } from "../../api/complaintAPI";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import CustomTitle from "@/components/custom/CustomTitle";
import CustomizedMaterialTable from "@/components/tables/CustomizedMaterialTable";
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

const AdminComplaints = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = user?.permissions || [];

  // Map backend permissions to available client-side options
  const permissionToServiceMap = {
    "Manage Airtime Transfer Complaints": {
      value: "airtime",
      label: "Airtime Transfer",
    },
    "Manage Data Bundle Complaints": { value: "bundle", label: "Data Bundle" }, // Double space kept
    "Manage Prepaid Complaints": { value: "prepaid", label: "Prepaid" },
    "Manage Vouchers & Tickets Complaints": {
      value: "voucher",
      label: "Vouchers / Tickets",
    },
  };
  // Filter options down to only what the user is authorized to see
  const authorizedOptions = Object.entries(permissionToServiceMap)
    .filter(([permission]) => permissions.includes(permission))
    .map(([_, option]) => option);

  const [filters, setFilters] = useState({
    status: "",
    service_type: "",
    search: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Build query params
  const queryParams = {
    status: filters.status || undefined,
    service_type: filters.service_type || undefined,
    search: filters.search || undefined,
    page: page + 1,
    limit: rowsPerPage,
  };

  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] === undefined) delete queryParams[key];
  });

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-complaints", queryParams],
    queryFn: () => getComplaints(queryParams),
    keepPreviousData: true,
  });

  const complaints = response?.data || [];
  const pagination = response?.pagination || { total: 0, page: 1, limit: 10 };

  const handleView = (id) => {
    navigate(`/help-and-support/${id}`);
  };

  const handleRefresh = () => refetch();


  const handleClearFilters = () => {
    setFilters({ status: "", service_type: "", search: "" });
    setPage(0);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSearchChange = (value) => {
    handleFilterChange("search", value);
  };

  // const clearSearch = () => {
  //   handleFilterChange("search", "");
  // };
  // Define table columns
  const columns = [
    {
      title: "ID",
      field: "id",
      render: (rowData) => (
        <Typography variant="caption" fontWeight="medium">
          #{rowData.id.slice(0, 8)}
        </Typography>
      ),
    },
    {
      title: "Service",
      field: "service_type",
      render: (rowData) => (
        <Chip
          label={serviceLabels[rowData.service_type] || rowData.service_type}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      title: "Transaction ID",
      field: "transaction_id",
    },
    {
      title: "Meter No",
      field: "meter_no",
      render: (rowData) => rowData.meter_no || "—",
    },
    {
      title: "Phone",
      field: "phonenumber",
      render: (rowData) => rowData.phonenumber || "—",
    },
    {
      title: "Payment Mode",
      field: "payment_mode",
      render: (rowData) => (
        <Chip
          label={rowData.payment_mode === "wallet" ? "Wallet" : "Mobile Money"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      title: "Status",
      field: "status",
      render: (rowData) => (
        <Chip
          label={statusLabels[rowData.status] || rowData.status}
          size="small"
          color={statusColors[rowData.status] || "default"}
          sx={{ color: "#fff" }}
        />
      ),
    },
    {
      title: "Date",
      field: "created_at",
      render: (rowData) => moment(rowData.created_at).format("DD/MM/YYYY"),
    },
    {
      title: "Actions",
      field: "actions",
      render: (rowData) => (
        <Tooltip title="View Details">
          <IconButton onClick={() => handleView(rowData.id)} size="small">
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
        refresh={
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        }
      />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Filters and Search */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2">Table Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Status"
                size="small"
                fullWidth
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="unresolved">Unresolved</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Service Type"
                size="small"
                fullWidth
                value={filters.service_type}
                onChange={(e) =>
                  handleFilterChange("service_type", e.target.value)
                }
                disabled={authorizedOptions.length === 0} // Disables field if user has no options
              >
                <MenuItem value="">All</MenuItem>
                {authorizedOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  fullWidth
                >
                  Clear
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <CustomizedMaterialTable
          isLoading={isLoading}
          columns={columns}
          data={complaints}
          title="Complaints"
          onRefresh={handleRefresh}
          showExportButton={true}
          search={true} // search is handled externally
          onSearchChange={handleSearchChange}
          options={{
            exportFileName: "complaints",
            pageSize: rowsPerPage,
            page: page,

            totalCount: pagination.total,
          }}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          }}
          emptyMessage="No complaints found matching your filters."
          style={{ marginTop: 0 }}
        />
      </Container>
    </>
  );
};

export default AdminComplaints;
