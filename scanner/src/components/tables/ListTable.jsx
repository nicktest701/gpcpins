import MaterialTable from "material-table";
import { tableIcons } from "../../config/tableIcons";
import { Box } from "@mui/material";

// const CustomButton = forwardRef((props, ref) => (
//   <button ref={ref} className="custom-button">
//     {props.children}
//   </button>
// ));

function ListTable({
  isLoading,
  columns,
  data,
  options,
  onSelectionChange,
  headerComponent,
  onRowClicked,
}) {
  const modifiedColumns = columns.map((column) => {
    return { ...column };
  });

  return (
    <MaterialTable
      isLoading={isLoading}
      icons={tableIcons}
      columns={modifiedColumns}
      data={data}
      options={{
        search: false,
        selection: true,
        showSelectAllCheckbox: false,
        paging: data?.length > 0,
        ...options,
      }}
      style={{
        boxShadow: "none",
        // height: 400,
        fontSize: 12,
        overflow: "auto",
      }}
      title=""
      components={{
        Toolbar: (props) => {
          return (
            <>
              <Box sx={{ px: 1, width: "100%" }} {...props}>
                {headerComponent}
              </Box>
            </>
          );
        },
        Header: () => {
          return <></>;
        },
      }}
      onSelectionChange={onSelectionChange}
      onRowClick={(e, data) => onRowClicked(data)}
    />
  );
}

export default ListTable;
