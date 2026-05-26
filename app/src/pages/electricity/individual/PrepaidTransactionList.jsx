import { useState, useMemo } from "react";
import {
  Box,
  List,
  Paper,
  Typography,
  Chip,
  Stack,
  IconButton,
  Skeleton,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Divider,
} from "@mui/material";
import { Search, Clear, Refresh, Visibility, Delete } from "@mui/icons-material";
import moment from "moment";
import { currencyFormatter } from "@/constants";


const PrepaidTransactionList = ({
  data,
  isLoading,
  onRefresh,
  total,
  statusFilter,
  setStatusFilter,
  onView,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Filter data: search by meter number, token, orderNo, email, or mobile
  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = [...data];
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.meter?.number?.toLowerCase().includes(term) ||
          item.paymentId?.toLowerCase().includes(term) ||
          item.info?.orderNo?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term) ||
          item.mobileNo?.toLowerCase().includes(term)
        );
      });
    }
    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "completed") {
        filtered = filtered.filter((item) => item.isProcessed === true);
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((item) => item.isProcessed === false);
      }
      // If "failed" is needed, adjust based on your API
    }
    return filtered;
  }, [data, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleClearSearch = () => setSearchTerm("");
  const handlePageChange = (_, value) => setPage(value);
  const handleFilterChange = () => setPage(1);

  // Compute filtered total
  const filteredTotal = useMemo(() => {
    return currencyFormatter(
      filteredData.reduce((sum, item) => sum + Number(item.info?.amount || 0), 0)
    );
  }, [filteredData]);

  if (isLoading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Paper key={i} sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="rectangular" height={40} />
          </Paper>
        ))}
      </Stack>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No prepaid transactions found</Typography>
        <Button variant="text" onClick={onRefresh} startIcon={<Refresh />} sx={{ mt: 2 }}>
          Refresh
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {/* Header with total and refresh */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Total: {total}
        </Typography>
        <IconButton onClick={onRefresh} size="small">
          <Refresh />
        </IconButton>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search by meter, token, email or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleFilterChange();
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />

          {filteredData.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              No transactions match the current filters.
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Filtered total */}
      {filteredData.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Typography variant="caption" color="text.secondary">
            Showing {filteredData.length} of {data.length} transactions | Filtered total: {filteredTotal}
          </Typography>
        </Box>
      )}

      {/* Transaction list */}
      <List disablePadding>
        {paginatedData.map((tx) => {
          const isCompleted = tx.isProcessed;
          return (
            <Paper key={tx.id} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2, "&:hover": { bgcolor: "action.hover" } }}>
              {/* Date and Status */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="primary.main">
                  {moment(tx.createdAt).format("LLL")}
                </Typography>
                <Chip
                  label={isCompleted ? "Completed" : "Pending"}
                  size="small"
                  sx={{ bgcolor: isCompleted ? "success.darker" : "warning.darker", color: "white" }}
                />
              </Stack>

              {/* Token / OrderNo */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Token: {tx.paymentId}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Order No: {tx.info?.orderNo}
              </Typography>

              {/* Meter Number */}
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Meter No:</strong> {tx.meter?.number}
              </Typography>

              {/* Contact */}
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Email: {tx.email || "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Phone: {tx.mobileNo || "—"}
                </Typography>
              </Stack>

              {/* Amounts */}
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Top Up:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {currencyFormatter(tx.topup)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Charges:</Typography>
                <Typography variant="body2">{currencyFormatter(tx.charges || 0)}</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="secondary.main" fontWeight="bold">
                  {currencyFormatter(tx.info?.amount)}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => onView(tx)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(tx.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </List>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="small" shape="rounded" />
        </Box>
      )}
    </Stack>
  );
};

export default PrepaidTransactionList;