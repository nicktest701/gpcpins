import CustomizedMaterialTable from "../../../components/tables/CustomizedMaterialTable";
import { Button, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import transaction_empty from "../../../assets/images/empty/transaction.svg";

import { AddRounded, Person } from "@mui/icons-material";
import { AGENTS_COLUMNS } from "../../../mocks/columns";
import CustomTitle from "../../../components/custom/CustomTitle";
import ActionMenu from "../../../components/menu/ActionMenu";
import { getAllAgents } from "../../../api/agentAPI";
import NewAgent from "./NewAgent";
import { generateRandomCode } from "../../../config/generateRandomCode";
import CustomTotal from "../../../components/custom/CustomTotal";
import { useContext } from "react";
import { AuthContext } from "../../../context/providers/AuthProvider";

const ViewAgents = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const agents = useQuery({
    queryKey: ["agents"],
    queryFn: () => getAllAgents(),
  });

  const handleOpenNewAgent = () => {
    setSearchParams((params) => {
      params.set("add_agent", true);
      return params;
    });
  };

  const removeAllAgents = () => {};

  //VIEW Agent Details
  const handleViewAgent = (id) => {
    navigate(`/airtime/agent/details/${id}?zAmY=${generateRandomCode(50)}`);
  };

  const columns = [
    ...AGENTS_COLUMNS,
    {
      field: "",
      title: "Action",
      export: false,
      width: 40,
      render: (rowData) => (
        <ActionMenu>
          <MenuItem onClick={() => handleViewAgent(rowData?._id)}>
            View Account
          </MenuItem>
        </ActionMenu>
      ),
    },
  ];

  return (
    <>
      <CustomTitle
        title="Agents"
        subtitle="Discover agent profiles, agency information, and sales representatives' details to optimize our distribution network."
        icon={<Person sx={{ width: 50, height: 50 }} color="secondary" />}
      />

      <CustomizedMaterialTable
        isLoading={agents.isLoading}
        title="Agents Account"
        subtitle="Manage your agents information."
        emptyIcon={transaction_empty}
        emptyMessage="No Recent Transactions"
        columns={columns}
        data={agents.data}
        search={true}
        autocompleteComponent={
          <>
            {user?.permissions?.includes("Add new agents") && (
              <Button
                variant="contained"
                onClick={handleOpenNewAgent}
                startIcon={<AddRounded />}
              >
                New Agent
              </Button>
            )}
            <CustomTotal title="Agents" total={agents.data?.length} />
          </>
        }
        actions={[]}
        onRefresh={agents.refetch}
        onDeleteAll={removeAllAgents}
        options={{
          exportAllData: true,
          exportButton: user?.permissions?.includes(
            "Export agents information"
          ),
        }}
      />
      <NewAgent />
    </>
  );
};

export default ViewAgents;
