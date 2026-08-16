import React from "react";
import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Divider,
  useTheme,
} from "@mui/material";

const FullPageSkeleton = React.memo(({
  columns = 5,
  rows = 5,
  showBack = false,
  hasToolbar = true,
  hasSearch = false, // Matches your CustomizedMaterialTable's search = false default
  hasTableSubtitle = true,
}) => {
  const theme = useTheme();

  // Distribute columns nicely while mimicking your concrete table widths
  const columnWidths = React.useMemo(() => {
    return Array.from({ length: columns }, (_, i) => {
      if (i === 0) return "20%";
      if (i === columns - 1) return "12%";
      return `${68 / (columns - 2)}%`;
    });
  }, [columns]);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {/* 1. CustomTitle Mimic Section */}
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        p={2}
        my={2}
        bgcolor="#fff"
        sx={{
          mb: 4,
          gap: 2,
          borderRadius: 1.2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {showBack && (
          <Skeleton 
            variant="circular" 
            width={40} 
            height={40} 
            animation="wave" 
          />
        )}
        <Stack spacing={0.75} sx={{ width: "100%" }}>
          {/* Main Page Title text block */}
          <Skeleton 
            variant="text" 
            width={240} 
            height={36} 
            animation="wave" 
            sx={{ borderRadius: 1 }} 
          />
          {/* Main Page Subtitle text block */}
          <Skeleton 
            variant="text" 
            width={380} 
            height={20} 
            animation="wave" 
            sx={{ borderRadius: 0.5 }} 
          />
        </Stack>
      </Stack>

      {/* 2. Table Component Container Shell */}
      <Box
        sx={{
          width: { xs: "calc(100vw - 32px)", md: "100%" },
          height: "100%",
          mx: "auto",
          py: 2,
          overflowX: "auto",
        }}
      >
        <TableContainer 
          component={Paper} 
          elevation={0} 
          sx={{ 
            borderRadius: 1.2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden"
          }}
        >
          {/* Toolbar Skeleton matching your table layout */}
          {hasToolbar && (
            <Box sx={{ pt: 2, pb: 1 }}>
              <Stack width="100%" px={2} spacing={0.5}>
                {/* Table Header Label Block */}
                <Skeleton variant="text" width={180} height={32} animation="wave" sx={{ borderRadius: 1 }} />
                {/* Table Subhead Descriptor Block */}
                {hasTableSubtitle && (
                  <Skeleton variant="text" width={280} height={20} animation="wave" sx={{ borderRadius: 0.5 }} />
                )}
              </Stack>
              
              <Divider sx={{ mt: 2 }} />
              
              {/* Material Table Toolbar Action Bar Row */}
              <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Matches your searchFieldStyle dimensions exactly */}
                {hasSearch ? (
                  <Skeleton 
                    variant="rounded" 
                    animation="wave"
                    sx={{ 
                      borderRadius: "25px", 
                      width: "38svw", 
                      minWidth: 130, 
                      height: 36 
                    }} 
                  />
                ) : (
                  <Box />
                )}
                
                {/* Material Table built-in Free Action Buttons */}
                <Stack direction="row" spacing={1.5}>
                  <Skeleton variant="circular" width={34} height={34} animation="wave" />
                  <Skeleton variant="circular" width={34} height={34} animation="wave" />
                  <Skeleton variant="circular" width={34} height={34} animation="wave" />
                </Stack>
              </Box>
              <Divider />
            </Box>
          )}

          <Table>
            {/* Header Matrix Shell */}
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey }}>
                {Array.from({ length: columns }).map((_, i) => (
                  <TableCell 
                    key={`head-${i}`} 
                    sx={{ 
                      paddingBlock: "16px",
                      borderBottom: `1px solid ${theme.palette.divider}` 
                    }}
                  >
                    <Skeleton 
                      variant="text" 
                      width={columnWidths[i]} 
                      height={20} 
                      animation="wave" 
                      sx={{ borderRadius: 0.5 }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* Dynamic Grid Body Matrix */}
            <TableBody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <TableCell 
                      key={`cell-${rowIndex}-${colIndex}`}
                      sx={{ paddingBlock: "16px" }}
                    >
                      <Skeleton
                        variant="text"
                        width={colIndex === columns - 1 ? "40%" : "85%"} // Natural look variation
                        height={20}
                        animation="wave"
                        sx={{ borderRadius: 0.5 }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
});

FullPageSkeleton.displayName = "FullPageSkeleton";

export default FullPageSkeleton;
