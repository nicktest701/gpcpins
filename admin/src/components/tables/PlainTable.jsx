import { useMemo, useState } from "react";
import {
  Box,
  InputAdornment,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import { InboxRounded, SearchRounded } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

/**
 * Drop-in replacement for the old material-table wrapper, built on plain
 * MUI Table primitives (no extra dependency, no React 18 strict-mode quirks).
 *
 * columns: [{ title, field, render?(row), align?, width?, sortable? }]
 * options: { paging = true, pageSize = 10, pageSizeOptions, search = false, maxHeight, emptyMessage }
 *
 * `render` mirrors the old material-table API (render: (rowData) => node),
 * so most existing column definitions work unchanged.
 */
function PlainTable({ isLoading, columns = [], data = [], options = {} }) {
  const {
    paging = true,
    pageSize = 10,
    pageSizeOptions = [5, 10, 25, 50],
    search = false,
    maxHeight = 420,
    emptyMessage = "No records to show yet.",
  } = options;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!search || !searchTerm.trim()) return data ?? [];
    const term = searchTerm.trim().toLowerCase();
    return (data ?? []).filter((row) =>
      columns.some((col) => {
        const value = col.field ? row?.[col.field] : undefined;
        return String(value ?? "").toLowerCase().includes(term);
      })
    );
  }, [data, search, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    const copy = [...filteredData];
    copy.sort((a, b) => {
      const av = a?.[sortField];
      const bv = b?.[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return -1;
      if (bv == null) return 1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv), undefined, { numeric: true });
    });
    if (sortDir === "desc") copy.reverse();
    return copy;
  }, [filteredData, sortField, sortDir]);

  const pagedData = useMemo(() => {
    if (!paging) return sortedData;
    const start = page * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, paging, page, rowsPerPage]);

  const handleSort = (column) => {
    if (!column.field || column.sortable === false) return;
    if (sortField === column.field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(column.field);
      setSortDir("asc");
    }
  };

  const skeletonRows = Array.from({ length: Math.min(rowsPerPage, 6) });

  return (
    <Box>
      {search && (
        <TextField
          size="small"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ mb: 1.5, width: { xs: "100%", sm: 260 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      )}

      <TableContainer sx={{ maxHeight, borderRadius: 2 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field ?? col.title}
                  align={col.align || "left"}
                  sx={{
                    width: col.width,
                    fontSize: 11.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    color: "text.secondary",
                    bgcolor: "background.paper",
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {col.field && col.sortable !== false ? (
                    <TableSortLabel
                      active={sortField === col.field}
                      direction={sortField === col.field ? sortDir : "asc"}
                      onClick={() => handleSort(col)}
                    >
                      {col.title}
                    </TableSortLabel>
                  ) : (
                    col.title
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading &&
              skeletonRows.map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((col) => (
                    <TableCell key={col.field ?? col.title} align={col.align || "left"}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && pagedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                  <Stack alignItems="center" spacing={1} sx={{ py: 5 }}>
                    <InboxRounded sx={{ fontSize: 32, color: "text.disabled" }} />
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              pagedData.map((row, rowIndex) => (
                <TableRow
                  key={row?.id ?? rowIndex}
                  hover
                  sx={{
                    "&:last-child td": { border: 0 },
                    "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.field ?? col.title}
                      align={col.align || "left"}
                      sx={{ fontSize: 12.5, color: "text.primary" }}
                    >
                      {col.render ? col.render(row) : row?.[col.field] ?? "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {paging && !isLoading && sortedData.length > 0 && (
        <TablePagination
          component="div"
          count={sortedData.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={pageSizeOptions}
          sx={{
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            ".MuiTablePagination-toolbar": { minHeight: 44, px: 0 },
          }}
        />
      )}
    </Box>
  );
}

export default PlainTable;