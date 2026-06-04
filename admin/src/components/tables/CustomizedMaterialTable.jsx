/* eslint-disable react/display-name */
import React, { useMemo } from "react";
import { Box, Divider, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import MaterialTable from "@material-table/core";
import { MTableToolbar } from "@material-table/core";
import { DeleteRounded, InfoRounded, Refresh } from "@mui/icons-material";
import { tableIcons } from "../../config/tableIcons";

const CustomizedMaterialTable = React.memo(
  ({
    isLoading = false,
    showExportButton = false,
    title = "",
    subtitle = "",
    data = [],
    columns = [],
    search = false,
    emptyMessage,
    icon,
    onRowClick,
    onRefresh,
    actions = [],
    addButton,
    autocompleteComponent,
    onDeleteAll,
    style,
    options = {},
    onRowSelected,
    onSelectionChange,
  }) => {
    const theme = useTheme();

    // Memoize columns to prevent unnecessary re-renders
    const memoizedColumns = useMemo(() => columns, [columns]);

    // Memoize options with sensible defaults
    const tableOptions = useMemo(
      () => ({
        showTitle: false,
        search: search || false,
        searchFieldVariant: "outlined",
        searchFieldStyle: {
          borderRadius: "25px",
          fontSize: "13px",
          marginTop: "5px",
          marginRight: "20px",
          width: "38svw",
          minWidth: 130,
        },
        searchFieldAlignment: "left",
        columnsButton: true,
        columnResizable: true,
        paging: data?.length !== 0,
        pageSize: 5,
        paginationType: "stepped",
        exportAllData: true,
        exportFileName: title,
        exportButton: {
          csv: showExportButton,
          pdf: false,
        },
        headerStyle: {
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.text.primary,
          textTransform: "uppercase",
          paddingBlock: "12px",
          fontWeight: "bold",
        },
        fixedColumns: false,
        ...options,
      }),
      [search, showExportButton, title, data?.length, options, theme]
    );

    // Build actions array only once
    const tableActions = useMemo(() => {
      const baseActions = [];

      // Refresh action (free)
      if (onRefresh) {
        baseActions.push({
          icon: () => (
            <Tooltip title="Refresh">
              <Refresh />
            </Tooltip>
          ),
          isFreeAction: true,
          onClick: onRefresh,
          iconProps: { role: "menu" },
        });
      }

      // Delete selected action (appears when rows selected)
      if (onDeleteAll) {
        baseActions.push({
          icon: () => <DeleteRounded />,
          position: "toolbarOnSelect",
          tooltip: "Delete selected",
          onClick: onDeleteAll,
        });
      }

      // Custom actions from props
      if (actions.length) {
        baseActions.push(...actions);
      }

      return baseActions;
    }, [onRefresh, onDeleteAll, actions]);

    // Custom toolbar component
    const CustomToolbar = useMemo(
      () => (props) => (
        <>
          <Stack width="100%" px={2} pt={2}>
            {title && (
              <Typography variant="h5" fontWeight="bold">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
          {autocompleteComponent && (
            <Box px={2} pt={1} pb={1}>
              {autocompleteComponent}
            </Box>
          )}
          <Divider />
          <MTableToolbar {...props} />
          <Divider />
        </>
      ),
      [title, subtitle, autocompleteComponent]
    );

    // Custom empty state
    const emptyState = useMemo(
      () => (
        <Stack alignItems="center" justifyContent="center" minHeight={300} spacing={2}>
          {icon || <InfoRounded color="primary" sx={{ width: 80, height: 80 }} />}
          <Typography color="text.secondary" align="center">
            {isLoading ? "Loading..." : emptyMessage || "No data found"}
          </Typography>
          {addButton}
        </Stack>
      ),
      [icon, isLoading, emptyMessage, addButton]
    );

    return (
      <Box
        sx={{
          width: { xs: "calc(100vw - 32px)", md: "100%" },
          height: "100%",
          mx: "auto",
          py: 2,
          overflowX: "auto",
          ...style,
        }}
        className="scroll-container"
      >
        <MaterialTable
          isLoading={isLoading}
          icons={tableIcons}
          columns={memoizedColumns}
          data={data}
          options={tableOptions}
          components={{ Toolbar: CustomToolbar }}
          localization={{
            body: {
              emptyDataSourceMessage: emptyState,
            },
            toolbar: {
              searchPlaceholder: "Search...",
            },
          }}
          onRowClick={onRowClick}
          onRowSelected={onRowSelected}
          onSelectionChange={onSelectionChange}
          actions={tableActions}
          totalCount={data?.length}
        />
      </Box>
    );
  }
);

CustomizedMaterialTable.displayName = "CustomizedMaterialTable";

export default CustomizedMaterialTable;
