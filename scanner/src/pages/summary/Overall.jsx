import {
  Button,
  Grid,
  Stack
} from "@mui/material";
import {
  BarChartRounded,
  PaymentRounded,
  RefreshRounded,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import ItemCard from "../../components/custom/ItemCard";
import CustomCard from "../../components/custom/CustomCard";
import PlainTable from "../../components/tables/PlainTable";
import BarChart from "../../components/charts/BarChart";
import { getTransactionSummary } from "../../api/transactionAPI";
import LineChart from "../../components/charts/LineChart";
import { useTheme } from "@emotion/react";
import { recentTransactionColumns } from "../../mocks/columns";
import PayLoading from "../../components/PayLoading";
import CustomTitle from "../../components/custom/CustomTitle";
import CountUp from "react-countup";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import HorizontalBarChart from "../../components/charts/HorizontalBarChart";
import { AuthContext } from "../../context/providers/AuthProvider";
import { useContext } from "react";

function Overall() {
  const { user } = useContext(AuthContext);
  const { palette } = useTheme();
  const summary = useQuery({
    queryKey: ["summary"],
    queryFn: user?.isAdmin
      ? () => getTransactionSummary("")
      : () => getTransactionSummary(user?.id),
    enabled: true,
  });

  if (summary?.isLoading) {
    return <PayLoading />;
  }

  return (
    <>
      {/* <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" textAlign="right">
            Welcome,
          </Typography>
          <Typography>Your current dashboard for today!</Typography>
        </Box>
        <Avatar
          alt="wave_hand"
          src={IMAGES.hand}
          style={{ width: "48px", height: "48px" }}
          variant="square"
        />
      </Box> */}

      <CustomTitle
        title="Dashboard"
        titleVariant="h3"
        subtitle="Powerful Transactions: Elevate Your Experience with Tickets, Vouchers, and Prepaid Units"
        // icon={<BarChartRounded sx={{ width: 50, height: 50 }} color='primary' />}
      />
      <div
        style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
      >
        <Button
          variant="contained"
          startIcon={<RefreshRounded />}
          onClick={summary.refetch}
          sx={{
            borderRadius: 1,
            my: 4,
          }}
        >
          Refresh
        </Button>
      </div>
      <Stack spacing={4}>
        <AnimatedContainer delay={0.2}>
          <CustomCard title="Tickets">
            <ItemCard
              title="Assigned Tickets"
              icon={<BarChartRounded htmlColor="rgb(0, 20, 34)" />}
              value={
                <CountUp start={0} end={summary?.data?.assignedTickets ?? 0} />
              }
              bg={"rgba(0, 20, 34,.2)"}
            />

            <ItemCard
              title="Verified Tickets"
              icon={<PaymentRounded color="secondary" />}
              value={
                <CountUp start={0} end={summary?.data?.scannedTickets ?? 0} />
              }
              bg={"rgba(255, 126, 5,.2)"}
            />
          </CustomCard>
        </AnimatedContainer>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <AnimatedContainer delay={0.3}>
                <CustomCard title="Recent Scans">
                  <PlainTable
                    isLoading={summary.isLoading}
                    columns={recentTransactionColumns}
                    data={summary?.data?.recentTransaction}
                    options={{
                      paging: false,
                      header: true,
                    }}
                  />
                </CustomCard>
              </AnimatedContainer>
            </Grid>

            <Grid item xs={12} md={5}>
              <AnimatedContainer delay={0.4}>
                <CustomCard title="Top Scanned Tickets">
                  <HorizontalBarChart
                    labels={summary?.data?.topScannedTickets?.labels}
                    datasets={[
                      {
                        label: "Tickets",
                        data: summary?.data?.topScannedTickets?.data ?? [],
                        backgroundColor: ["#031523"],
                        // tension: 0.3,
                        barThickness: 10,
                        borderRadius: 2,
                      },
                    ]}
                  />
                </CustomCard>
              </AnimatedContainer>
            </Grid>
          </Grid>
        </div>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <AnimatedContainer delay={0.5}>
                <CustomCard title="Today Scans ">
                  <Stack
                    py={2}
                    justifyContent="center"
                    alignItems="center"
                    spacing={4}
                  >
                    <ItemCard
                      // title="Vouchers & Tickets"
                      icon={<PaymentRounded htmlColor="rgb(255, 126, 5)" />}
                      value={
                        <CountUp
                          start={0}
                          end={summary?.data?.todayScannedTicket ?? 0}
                        />
                      }
                    />
                  </Stack>
                </CustomCard>
              </AnimatedContainer>
            </Grid>

            <Grid item xs={12} md={8}>
              <AnimatedContainer delay={0.6}>
                <CustomCard title="Total Scans for Last 7 Days">
                  <LineChart
                    height={300}
                    labels={summary?.data?.totalScanForLastSevenDays?.labels}
                    datasets={[
                      {
                        label: "Scanned Tickets",
                        data:
                          summary?.data?.totalScanForLastSevenDays?.data ?? [],
                        borderColor: palette.secondary.main,
                        tension: 0.3,
                      },
                    ]}
                  />
                </CustomCard>
              </AnimatedContainer>
            </Grid>
          </Grid>
          {/* <div style={{ marginTop: "16px" }}>
            <CustomCard title="Activity Log">
              <Grid item xs={12} md={8} mt={2}>
                <CustomStepper logs={summary?.data?.logs} />
              </Grid>
            </CustomCard>
          </div> */}
        </div>
        <AnimatedContainer delay={0.7}>
          <CustomCard title="Cummulative Scans by Months">
            <BarChart
              labels={summary?.data?.totalScanByMonth?.labels}
              datasets={[
                {
                  label: "Scanned Tickets",
                  data: summary?.data?.totalScanByMonth?.values ?? [],
                  backgroundColor: palette.secondary.main,
                  barThickness: 20,
                  borderRadius: 2,
                },
              ]}
            />
          </CustomCard>
        </AnimatedContainer>
      </Stack>
    </>
  );
}

export default Overall;
