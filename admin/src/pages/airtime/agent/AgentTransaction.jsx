import {
  Container,
  MenuItem,
  Stack,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
  isBefore,
} from "date-fns";

// MUI X Date Pickers Ecosystem Modules
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { getAgentTransaction } from "../../../api/transactionAPI";
import CustomTotal from "../../../components/custom/CustomTotal";
import CustomizedMaterialTable from "../../../components/tables/CustomizedMaterialTable";
import { currencyFormatter } from "../../../constants";
import { AuthContext } from "../../../context/providers/AuthProvider";
import { AGENT_TRANSACTIONS } from "../../../mocks/columns";

// Cached date calculation maps to completely eliminate object allocations in loops
const getDateRange = (preset, customStart, customEnd) => {
  const now = new Date();
  switch (preset) {
    case "today":
      return { start: startOfDay(now).getTime(), end: endOfDay(now).getTime() };
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return {
        start: startOfDay(yesterday).getTime(),
        end: endOfDay(yesterday).getTime(),
      };
    }
    case "thisWeek":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }).getTime(),
        end: endOfWeek(now, { weekStartsOn: 1 }).getTime(),
      };
    case "lastWeek": {
      const lastWeek = subWeeks(now, 1);
      return {
        start: startOfWeek(lastWeek, { weekStartsOn: 1 }).getTime(),
        end: endOfWeek(lastWeek, { weekStartsOn: 1 }).getTime(),
      };
    }
    case "thisMonth":
      return {
        start: startOfMonth(now).getTime(),
        end: endOfMonth(now).getTime(),
      };
    case "lastMonth": {
      const lastMonth = subMonths(now, 1);
      return {
        start: startOfMonth(lastMonth).getTime(),
        end: endOfMonth(lastMonth).getTime(),
      };
    }
    case "thisYear":
      return {
        start: startOfYear(now).getTime(),
        end: endOfYear(now).getTime(),
      };
    case "lastYear": {
      const lastYear = subYears(now, 1);
      return {
        start: startOfYear(lastYear).getTime(),
        end: endOfYear(lastYear).getTime(),
      };
    }
    case "custom": {
      // Validation Enforcement: Reject evaluation completely if custom boundaries cross values
      if (
        customStart &&
        customEnd &&
        isBefore(new Date(customEnd), new Date(customStart))
      ) {
        return null;
      }
      return {
        start: customStart ? startOfDay(new Date(customStart)).getTime() : null,
        end: customEnd ? endOfDay(new Date(customEnd)).getTime() : null,
      };
    }
    default:
      return null;
  }
};

