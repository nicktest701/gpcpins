import { useContext, useState } from "react";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { Button, Container, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import transaction_empty from "../../assets/images/empty/transaction.svg";

import { AddRounded, VerifiedUser } from "@mui/icons-material";
import { getAllEmployees } from "../../api/employeeAPI";
import { EMPLOYEES_COLUMNS } from "../../mocks/columns";

import NewEmployee from "./NewEmployee";
import CustomTitle from "../../components/custom/CustomTitle";
import ActionMenu from "../../components/menu/ActionMenu";
import CustomTotal from "../../components/custom/CustomTotal";
import { AuthContext } from "../../context/providers/AuthProvider";

const ViewEmployees = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openNewEmployee, setOpenNewEmployee] = useState(false);

  const employees = useQuery({
    queryKey: ["employees"],
    queryFn: ()=>getAllEmployees(),
  });

  const handleOpenNewEmployee = () => setOpenNewEmployee(true);

  const removeAllEmployees = () => {};

  //VIEW Employee Details
  const handleViewEmployee = (rowData) => {
    navigate(`/employees/${rowData?._id}`);
  };

  const columns = [
    ...EMPLOYEES_COLUMNS,
    {
      field: "",
      title: "Action",
      export: false,
      width: 40,
      render: (rowData) => (
        <ActionMenu>
          <MenuItem
            sx={{ fontSize: 14 }}
            onClick={() => handleViewEmployee(rowData)}
          >
            View Account
          </MenuItem>
        </ActionMenu>
      ),
    },
  ];

  return (
    <>
      <CustomTitle
        title="Employees"
        subtitle="Dive into employee details, staff information, and human resources data to effectively manage our team."
        icon={<VerifiedUser sx={{ width: 50, height: 50 }} color="primary" />}
      />

      <CustomizedMaterialTable
        isLoading={employees.isLoading}
        title="Employees Details"
        subtitle="Manage your employees information"
        emptyIcon={transaction_empty}
        emptyMessage="No Data Found!"
        columns={columns}
        data={employees.data}
        search={true}
        autocompleteComponent={
          <>
            {user?.permissions?.includes("Add new employees") && (
              <Button
                variant="contained"
                onClick={handleOpenNewEmployee}
                startIcon={<AddRounded />}
              >
                New Employee
              </Button>
            )}

            <CustomTotal title="EMPLOYEES" total={employees.data?.length} />
          </>
        }
        actions={[]}
        onRefresh={employees.refetch}
        onDeleteAll={removeAllEmployees}
        options={{
          exportAllData: true,
          exportButton: user?.permissions?.includes(
            "Export employees information"
          ),
        }}
      />

      <NewEmployee open={openNewEmployee} setOpen={setOpenNewEmployee} />
    </>
  );
};

export default ViewEmployees;
