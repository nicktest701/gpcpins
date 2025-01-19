import { Box, Stack, Tooltip, Typography } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";
import {
  Skeleton,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TableBody,
} from "@mui/material";

import { tableIcons } from "../../config/tableIcons";
import { DeleteRounded, InfoRounded, Refresh } from "@mui/icons-material";

const CustomizedMaterialTable = ({
  isLoading,
  showExportButton,
  showExportButtonPDF,
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
    <>
      {isLoading && <TableSkeleton />}
      {data && (
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
            title={
              <>
                <Stack
                  display={{ xs: "none", sm: "block" }}
                  direction="row"
                  columnGap={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  {/* {emptyIcon} */}
                  <Typography variant="h5">{title}</Typography>
                  <Typography variant="body2" color="secondary.main">
                    {subtitle}
                  </Typography>
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
                width: 300,
                minWidth: 130,
              },
              columnsButton: true,
              columnResizable: true,
              paging: data?.length !== 0 ? true : false,
              pageSize: 5,
              paginationType: "stepped",
              exportAllData: true,
              exportFileName: title,
              exportButton: true,
              // exportButton: {
              //   csv: showExportButton ? true : false,
              //   pdf: showExportButtonPDF || false,
              // },
              headerStyle: {
                backgroundColor: "whitesmoke",
                // backgroundColor: "var(--primary)",
                color: "#333",
                // color: "#fff",
                textTransform: "uppercase",
                paddingBlock: "12px",
              },

              fixedColumns: false,
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
                    <div style={{ paddingBlock: "16px" }}>
                      <MTableToolbar {...props} />
                    </div>
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
      )}
    </>
  );
};

const TableSkeleton = () => {
  return (
    <TableContainer sx={{ border: "1px solid lightgray", borderRadius: 1 }}>
      <TableHead>
        <TableRow>
          {/* Placeholders for table headers */}
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          {/* Add more table cells for additional headers */}
        </TableRow>
      </TableHead>
      <TableBody>
        {/* Placeholder table rows */}
        {[...Array(8)].map((_, index) => (
          <TableRow key={index}>
            <TableCell sx={{ width: "10%" }}>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell sx={{ width: "10%" }}>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell sx={{ width: "10%" }}>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell sx={{ width: "10%" }}>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell sx={{ width: "10%" }}>
              <Skeleton variant="text" width={100} />
            </TableCell>

            {/* Add more table cells for additional columns */}
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default CustomizedMaterialTable;
