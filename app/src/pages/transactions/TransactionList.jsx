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
  Divider,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  ConfirmationNumber,
  Bolt,
  LocalOffer,
  Smartphone,
  ReceiptLong,
} from "@mui/icons-material";
import { Search, Clear, Refresh, Download } from "@mui/icons-material";
import moment from "moment";
import { currencyFormatter } from "../../constants";

const TransactionList = ({
  data,
  isLoading,
  onRefresh,
  total,
  type,
  setType,
  airtimeType,
  setAirtimeType,
  status,
  setStatus,
  onDownload,
}) => {
  // Local state for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Filter data based on search term (by ID or recipient/email)
  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = [...data];
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.id?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term) ||
          item.phonenumber?.toLowerCase().includes(term) ||
          (item.recipient && item.recipient.toLowerCase().includes(term)),
      );
    }
    return filtered;
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleClearSearch = () => setSearchTerm("");
  const handlePageChange = (_, value) => setPage(value);

  // Reset page when filters change
  const handleFilterChange = () => setPage(1);

  const handleRefresh = () => {
    setPage(1);
    setSearchTerm("");
    setType("All");
    onRefresh();
  };

  // Helper to render bulk recipients
  const renderRecipient = (item) => {
    if (type === "Airtime" && airtimeType === "bulk" && item.recipient) {
      try {
        const recipients = JSON.parse(item.recipient);
        return (
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {recipients.map((rec) => (
              <Typography key={rec.recipient} variant="caption" display="block">
                {rec.recipient}{" "}
                <strong style={{ color: "var(--secondary)" }}>
                  ({currencyFormatter(rec.price)})
                </strong>
              </Typography>
            ))}
          </Stack>
        );
      } catch {
        return <Typography variant="body2">{item.recipient}</Typography>;
      }
    }
    return <Typography variant="body2">{item.recipient || "—"}</Typography>;
  };

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
          onClick={handleRefresh}
          startIcon={<Refresh />}
          sx={{ mt: 2 }}
        >
          Refresh
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
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
        <IconButton onClick={handleRefresh} size="small">
          <Refresh />
        </IconButton>
      </Box>

      {/* Filters row (type, airtime type, status) */}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={type}
              label="Transaction Type"
              onChange={(e) => {
                setType(e.target.value);
                handleFilterChange();
              }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Voucher">Vouchers</MenuItem>
              <MenuItem value="Ticket">Tickets</MenuItem>
              <MenuItem value="Prepaid">Prepaid</MenuItem>
              <MenuItem value="Airtime">Airtime Transfer</MenuItem>
              <MenuItem value="Bundle">Data Bundle</MenuItem>
            </Select>
          </FormControl>

          {type === "Airtime" && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Airtime Type</InputLabel>
                <Select
                  value={airtimeType}
                  label="Airtime Type"
                  onChange={(e) => {
                    setAirtimeType(e.target.value);
                    handleFilterChange();
                  }}
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="bulk">Bulk</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => {
                setStatus(e.target.value);
                handleFilterChange();
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>

          {/* Search field */}
          <TextField
            size="small"
            placeholder="Search by ID, email, phone, or recipient..."
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
        </Stack>
      </Paper>

      {filteredData.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={2}
        >
          No transactions match the current search.
        </Typography>
      ) : (
        <>
          {/* Transaction list */}
          <List disablePadding>
            {paginatedData.map((transaction) => {
              const isPending =
                (transaction.status === "completed" &&
                  !transaction?.isProcessed) ||
                transaction?.status === "pending";

              const isCompleted =
                transaction.status === "completed" && transaction?.isProcessed;

              const isRefunded = transaction.status === "refunded";
              const statusColor = isCompleted
                ? "success.darker"
                : isRefunded
                  ? "secondary.main"
                  : isPending
                    ? "warning.dark"
                    : "error.dark";
              const statusLabel = isCompleted
                ? "Completed"
                : isRefunded
                  ? "Refunded"
                  : isPending
                    ? "Pending"
                    : "Failed";

              // Show download button only for certain domains and completed status
              const showDownload =
                ["Voucher", "Ticket", "Prepaid"].includes(transaction.domain) &&
                isCompleted &&
                transaction.downloadLink;

              return (
                <Paper
                  key={transaction.id}
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 2.5,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all .25s ease",
                    overflow: "hidden",

                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (theme) => theme.shadows[4],
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Stack spacing={2}>
                    {/* Header */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: `${statusColor}20`,
                            color: statusColor,
                            width: 50,
                            height: 50,
                          }}
                        >
                          {getTransactionIcon(transaction)}
                        </Avatar>

                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ lineHeight: 1.2 }}
                          >
                            {transaction.domain}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {moment(transaction.createdAt).fromNow()}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={statusLabel}
                        size="small"
                        sx={{
                          bgcolor: statusColor,
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>

                    {/* Amount */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Transaction Amount
                        </Typography>

                        <Typography
                          variant="h5"
                          fontWeight={800}
                          color="secondary.main"
                        >
                          {currencyFormatter(transaction.amount)}
                        </Typography>
                      </Box>

                      {showDownload && (
                        <Tooltip title="Download Receipt">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              onDownload(
                                transaction.id,
                                transaction.downloadLink,
                              )
                            }
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>

                    {/* Tags */}
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {transaction.type && (
                        <Typography>{transaction.type}</Typography>
                      )}

                      {transaction.kind && (
                        <Chip
                          label={transaction.kind}
                          size="small"
                          variant="outlined"
                        />
                      )}

                      {transaction.provider && (
                        <Chip
                          label={transaction.provider}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    <Divider />

                    {/* Details */}
                    <Stack spacing={1}>
                      <CheckOutItem
                        title="Trans. ID"
                        value={transaction.id}
                      />
                       {transaction.meter && (
                      <CheckOutItem
                        title="Ext. Trans. ID"
                        value={transaction.externalTransactionId}
                      />
 )}
                      <CheckOutItem
                        title="Date"
                        value={moment(transaction.createdAt).format(
                          "dddd, MMM D YYYY • h:mm A",
                        )}
                      />

                      {transaction.meter && (
                        <CheckOutItem
                          title="Meter Number"
                          value={transaction.meter}
                        />
                      )}

                      {transaction.volume && (
                        <CheckOutItem
                          title="Bundle Volume"
                          value={transaction.volume}
                        />
                      )}

                      {transaction.voucherType && (
                        <CheckOutItem
                          title="Voucher/Ticket"
                          value={transaction.voucherType}
                        />
                      )}

                      {transaction.recipient && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mb: 0.5, display: "block" }}
                          >
                            Recipient
                          </Typography>

                          {renderRecipient(transaction)}
                        </Box>
                      )}
                    </Stack>

                    {/* Footer */}
                    <Divider />

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1}
                      justifyContent="space-between"
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                    >
                      <Stack spacing={0.3}>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>

                        <Typography variant="body2" fontWeight={500}>
                          {transaction.email || "N/A"}
                        </Typography>
                      </Stack>

                      <Stack spacing={0.3}>
                        <Typography variant="caption" color="text.secondary">
                          Phone Number
                        </Typography>

                        <Typography variant="body2" fontWeight={500}>
                          {transaction.phonenumber || "N/A"}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.3}>
                        <Typography variant="caption" color="text.secondary">
                          Payment Mode
                        </Typography>

                        <Typography variant="body2" fontWeight={500}>
                          {transaction.mode || "N/A"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>
              );

              // return (
              //   <Paper
              //     key={transaction.id}
              //     variant="outlined"
              //     sx={{
              //       mb: 2,
              //       p: 2,
              //       borderRadius: 2,
              //       transition: "0.2s",
              //       "&:hover": { bgcolor: "action.hover" },
              //     }}
              //   >
              //     {/* Date and Status */}
              //     <Stack
              //       direction="row"
              //       justifyContent="space-between"
              //       alignItems="center"
              //       sx={{ mb: 1 }}
              //     >
              //       <Typography variant="caption" color="primary.main">
              //         {moment(transaction.createdAt).format("LLL")}
              //       </Typography>
              //       <Chip
              //         label={statusLabel}
              //         size="small"
              //         sx={{ bgcolor: statusColor, color: "white" }}
              //       />
              //     </Stack>

              //     {/* Transaction ID */}
              //     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              //       ID: {transaction.id}
              //     </Typography>

              //     {/* Domain and Type */}
              //     <Stack direction="row" spacing={1}  >
              //       <CheckOutItem title='Domain' value={transaction.domain}/>
              //       <CheckOutItem title='' value={}/>

              //     </Stack>
              //     {transaction.type && (
              //       <>
              //         <Typography
              //           width="100%"
              //           variant="body2"
              //           color="text.secondary"
              //         >
              //           Service:{" "}
              //         </Typography>
              //         <Typography variant="body2" fontWeight="medium">
              //           {transaction.type}
              //         </Typography>
              //       </>
              //     )}
              //     {transaction.kind && (
              //       <>
              //         <Typography variant="body2" color="text.secondary">
              //           Kind:
              //         </Typography>
              //         <Typography variant="body2" fontWeight="medium">
              //           {transaction.kind}
              //         </Typography>
              //       </>
              //     )}

              //     {/* Recipient / Meter / Bundle details */}
              //     {transaction.domain === "Prepaid" && transaction.meter && (
              //       <Typography variant="body2" sx={{ mb: 1 }}>
              //         <strong>Meter:</strong> {transaction.meter}
              //       </Typography>
              //     )}
              //     {transaction.domain === "Bundle" && transaction.volume && (
              //       <Typography variant="body2" sx={{ mb: 1 }}>
              //         <strong>Volume:</strong> {transaction.volume}
              //       </Typography>
              //     )}
              //     {transaction.voucherType && (
              //       <Typography variant="body2" sx={{ mb: 1 }}>
              //         <strong>Voucher/Ticket:</strong> {transaction.voucherType}
              //       </Typography>
              //     )}
              //     {transaction.recipient && (
              //       <Box sx={{ mb: 1 }}>
              //         <Typography variant="body2" color="text.secondary">
              //           Recipient:
              //         </Typography>
              //         {renderRecipient(transaction)}
              //       </Box>
              //     )}

              //     {/* Contact Info */}
              //     <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
              //       <Typography variant="caption" color="text.secondary">
              //         Email: {transaction.email || "—"}
              //       </Typography>
              //       <Typography variant="caption" color="text.secondary">
              //         Phone: {transaction.phonenumber || "—"}
              //       </Typography>
              //     </Stack>

              //     {/* Amount and Action */}
              //     <Divider sx={{ my: 1 }} />
              //     <Stack
              //       direction="row"
              //       justifyContent="space-between"
              //       alignItems="center"
              //     >
              //       <Typography
              //         variant="h6"
              //         color="secondary.main"
              //         fontWeight="bold"
              //       >
              //         {currencyFormatter(transaction.amount)}
              //       </Typography>
              //       {showDownload && (
              //         <Button
              //           size="small"
              //           variant="outlined"
              //           startIcon={<Download />}
              //           onClick={() =>
              //             onDownload(transaction.id, transaction.downloadLink)
              //           }
              //         >
              //           Receipt
              //         </Button>
              //       )}
              //     </Stack>
              //   </Paper>
              // );
            })}
          </List>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
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

export default TransactionList;

const getTransactionIcon = (transaction) => {
  switch (transaction.domain?.toLowerCase()) {
    case "prepaid":
      return <Bolt />;

    case "bundle":
      return <Smartphone />;

    case "ticket":
      return <ConfirmationNumber />;

    case "voucher":
      return <LocalOffer />;

    default:
      return <ReceiptLong />;
  }
};

const CheckOutItem = ({ title, titleColor, value, color }) => {
  return (
    <Stack
      width="100%"
      direction="row"
      // justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
    >
      <Typography
        variant="body2"
        fontWeight="700"
        color={titleColor || color || "secondary"}
        textAlign="left"
        flexWrap="nowrap"
        whiteSpace="nowrap"
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        textAlign="left"
        color={color || "text.primary"}
        sx={{
          display: { xs: "inline-block" },
          fontSize: { xs: 12, sm: "normal" },
        }}
        whiteSpace="wrap"
      >
        {value}
      </Typography>
    </Stack>
  );
};
