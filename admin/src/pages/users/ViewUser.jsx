import { useContext } from "react";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import Swal from "sweetalert2";
import {  MenuItem } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ActionMenu from "../../components/menu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { Person2Rounded } from "@mui/icons-material";
import { deleteUser, getAllUsers } from "../../api/userAPI";
import { enableOrDisableAccount } from "../../api/userAPI";
import { USERS_COLUMNS } from "../../mocks/columns";
import transaction_empty from "../../assets/images/empty/transaction.svg";
import CustomTitle from "../../components/custom/CustomTitle";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { generateRandomCode } from "../../config/generateRandomCode";
import CustomTotal from "../../components/custom/CustomTotal";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";
import { AuthContext } from "../../context/providers/AuthProvider";

const ViewUser = () => {
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const users = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const {
    mutateAsync: toggleUserAccountMutateAsync,
    isLoading: toggleUserIsLoading,
  } = useMutation({
    mutationFn: enableOrDisableAccount,
  });

  function handleToggleUserAccount({ _id, active }) {
    Swal.fire({
      title: active ? "Disabling Account" : "Enabling account",
      text: active
        ? "Do you want to disable account?"
        : "Do you want to enable account?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        toggleUserAccountMutateAsync(
          { id: _id, active: !active },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["users"]);
              queryClient.invalidateQueries(["user-info"]);
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
  }

  //Remove user

  const { mutateAsync: deleteMutateAsync } = useMutation({
    mutationFn: deleteUser,
  });
  function handleRemoveUserAccount(id) {
    Swal.fire({
      title: "Removing Account",
      text: "Do you want to delete account?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteMutateAsync(
          { id },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["users"]);
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
  }

  //VIEW Agent Details
  const handleViewAgent = (id) => {
    navigate(`/users/details/${id}?zAmY=${generateRandomCode(50)}`);
  };

  const columns = [
    ...USERS_COLUMNS,
    {
      field: "",
      title: "Action",
      export: false,

      render: (rowData) => (
        <ActionMenu>
          <MenuItem
            sx={{ fontSize: 14 }}
            onClick={() => handleViewAgent(rowData?._id)}
          >
            View Account
          </MenuItem>

          {user?.permissions?.includes("Edit users") && (
            <MenuItem
              sx={{ fontSize: 14 }}
              onClick={() => handleToggleUserAccount(rowData)}
            >
              {rowData?.active ? " Disable Account" : "Activate Account"}
            </MenuItem>
          )}

          {user?.permissions?.includes("Delete users") && (
            <MenuItem
              sx={{ fontSize: 14 }}
              onClick={() => handleRemoveUserAccount(rowData?._id)}
            >
              Remove Account
            </MenuItem>
          )}
        </ActionMenu>
      ),
    },
  ];
  return (
    <>
      < >
        <CustomTitle
          title="Users Account"
          subtitle="Explore user profiles, account details, and other relevant information to better understand our user base."
          icon={
            <Person2Rounded sx={{ width: 50, height: 50 }} color="primary" />
          }
        />
        <CustomizedMaterialTable
          isLoading={users.isLoading}
          title="Users"
          subtitle="Manage  all users account."
          emptyIcon={transaction_empty}
          emptyMessage="No User Found"
          columns={columns}
          data={users.data}
          search={true}
          actions={[]}
          onRefresh={users.refetch}
          options={{
            exportAllData: true,
            exportButton: user?.permissions?.includes("Export users details"),
          }}
          autocompleteComponent={
            <CustomTotal title="TOTAL Users" total={users.data?.length} />
          }
        />
      </>
      {toggleUserIsLoading && <GlobalSpinner />}
    </>
  );
};

export default ViewUser;
