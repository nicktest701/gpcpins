import { useContext, useState } from "react";
import Box from "@mui/material/Box";
import MaterialTable, { MTableToolbar } from "material-table";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableIcons } from "../../config/tableIcons";
import { DeleteRounded, Refresh } from "@mui/icons-material";
import { CustomContext } from "../../context/providers/CustomProvider";
import {
  getColumns,
  getDeletePermission,
  getExportPermission,
} from "../../config/getColumns";
import // deleteMoreCategory,
"../../api/categoryAPI";
import { globalAlertType } from "../alert/alertType";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/providers/AuthProvider";

const ViewCategory = ({ categories, refetch }) => {
  const { category } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectionChange = (data) => {
    const ids = data?.map(({ id }) => id);
    setSelectedItems(ids);
  };

  // const { mutateAsync } = useMutation({
  //   mutationFn: deleteCategory,
  // });
  // function removeCategory(id) {
  //   Swal.fire({
  //     title: "Removing",
  //     text: "Do you want to remove ?",
  //     showCancelButton: true,
  //   }).then(({ isConfirmed }) => {
  //     if (isConfirmed) {
  //       mutateAsync(id, {
  //         onSettled: () => {
  //           queryClient.invalidateQueries(["category"]);
  //         },
  //         onSuccess: (data) => {
  //           customDispatch(globalAlertType("info", data));
  //         },
  //         onError: (error) => {
  //           customDispatch(globalAlertType("error", error));
  //         },
  //       });
  //     }
  //   });
  // }

  // const { mutateAsync: deleteMoreAsync } = useMutation({
  //   mutationFn: deleteMoreCategory,
  // });
  // function removeAllCategory() {
  //   Swal.fire({
  //     title: "Removing",
  //     text: "Do you want to remove all selected categories?",
  //     showCancelButton: true,
  //   }).then(({ isConfirmed }) => {
  //     if (isConfirmed) {
  //       deleteMoreAsync(selectedItems, {
  //         onSettled: () => {
  //           queryClient.invalidateQueries(["category"]);
  //         },
  //         onSuccess: (data) => {
  //           customDispatch(globalAlertType("info", data));
  //         },
  //         onError: (error) => {
  //           customDispatch(globalAlertType("error", error));
  //         },
  //       });
  //     }
  //   });
  // }

  const handleOpenViewCategory = (id) => {
    navigate(`/evoucher/${category}/${id}`);
  };

  // const { mutateAsync: disableCategoryMutateAsync } = useMutation({
  //   mutationFn: disableCategory,
  // });

  // const handleActivateCategory = (id, active) => {
  //   Swal.fire({
  //     title: active ? "Disabling Category" : "Activating Category",
  //     text: `Do you want to ${active ? "disable" : "activate"} category?`,
  //     showCancelButton: true,
  //   }).then(({ isConfirmed }) => {
  //     if (isConfirmed) {
  //       disableCategoryMutateAsync(
  //         {
  //           id,
  //           active: !active,
  //         },
  //         {
  //           onSettled: () => {
  //             queryClient.invalidateQueries(["category"]);
  //           },
  //           onSuccess: (data) => {
  //             customDispatch(globalAlertType("info", data));
  //           },
  //           onError: (error) => {
  //             customDispatch(globalAlertType("error", error));
  //           },
  //         }
  //       );
  //     }
  //   });
  // };

  // const IS_NEW_AVAILABLE = user?.permissions?.includes(
  //   getCreatePermission(category)
  // );
  // const IS_EDIT_AVAILABLE = user?.permissions?.includes(
  //   getEditPermission(category)
  // );
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
      onSelectionChange={handleSelectionChange}
      onRowClick={(e, data) => handleOpenViewCategory(data?.id)}
    />
  );
};

export default ViewCategory;
