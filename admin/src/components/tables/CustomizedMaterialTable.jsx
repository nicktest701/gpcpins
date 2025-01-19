import { Box, Divider, Stack, Tooltip, Typography } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";

import { tableIcons } from "../../config/tableIcons";
import { DeleteRounded, InfoRounded, Refresh } from "@mui/icons-material";

const CustomizedMaterialTable = ({
  isLoading,
  showExportButton,
  title,
  subtitle,
  data,
  search,
  columns,
  emptyMessage,
  icon,
  onRowClick,
  onRefresh,
  actions,
  addButton,
  autocompleteComponent,
  onDeleteAll,
  style,
  options,
  onRowSelected,
  onSelectionChange,
}) => {
  const modifiedColumns = columns.map((column) => {
    return { ...column };
  });

  return (
    // <AnimatedContainer>
    <Box
      sx={{
        borderRadius: 1,
        paddingBlock: "16px",
        width: { xs: "92svw", md: "100%" },
        // width:'100%',
        height: "100%",
        marginInline: "auto",
        py: 4,

        // bgcolor:'#fff'
      }}
      className="scroll-container"
    >
    <MaterialTable
      isLoading={isLoading}
      icons={tableIcons}
      columns={modifiedColumns}
      data={data}
      options={{
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
        paging: data?.length !== 0 ? true : false,
        pageSize: 5,
        paginationType: "stepped",
        exportAllData: true,
        exportFileName: title,
        // exportButton: showExportButton ? true : false,
        exportButton: {
          csv: showExportButton ? true : false,
          pdf: false,
        },
        headerStyle: {
          backgroundColor: "whitesmoke",
          // backgroundColor: "var(--primary)",
          color: "secondary.main",
          textTransform: "uppercase",
          paddingBlock: "12px",
        },

        fixedColumns: false,
        ...options,
      }}
      style={{
        boxShadow: "none",
        padding: "12px",
        width: "100%",
        height: "100%",
        marginInline: "auto",
      
        marginBlock: "24px",

        ...style,
      }}
      components={{
        Toolbar: (props) => {
          return (
            <>
              <Stack
                width="100%"
                columnGap={1}
                justifyContent="flex-start"
                alignItems="flex-start"
              >
                {/* {emptyIcon} */}
                <Typography variant="h5">{title}</Typography>
                <Typography variant="body2">{subtitle}</Typography>
              </Stack>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems="center"
                gap={2}
                p={2}
              >
                {autocompleteComponent}
              </Box>
              <Divider />
              <div style={{ paddingBlock: "16px" }}>
                <MTableToolbar {...props} />
              </div>
              <Divider />
            </>
          );
        },
      }}
      localization={{
        body: {
          emptyDataSourceMessage: (
            <Stack
              alignItems="center"
              justifyContent="center"
              minHeight={300}
              spacing={1}
            >
              {icon ? (
                icon
              ) : (
                <InfoRounded color="primary" sx={{ width: 100, height: 100 }} />
              )}
              <Typography>
                {isLoading
                  ? "Please Wait..."
                  : emptyMessage || "No data found!"}
              </Typography>
              {addButton}
            </Stack>
          ),
        },
      }}
      onRowClick={onRowClick}
      onRowSelected={onRowSelected}
      onSelectionChange={onSelectionChange}
      actions={
        actions?.length > 0
          ? [
              {
                icon: () => <DeleteRounded />,
                position: "toolbarOnSelect",
                tooltip: "Delete all",
                onClick: () => onDeleteAll(),
              },
              {
                icon: () => (
                  <Tooltip title="Refresh">
                    <Refresh />
                  </Tooltip>
                ),
                isFreeAction: true,
                onClick: () => onRefresh(),

                iconProps: {
                  role: "menu",
                },
              },
              ...actions,
            ]
          : [
              {
                icon: () => <DeleteRounded />,
                position: "toolbarOnSelect",
                tooltip: "Delete all",
                onClick: () => onDeleteAll(),
              },
              {
                icon: () => (
                  <Tooltip title="Refresh">
                    <Refresh />
                  </Tooltip>
                ),
                isFreeAction: true,
                onClick: () => onRefresh(),

                iconProps: {
                  role: "menu",
                },
              },
            ]
      }
      totalCount={data?.length}
    />
    </Box>
    // </AnimatedContainer>
  );
};

export default CustomizedMaterialTable;
