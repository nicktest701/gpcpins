import { Box, Stack, Typography } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";

import { tableIcons } from "../../config/tableIcons";
import { DeleteRounded, InfoRounded, Refresh } from "@mui/icons-material";

const CustomizedMaterialTable = ({
  isLoading,
  showExportButton,
  title,
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
}) => {
  const modifiedColumns = columns.map((column) => {
    return { ...column };
  });

  return (
    // <AnimatedContainer>
    <Box
      sx={{
        borderRadius: 0,
        paddingBlock: "16px",
        width: { xs: "85svw", md: "100%" },
        marginInline: "auto",
        py: 4,
      }}
      className="scroll-container"
    >
      <MaterialTable
        isLoading={isLoading}
        title={
          <>
            <Stack
               display={{ xs: "none", md: "block" }}
              direction="row"
              columnGap={1}
              justifyContent="center"
              alignItems="center"
            >
              {/* {emptyIcon} */}
              <Typography variant="h5">{title}</Typography>
            </Stack>
          </>
        }
        icons={tableIcons}
        columns={modifiedColumns}
        data={data}
        options={{
          search: search || false,
          searchFieldVariant: "outlined",
          searchFieldStyle: {
            borderRadius: "20px",
            fontSize: "13px",
            marginTop: "10px",
            marginRight: "20px",
            height: "40px",
            minWidth: 120,
          },

          columnsButton: true,
          columnResizable: true,
          paging: data?.length !== 0 ? true : false,
          pageSize: 5,
          paginationType: "stepped",
          exportAllData: true,
          exportFileName: title,
          exportButton: showExportButton ? true : false,
          headerStyle: {
            backgroundColor: "whitesmoke",
            fontWeight: "bold",
            color: "var(--sceondary)",
            textTransform: "uppercase",
          },

          ...options,
        }}
        style={{
          boxShadow: "none",
          ...style,
        }}
        components={{
          Toolbar: (props) => {
            return (
              <>
                <MTableToolbar {...props} />
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                  padding={2}
                >
                  {autocompleteComponent}
                </Box>
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
                  <InfoRounded
                    color="primary"
                    sx={{ width: 100, height: 100 }}
                  />
                )}
                <Typography>{emptyMessage || "No data available"}</Typography>
                {addButton}
              </Stack>
            ),
          },
        }}
        onRowClick={onRowClick}
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
                  icon: () => <Refresh />,
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
                  icon: () => <Refresh />,
                  isFreeAction: true,
                  onClick: () => onRefresh(),

                  iconProps: {
                    role: "menu",
                  },
                },
              ]
        }
      />
    </Box>
    // </AnimatedContainer>
  );
};

export default CustomizedMaterialTable;
