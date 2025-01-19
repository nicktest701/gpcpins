import {
  Button,
  Grid,
  TextField,
  MenuItem,
  useTheme,
  Box,
} from "@mui/material";
import {
  AirplaneTicketSharp,
  AllOut,
  NoteAltSharp,
  PointOfSaleSharp,
  RefreshRounded,
} from "@mui/icons-material";
import ItemCard from "../../components/custom/ItemCard";
import LineChart from "../../components/charts/LineChart";
import CustomCard from "../../components/custom/CustomCard";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import PlainTable from "../../components/tables/PlainTable";
import BarChart from "../../components/charts/BarChart";
import { useQuery } from "@tanstack/react-query";
import { getAirtimeANDBundleTransaction } from "../../api/transactionAPI";
import {
  recentTransactionColumns,
  topCustomersColumns,
} from "../../mocks/columns";
import PayLoading from "../../components/PayLoading";
import { useState } from "react";
import { currencyFormatter } from "../../constants";

function Airtime() {
  const { palette } = useTheme();
  const [type, setType] = useState("airtime");

  const summary = useQuery({
    queryKey: ["airtime-bundle-summary", type],
    queryFn: () => getAirtimeANDBundleTransaction(type),
    enabled: !!type,
    initialData: {
      recent: [],
      today: 0,
      yesterday: 0,
      lastSevenDaysTotal: 0,
      lastSevenDays: {
        labels: [""],
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      thisMonth: 0,
      thisYear: {
        labels: [""],
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      topCustomers: [],
      commission: 0,
    },
  });

  if (summary?.isLoading) {
    return <PayLoading />;
  }

  return (
    <AnimatedContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <TextField
          select
          label="Select Type"
          size="small"
          value={type}
          onChange={(e) => setType(e.target.value)}
          sx={{ width: 200, my: 2 }}
        >
          <MenuItem value="airtime">Airtime Transfers</MenuItem>
          <MenuItem value="bundle">Data Bundle</MenuItem>
        </TextField>
        <Button
          variant="contained"
          startIcon={<RefreshRounded />}
          onClick={summary.refetch}
          sx={{
            alignSelf: "flex-end",
            borderRadius: 1,
          }}
        >
          Refresh
        </Button>
        <Box>
          <CustomCard title={`${type} Transaction Summary`}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3} lg={3}>
                <ItemCard
                  title="Today"
                  icon={
                    <AllOut color={type === "airtime" ? "success" : "error"} />
                  }
                  value={currencyFormatter(summary?.data?.today)}
                  bg={
                    type === "airtime"
                      ? "rgba(12, 126, 5,.2)"
                      : "rgba(360, 1, 5,.2)"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3}>
                <ItemCard
                  title="Yesterday"
                  icon={
                    <AllOut color={type === "airtime" ? "success" : "error"} />
                  }
                  value={currencyFormatter(summary?.data?.yesterday)}
                  bg={
                    type === "airtime"
                      ? "rgba(12, 126, 5,.2)"
                      : "rgba(360, 1, 5,.2)"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3}>
                <ItemCard
                  title="Last 7 days"
                  icon={
                    <NoteAltSharp
                      color={type === "airtime" ? "success" : "error"}
                    />
                  }
                  value={currencyFormatter(summary?.data?.lastSevenDaysTotal)}
                  bg={
                    type === "airtime"
                      ? "rgba(12, 126, 5,.2)"
                      : "rgba(360, 1, 5,.2)"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3}>
                <ItemCard
                  title="This Month"
                  icon={
                    <AirplaneTicketSharp
                      color={type === "airtime" ? "success" : "error"}
                    />
                  }
                  value={currencyFormatter(summary?.data?.thisMonth)}
                  bg={
                    type === "airtime"
                      ? "rgba(12, 126, 5,.2)"
                      : "rgba(360, 1, 5,.2)"
                  }
                />
              </Grid>

              {type === "airtime" && (
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <ItemCard
                    title="Total Commission"
                    icon={
                      <PointOfSaleSharp
                        color={type === "airtime" ? "success" : "error"}
                      />
                    }
                    value={currencyFormatter(summary?.data?.commission)}
                    bg={
                      type === "airtime"
                        ? "rgba(12, 126, 5,.2)"
                        : "rgba(360, 1, 5,.2)"
                    }
                  />
                </Grid>
              )}
            </Grid>
          </CustomCard>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={12}>
            <CustomCard title={`Total ${type} Sales for Last 7 days in GHS`}>
              <LineChart
                labels={summary?.data?.lastSevenDays?.labels}
                datasets={[
                  {
                    label: `${type} Sales`,
                    data: summary?.data?.lastSevenDays?.data ?? [],
                    borderColor:
                      type === "airtime"
                        ? palette.success.main
                        : palette.error.main,
                    tension: 0.3,
                  },
                ]}
              />
            </CustomCard>
          </Grid>

          <Grid item xs={12} sm={12} md={5} lg={5}>
            <CustomCard title=" Top Customers">
              <PlainTable
                isLoading={summary.isLoading}
                columns={topCustomersColumns}
                data={summary?.data?.topCustomers}
                options={{
                  paging: false,
                }}
              />
            </CustomCard>
          </Grid>
          <Grid item xs={12} sm={12} md={7} lg={7}>
            <CustomCard title="Recent Transactions">
              <PlainTable
                isLoading={summary.isLoading}
                columns={recentTransactionColumns}
                data={summary?.data?.recent}
                options={{
                  paging: false,
                }}
              />
            </CustomCard>
          </Grid>
          <Grid item xs={12} sm={12}>
            <CustomCard title="Total Transaction by Month (GHS)">
              <BarChart
                labels={summary?.data?.thisYear?.labels}
                datasets={[
                  {
                    label: `${type} Transfer`,
                    data: summary?.data?.thisYear?.data ?? [],
                    backgroundColor:
                      type === "airtime"
                        ? palette.success.main
                        : palette.error.main,
                    barThickness: 20,
                    borderRadius: 2,
                  },
                ]}
              />
            </CustomCard>
          </Grid>
        </Grid>
      </Box>
    </AnimatedContainer>
  );
}

export default Airtime;
