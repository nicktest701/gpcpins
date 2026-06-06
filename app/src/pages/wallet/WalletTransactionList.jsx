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
  Grid,
} from "@mui/material";
import {
  Search,
  Clear,
  Refresh,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import moment from "moment";
import { currencyFormatter } from "../../constants";

const WalletTransactionList = ({ data, isLoading, onRefresh, total }) => {
  // Local state for search, filters, pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Filter the data based on search, status, type
  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = [...data];

    // Search by ID or comment
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.id?.toLowerCase().includes(term) ||
          item.comment?.toLowerCase().includes(term),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Type filter (deposit/credit/refund vs purchase/withdrawal)
    if (typeFilter !== "all") {
      const isDepositType = ["deposit", "refund", "credit"].includes(
        typeFilter,
      );
      filtered = filtered.filter((item) => {
        const itemIsDeposit = ["deposit", "refund", "credit"].includes(
          item.type,
        );
        return isDepositType ? itemIsDeposit : !itemIsDeposit;
      });
    }

    return filtered;
  }, [data, searchTerm, statusFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Reset page when filters change
  const handleFilterChange = () => {
    setPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPage(1);
  };

  // Total of filtered transactions
  const filteredTotal = useMemo(
    () =>
      currencyFormatter(
        filteredData.reduce((sum, item) => sum + Number(item.amount), 0),
      ),
    [filteredData],
  );

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
        <Typography color="text.secondary">No transactions found</Typography>
        <Button
          variant="text"
          onClick={onRefresh}
          startIcon={<Refresh />}
          sx={{ mt: 2 }}
        >
          Refresh
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={2} pt={4}>
      {/* Header with total and refresh */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h1" fontWeight="bold">
          {total}
        </Typography>
        <IconButton onClick={onRefresh} size="small">
          <Refresh />
        </IconButton>
      </Box>

      {/* Search and Filters */}
      <Paper>
        <Stack spacing={2}>
          {/* Search field */}
          <TextField
            size="small"
            placeholder="Search by ID or comment..."
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
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />

          {/* Filters row */}

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
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => {
                setTypeFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="deposit">Deposit / Refund / Credit</MenuItem>
              <MenuItem value="purchase">Purchase / Withdrawal</MenuItem>
            </Select>
          </FormControl>

          {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                size="small"
                onClick={handleClearFilters}
                startIcon={<Clear />}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>

      {filteredData.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={2}
        >
          No transactions match the current filters.
        </Typography>
      ) : (
        <>
          {/* Filtered total display */}
          {filteredData.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography variant="caption" color="text.secondary">
                Showing {filteredData.length} of {data.length} transactions |
                Filtered total: {filteredTotal}
              </Typography>
            </Box>
          )}

          {/* Transaction list */}
          <List disablePadding>
            {paginatedData.map((transaction) => {
              const isDeposit = ["deposit", "refund", "credit"].includes(
                transaction.type,
              );
              const date = moment(transaction.createdAt);
              const amountNum = Number(transaction.amount);
              const walletAmount = Number(transaction.walletAmount);
              const newBalance = isDeposit
                ? walletAmount + amountNum
                : walletAmount - amountNum;

              return (
                <Paper
                  key={transaction.id}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    transition: "0.2s",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {/* Row 1: Date & Status */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="caption" color="primary.main">
                      {date.format("Do MMM, YYYY")}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {date.format("h:mm a")}
                      </Typography>
                    </Typography>
                    <Chip
                      label={
                        transaction.status === "completed"
                          ? "Completed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        bgcolor:
                          transaction.status === "completed"
                            ? "success.darker"
                            : "error.darker",
                        color: "white",
                      }}
                    />
                  </Stack>

                  {/* Row 2: Transaction ID */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    ID: {transaction.id}
                  </Typography>

                  {/* Row 3: Type and Amount */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {isDeposit ? (
                        <ArrowUpward fontSize="small" color="success" />
                      ) : (
                        <ArrowDownward fontSize="small" color="error" />
                      )}
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.comment}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={isDeposit ? "success.main" : "error.main"}
                    >
                      {isDeposit
                        ? `+${currencyFormatter(amountNum)}`
                        : `-${currencyFormatter(amountNum)}`}
                    </Typography>
                  </Stack>

                  {/* Row 4: New Balance */}
                  <Box
                    sx={{
                      borderTop: "1px dashed",
                      borderColor: "divider",
                      pt: 1,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Balance after:
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {currencyFormatter(newBalance)}
                      </Typography>
                    </Stack>
                  </Box>
                </Paper>
              );
            })}
          </List>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size="small"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Stack>
  );
};

export default WalletTransactionList;
