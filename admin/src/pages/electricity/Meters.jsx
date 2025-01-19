import { Stack } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { METERS_COLUMNS } from "../../mocks/columns";
import { useQuery } from "@tanstack/react-query";
import CustomTotal from "../../components/custom/CustomTotal";
import CustomTitle from "../../components/custom/CustomTitle";
import { getAllMeters } from "../../api/meterAPI";
import { useContext } from "react";
import { AuthContext } from "../../context/providers/AuthProvider";

function Meters() {
  const { user } = useContext(AuthContext);

  const meters = useQuery({
    queryKey: ["meters"],
    queryFn: () => getAllMeters(),
    enabled: !!user?.id,
  });

  return (
    <>
      <CustomTitle
        title="Prepaid Meter"
        subtitle="Keep track of prepaid meters available on your system at everytime!"
        icon={<AccessTimeIcon sx={{ width: 50, height: 50 }} color="primary" />}
      />
      <CustomizedMaterialTable
        title="Available Meters"
        subtitle="This list contains all the meters on available"
        emptyMessage="No Meter found"
        search
        isLoading={meters.isLoading}
        columns={METERS_COLUMNS}
        data={meters.data}
        showExportButton={true}
        onRefresh={meters.refetch}
        autocompleteComponent={
          <Stack
            width="100%"
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "left", md: "center" }}
            spacing={2}
            mb={2}
          >
            <CustomTotal title="meters" total={meters?.data?.length} />
          </Stack>
        }
      />
    </>
  );
}

export default Meters;
