import { useContext, useState } from "react";
import _ from "lodash";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MaterialTable, { MTableToolbar } from "material-table";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableIcons } from "../../config/tableIcons";
import { Add, DeleteRounded, Refresh } from "@mui/icons-material";
import { CustomContext } from "../../context/providers/CustomProvider";
import {
  getColumns,
  getCreatePermission,
  getDeletePermission,
  getEditPermission,
  getExportPermission,
} from "../../config/getColumns";
import {
  deleteCategory,
  deleteMoreCategory,
  disableCategory,
} from "../../api/categoryAPI";
import { globalAlertType } from "../alert/alertType";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ActionMenu from "../menu/ActionMenu";
import { Card, MenuItem } from "@mui/material";
import Active from "../Active";
import { AuthContext } from "../../context/providers/AuthProvider";

const ViewCategory = ({ categories, pageInfo, refetch }) => {
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

  const { mutateAsync } = useMutation({
    mutationFn: deleteCategory,
  });
  function removeCategory(id) {
    Swal.fire({
      title: "Removing",
      text: "Do you want to remove ?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(id, {
          onSettled: () => {
            queryClient.invalidateQueries(["category"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  }

  const { mutateAsync: deleteMoreAsync } = useMutation({
    mutationFn: deleteMoreCategory,
  });
  function removeAllCategory() {
    Swal.fire({
      title: "Removing",
      text: "Do you want to remove all selected categories?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteMoreAsync(selectedItems, {
          onSettled: () => {
            queryClient.invalidateQueries(["category"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  }

  const handleOpenViewCategory = (id) => {
    navigate(`/evoucher/${category}/${id}`);
  };
  const handleEditCategory = (id) => {
    const openEdit = `openEdit${_.capitalize(category)}Category`;
    customDispatch({
      type: openEdit,
      payload: {
        open: true,
        id,
      },
    });
  };

  const handleOpenCategory = () => {
    const openAdd = `openAdd${_.capitalize(category)}Category`;

    customDispatch({
      type: openAdd,
      payload: {
        open: true,
      },
    });
  };

  const { mutateAsync: disableCategoryMutateAsync } = useMutation({
    mutationFn: disableCategory,
  });

  const handleActivateCategory = (id, active) => {
    Swal.fire({
      title: active ? "Disabling Category" : "Activating Category",
      text: `Do you want to ${active ? "disable" : "activate"} category?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        disableCategoryMutateAsync(
          {
            id,
            active: !active,
          },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["category"]);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType("info", data));
            },
            onError: (error) => {
              customDispatch(globalAlertType("error", error));
            },
          }
        );
      }
    });
  };

  const IS_NEW_AVAILABLE = user?.permissions?.includes(
    getCreatePermission(category)
  );
  const IS_EDIT_AVAILABLE = user?.permissions?.includes(
    getEditPermission(category)
  );
  const IS_DELETE_AVAILABLE = user?.permissions?.includes(
    getDeletePermission(category)
  );
  const IS_EXPORT_AVAILABLE = user?.permissions?.includes(
    getExportPermission(category)
  );

  const modifiedColumns = [
    ...getColumns(category),
    {
      field: null,
      title: "Status",
      render: ({ id, active }) => (
        <Active
          active={active}
          handleOnClick={() => handleActivateCategory(id, active)}
        />
      ),
    },
    {
      field: "",
      title: "Action",
      export: false,
      render: ({ id }) => {
        return (
          <ActionMenu>
            <MenuItem
              sx={{ fontSize: 13 }}
              onClick={() => handleOpenViewCategory(id)}
            >
              View Details
            </MenuItem>
            {IS_EDIT_AVAILABLE && (
              <MenuItem
                sx={{ fontSize: 13 }}
                onClick={() => handleEditCategory(id)}
              >
                Edit
              </MenuItem>
            )}
            {/* {IS_DELETE_AVAILABLE && (
              <MenuItem
                sx={{ fontSize: 13 }}
                onClick={() => removeCategory(id)}
              >
                Remove
              </MenuItem>
            )} */}
          </ActionMenu>
        );
      },
    },
  ];

  const columns = modifiedColumns.map((column) => {
    return { ...column };
  });

  if (!category) {
    return <Navigate to="/" />;
  }

  return (
    <Card
      sx={{
        maxWidth: "85svw",
        marginInline: "auto",
        borderRadius: 0,
        bgcolor: "#fff",
        // overflowX:'hidden'
      }}
    >
      <MaterialTable
        title={pageInfo.category}
        icons={tableIcons}
        components={{
          Toolbar: (params) => {
            return (
              <>
                <MTableToolbar {...params} />
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                  py={4}
                >
                  {IS_NEW_AVAILABLE && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleOpenCategory}
                    >
                      New {pageInfo.category}
                    </Button>
                  )}
                </Box>
              </>
            );
          },
        }}
        // isLoading={categories.isLoading}
        columns={columns}
        data={categories.data}
        options={{
          paginationType: "stepped",
          searchFieldVariant: "outlined",
          searchFieldStyle: {
            borderRadius: "20px",
            fontSize: "13px",
            marginTop: "10px",
            marginRight: "20px",
            height: "40px",
          },
          exportAllData: true,
          exportButton: IS_EXPORT_AVAILABLE,
          selection: IS_DELETE_AVAILABLE,
          showSelectAllCheckbox: IS_DELETE_AVAILABLE,
          columnsButton: true,
          headerStyle: {
            backgroundColor: "whitesmoke",
            color: "secondary.main",
            textTransform: "uppercase",
            paddingBlock: "12px",
          },
        }}
        style={{
          padding: "12px",
          boxShadow: "none",
        }}
        actions={[
          {
            icon: () => <DeleteRounded />,
            position: "toolbarOnSelect",
            tooltip: "Delete all",
            onClick: removeAllCategory,
          },
          {
            icon: () => <Refresh />,
            position: "toolbar",
            tooltip: "Refresh",
            onClick: () => refetch(),
          },
        ]}
        onSelectionChange={handleSelectionChange}
      />
    </Card>
  );
};

export default ViewCategory;
