import MaterialTable from "material-table";
import { tableIcons } from "../../config/tableIcons";
import { Box } from "@mui/material";

function PlainTable({ isLoading, columns, data, options }) {
  const modifiedColumns = columns.map((column) => {
    return { ...column };
  });

  return (
    <Box height={400}>
      <MaterialTable
        isLoading={isLoading}
        icons={tableIcons}
        columns={modifiedColumns}
        data={data}
        options={{
          search: false,

          ...options,
        }}
        style={{
          boxShadow: "none",
          height: 300,
          fontSize: 12,
        }}
        title=""
        components={{
          Toolbar: () => {
            return <></>;
          },
          // Header: () => {
          //   <></>;
          // },
        }}
      />
    </Box>
  );
}

export default PlainTable;
