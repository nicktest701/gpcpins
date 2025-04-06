import { useContext } from "react";
import Box from "@mui/material/Box";
import MaterialTable, { MTableToolbar } from "material-table";
import { tableIcons } from "../../config/tableIcons";
import { DeleteRounded, Refresh } from "@mui/icons-material";
import {
  getColumns,
  getDeletePermission,
  getExportPermission,
} from "../../config/getColumns";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/providers/AuthProvider";

const ViewCategory = ({ categories, refetch }) => {
  const { category } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOpenViewCategory = (id) => {
    navigate(`/evoucher/${category}/${id}`);
  };

  const IS_DELETE_AVAILABLE = user?.permissions?.includes(
    getDeletePermission(category)
  );
  const IS_EXPORT_AVAILABLE = user?.permissions?.includes(
    getExportPermission(category)
  );

  const modifiedColumns = [...getColumns(category)];

  const columns = modifiedColumns.map((column) => {
    return { ...column };
  });

  if (!category) {
    return <Navigate to="/" />;
  }

  return (
    <MaterialTable
      title="Cinema Tickets "
      icons={tableIcons}
      components={{
        Toolbar: (params) => {
          return (
            <>
              <Box py={2}>
                <MTableToolbar {...params} />
              </Box>
              {/* <Divider/> */}
            </>
          );
        },
      }}
      // isLoading={categories.isLoading}
      columns={columns}
      data={categories.data}
      options={{
        header: false,
        paginationType: "stepped",
        // search:false,
        searchFieldVariant: "outlined",
        searchFieldStyle: {
          minWidth: "50svw",
          width: "100%",
          borderRadius: "32px",
          fontSize: "14px",
          paddingBlock: 1,
        },
        // rowStyle: {
        //   boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        // },
        showTitle: false,
        // tableLayout: "fixed",
        // debounceInterval: 3000,
        searchFieldAlignment: "left",
        exportAllData: true,
        exportButton: IS_EXPORT_AVAILABLE,
        selection: IS_DELETE_AVAILABLE,
        showSelectAllCheckbox: IS_DELETE_AVAILABLE,
        columnsButton: true,
        headerStyle: {
          backgroundColor: "var(--primary)",
          color: "#fff",
          padding: "12px",
          textTransform: "uppercase",
        },
      }}
      style={{
        padding: "8px",
        paddingBlock: "20px",
        boxShadow: "none",
        marginBlock: 50,
      }}
      actions={[
        {
          icon: () => <DeleteRounded />,
          position: "toolbarOnSelect",
          tooltip: "Delete all",
          onClick: () => {},
          // onClick: removeAllCategory,
        },
        {
          icon: () => <Refresh />,
          position: "toolbar",
          tooltip: "Refresh",
          onClick: () => refetch(),
        },
      ]}
      onRowClick={(e, data) => handleOpenViewCategory(data?.id)}
    />
  );
};

export default ViewCategory;