function AgentTransaction() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("all");
  const [datePreset, setDatePreset] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const {
    data: rawTransactions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["agent_transactions", id],
    queryFn: () => getAgentTransaction(id),
    enabled: !!user?.id && !!id,
    initialData: [],
  });

  // Check if any filters are active
  const isFiltered =
    type !== "All" ||
    status !== "all" ||
    datePreset !== "" ||
    startDate !== null ||
    endDate !== null;

  // Reset all filters back to original configurations
  const handleResetFilters = () => {
    setType("All");
    setStatus("all");
    setDatePreset("");
    setStartDate(null);
    setEndDate(null);
  };

  // Single-pass optimization: Filter data and calculate the running sum simultaneously
  const { filteredTransactions, totalAmount } = useMemo(() => {
    if (!rawTransactions.length) {
      return { filteredTransactions: [], totalAmount: 0 };
    }

    const range = datePreset
      ? getDateRange(datePreset, startDate, endDate)
      : null;
    const filterByType = type !== "All";
    const filterByStatus = status !== "all";

    const filtered = [];
    let runningSum = 0;

    // Fast return for broken validation boundaries
    if (
      datePreset === "custom" &&
      startDate &&
      endDate &&
      isBefore(new Date(endDate), new Date(startDate))
    ) {
      return { filteredTransactions: [], totalAmount: 0 };
    }

    for (let i = 0; i < rawTransactions.length; i++) {
      const item = rawTransactions[i];

      // 1. Structural Type Filtering
      if (filterByType && item.type !== type) continue;

      // 2. Structural Status Filtering
      if (filterByStatus && item.status !== status) continue;

      // 3. Fast Timestamp Filtering with partial custom date support
      if (range) {
        const itemTime = new Date(item.createdAt).getTime();
        if (range.start && itemTime < range.start) continue;
        if (range.end && itemTime > range.end) continue;
      }

      filtered.push(item);
      runningSum += Number(item?.totalAmount || item?.amount || 0);
    }

    return { filteredTransactions: filtered, totalAmount: runningSum };
  }, [rawTransactions, type, status, datePreset, startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container sx={{ paddingY: 2, bgcolor: "#fff" }}>
        <CustomizedMaterialTable
          title="Agent Transactions"
          isLoading={isLoading}
          columns={AGENT_TRANSACTIONS}
          data={filteredTransactions}
          onRefresh={refetch}
          showExportButton={true}
          search={true}
          autocompleteComponent={
            <>
              <CustomTotal
                title="TOTAL"
                total={currencyFormatter(totalAmount)}
              />

              <Box sx={{ width: "100%", py: 2 }}>
                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", lg: "flex-start" }}
                  spacing={2}
                >
                  {/* Responsive Filter Container Grid */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <TextField
                      select
                      label="Type"
                      size="small"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      sx={{
                        flexGrow: 1,
                        minWidth: { xs: "100%", sm: 140 },
                        maxWidth: { lg: 180 },
                      }}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="airtime">Airtime Transfer</MenuItem>
                      <MenuItem value="bundle">Data Bundle</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Status"
                      size="small"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      sx={{
                        flexGrow: 1,
                        minWidth: { xs: "100%", sm: 140 },
                        maxWidth: { lg: 180 },
                      }}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Date Range"
                      size="small"
                      value={datePreset}
                      onChange={(e) => setDatePreset(e.target.value)}
                      sx={{
                        flexGrow: 1,
                        minWidth: { xs: "100%", sm: 160 },
                        maxWidth: { lg: 190 },
                      }}
                    >
                      <MenuItem value="">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="yesterday">Yesterday</MenuItem>
                      <MenuItem value="thisWeek">This Week</MenuItem>
                      <MenuItem value="lastWeek">Last Week</MenuItem>
                      <MenuItem value="thisMonth">This Month</MenuItem>
                      <MenuItem value="lastMonth">Last Month</MenuItem>
                      <MenuItem value="thisYear">This Year</MenuItem>
                      <MenuItem value="lastYear">Last Year</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </TextField>

                    {/* MUI X Custom Date Pickers with Format Tokens */}
                    {datePreset === "custom" && (
                      <>
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={(newValue) => setStartDate(newValue)}
                          maxDate={endDate || undefined}
                          format="dd/MM/yyyy"
                          slotProps={{
                            textField: {
                              size: "small",
                              sx: {
                                flexGrow: 1,
                                minWidth: { xs: "100%", sm: 160 },
                                maxWidth: { lg: 180 },
                              },
                            },
                          }}
                        />
                        <DatePicker
                          label="End Date"
                          value={endDate}
                          onChange={(newValue) => setEndDate(newValue)}
                          minDate={startDate || undefined}
                          format="dd/MM/yyyy"
                          slotProps={{
                            textField: {
                              size: "small",
                              sx: {
                                flexGrow: 1,
                                minWidth: { xs: "100%", sm: 160 },
                                maxWidth: { lg: 180 },
                              },
                            },
                          }}
                        />
                      </>
                    )}
                  </Box>

                  {/* Reset Control Action Button */}
                  {isFiltered && (
                    <Button
                      variant="text"
                      color="error"
                      onClick={handleResetFilters}
                      size="small"
                      sx={{
                        height: 40,
                        whiteSpace: "nowrap",
                        ml: { sm: "auto", lg: 0 },
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Stack>
              </Box>
            </>
          }
        />
      </Container>
    </LocalizationProvider>
  );
}

export default AgentTransaction;
