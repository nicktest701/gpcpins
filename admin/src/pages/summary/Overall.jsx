import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  BarChartRounded,
  BoltRounded,
  DataArray,
  PaymentRounded,
  PhoneInTalk,
  RefreshRounded,
  SearchRounded,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import ItemCard from "../../components/custom/ItemCard";
import CustomCard from "../../components/custom/CustomCard";
import PieChart from "../../components/charts/PieChart";
import PlainTable from "../../components/tables/PlainTable";
import BarChart from "../../components/charts/BarChart";
import { getTotalSales } from "../../api/transactionAPI";
import LineChart from "../../components/charts/LineChart";
import { useTheme } from "@emotion/react";
import { recentTransactionColumns } from "../../mocks/columns";
import PayLoading from "../../components/PayLoading";
import CustomTitle from "../../components/custom/CustomTitle";
import { currencyFormatter, IMAGES } from "../../constants";
import CountUp from "react-countup";
import CustomStepper from "../../components/custom/CustomStepper";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/providers/AuthProvider";
import {
  getPOS_Balance,
  getPREPAID_Balance,
  getTopUpBalance,
} from "../../api/paymentAPI";

function Overall() {
  const { user } = useContext(AuthContext);
  const [showAlert, setShowAlert] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const { palette } = useTheme();
  const navigate = useNavigate();
  const summary = useQuery({
    queryKey: ["total-sales"],
    queryFn: () => getTotalSales(),
  });

  const balance = useQuery({
    queryKey: ["top-up-balance"],
    queryFn: () => getTopUpBalance(),
    initialData: 0.0,
    enabled: !!user?.id,
    retry: 1,
  });
  const posBalance = useQuery({
    queryKey: ["hb-pos-balance"],
    queryFn: () => getPOS_Balance(),
    initialData: 0.0,
    enabled: !!user?.id,
    retry: 1,
  });
  const prepaidBalance = useQuery({
    queryKey: ["hb-prepaid-balance"],
    queryFn: () => getPREPAID_Balance(),
    initialData: 0.0,
    enabled: !!user?.id,
    retry: 1,
  });

  if (summary?.isLoading) {
    return <PayLoading />;
  }

  const handleOnSearchClicked = () => {
    navigate(
      `/summary/transactions?YixHy=a34cdd3543&_pid=423423&1=&_search=${searchValue}`
    );
  };

  const handlOnChange = (e) => {
    // startTransition(() => {
    setSearchValue(e.target?.value);
    // });
  };

  return (
    <>
      {!balance.isLoading && Number(balance?.data) < 1000 && showAlert && (
        <Alert
          variant="filled"
          severity="warning"
          sx={{ mt: 2, py: 2, borderRadius: 0, color: "#fff" }}
          onClose={() => setShowAlert(false)}
        >
          Your one-4-all top up account balance is running low.Your remaining
          balance is {currencyFormatter(balance?.data)} . Please recharge to
          avoid any inconveniences.
        </Alert>
      )}
      {Number(prepaidBalance?.data) < 1000 && showAlert && (
        <Alert
          variant="filled"
          severity="warning"
          sx={{ mt: 2, py: 2, borderRadius: 0, color: "#fff" }}
          onClose={() => setShowAlert(false)}
        >
          Your Hubtel Prepaid balance is running low.Your remaining balance is{" "}
          {currencyFormatter(prepaidBalance?.data)} .Please note that refund
          cannot be completed with low prepaid balance.
        </Alert>
      )}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          py: 2,
        }}
      >
        <Box py={3}>
          <Typography variant="h3" textAlign="right">
            Welcome,{user?.firstname}
          </Typography>
          <Typography textAlign="right">
            Your current dashboard for today!
          </Typography>
        </Box>
        <Avatar
          alt="wave_hand"
          src={IMAGES.hand}
          style={{ width: "48px", height: "48px" }}
          variant="square"
        />
      </Box>

      <CustomTitle
        title="Dashboard"
        titleVariant="h2"
        subtitle="Powerful Transactions: Elevate Your Experience with Tickets, Vouchers, and Prepaid Units"
        // icon={<BarChart sx={{ width: 50, height: 50 }} color='primary' />}
      />
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          // borderRadius: "25px",
          border: "1px solid lightgray",
          backgroundColor: "whitesmoke",
          overflow: "hidden",
          pl: 2,
        }}
      >
        <input
          placeholder="Search for transactions..."
          onChange={handlOnChange}
          value={searchValue}
          style={{
            width: "100%",
            border: "none",
            backgroundColor: "transparent",
            color: "var(--primary) !important",
            // color:'#000 !important',
            fontSize: "18px",
            outline: "none",
          }}
        />
        <Button
          variant="contained"
          onClick={handleOnSearchClicked}
          disabled={searchValue === ""}
        >
          <SearchRounded />
        </Button>
      </Stack>
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
        <CustomCard title="Account Balance">
          <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
            {/* top up balance  */}
            <Box py={4}>
              <Typography variant="h4">
                <b>ONE4ALL Top Up Balance: </b>
                <i style={{ color: "var(--secondary)" }}>
                  {currencyFormatter(balance?.data)}
                </i>
              </Typography>
              <Divider />
              <Typography variant="body2">
                Available wallet balance in your one 4 all account
              </Typography>
            </Box>
            {/* POS Balance  */}
            <Box py={4}>
              <Typography variant="h4">
                <b>HUBTEL POS Balance: </b>
                <i style={{ color: "var(--secondary)" }}>
                  {currencyFormatter(posBalance?.data)}
                </i>
              </Typography>
              <Divider />
              <Typography variant="body2">POS Sales Balance</Typography>
            </Box>
            {/* PREPAID Balance  */}
            <Box py={4}>
              <Typography variant="h4">
                <b>HUBTEL PREPAID Balance: </b>
                <i style={{ color: "var(--secondary)" }}>
                  {currencyFormatter(prepaidBalance?.data)}
                </i>
              </Typography>
              <Divider />
              <Typography variant="body2">Prepaid Deposit Balance</Typography>
            </Box>
          </Stack>
        </CustomCard>

        <AnimatedContainer delay={0.2}>
          <CustomCard title="Total Sales">
            <ItemCard
              title="Total"
              icon={<BarChartRounded htmlColor="rgb(0, 20, 34)" />}
              value={
                <CountUp
                  start={0}
                  end={summary?.data?.totalSales?.total ?? 0}
                  prefix="GHS "
                  decimals={2}
                />
              }
              bg={"rgba(0, 20, 34,.2)"}
            />

            <ItemCard
              title="Voucher & Tickets"
              icon={<PaymentRounded color="secondary" />}
              value={
                <CountUp
                  start={0}
                  end={summary?.data?.totalSales?.voucher ?? 0}
                  prefix="GHS "
                  decimals={2}
                />
              }
              bg={"rgba(255, 126, 5,.2)"}
            />

            <ItemCard
              title="Prepaid Units"
              icon={<BoltRounded color="info" />}
              value={
                <CountUp
                  start={0}
                  end={summary?.data?.totalSales?.ecg ?? 0}
                  prefix="GHS "
                  decimals={2}
                  enableScrollSpy={true}
                />
              }
            />

            <ItemCard
              title="Airtime"
              icon={<PhoneInTalk htmlColor="rgba(12, 126, 5)" />}
              value={
                <CountUp
                  start={0}
                  end={summary?.data?.totalSales?.airtime ?? 0}
                  prefix="GHS "
                  decimals={2}
                  enableScrollSpy={true}
                />
              }
              bg={"rgba(12, 126, 5,.2)"}
            />
            <ItemCard
              title="Data Bundle"
              icon={<DataArray htmlColor="rgba(240, 1, 5)" />}
              value={
                <CountUp
                  start={0}
                  end={summary?.data?.totalSales?.bundle ?? 0}
                  prefix="GHS "
                  decimals={2}
                  enableScrollSpy={true}
                />
              }
              bg={"rgba(240, 1, 5,.2)"}
            />
          </CustomCard>
        </AnimatedContainer>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <AnimatedContainer delay={0.3}>
                <CustomCard title="Recent Transactions">
                  <PlainTable
                    isLoading={summary.isLoading}
                    columns={recentTransactionColumns}
                    data={summary?.data?.recents}
                    options={{
                      paging: false,
                    }}
                  />
                </CustomCard>
              </AnimatedContainer>
            </Grid>

            <Grid item xs={12} md={5}>
              <AnimatedContainer delay={0.4}>
                <CustomCard title="Total Sales Count">
                  <PieChart
                    labels={summary?.data?.totalCount?.labels}
                    data={summary?.data?.totalCount?.data}
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
                <CustomCard title="Today Sales ">
                  <Stack
                    py={2}
                    justifyContent="center"
                    alignItems="center"
                    spacing={4}
                  >
                    <ItemCard
                      title="Vouchers & Tickets"
                      icon={<PaymentRounded htmlColor="rgb(255, 126, 5)" />}
                      value={
                        <CountUp
                          start={0}
                          end={summary?.data?.today?.voucher ?? 0}
                          prefix="GHS "
                          decimals={2}
                        />
                      }
                    />

                    <ItemCard
                      title="Prepaid Units"
                      icon={<BoltRounded color="info" />}
                      // value={summary?.data?.today?.ecg}
                      value={
                        <CountUp
                          start={0}
                          end={summary?.data?.today?.ecg ?? 0}
                          prefix="GHS "
                          decimals={2}
                        />
                      }
                      bg="rgba(255, 126, 5,.2)"
                    />
                    <ItemCard
                      title="Airtime Transfers"
                      icon={<PhoneInTalk htmlColor="rgb(12, 126, 5)" />}
                      // value={summary?.data?.today?.ecg}
                      value={
                        <CountUp
                          start={0}
                          end={summary?.data?.today?.airtime ?? 0}
                          prefix="GHS "
                          decimals={2}
                        />
                      }
                      bg="rgba(12, 126, 5,.2)"
                    />
                    <ItemCard
                      title="Data Bundle"
                      icon={<DataArray htmlColor="rgba(240, 1, 5)" />}
                      // value={summary?.data?.today?.ecg}
                      value={
                        <CountUp
                          start={0}
                          end={summary?.data?.today?.bundle ?? 0}
                          prefix="GHS "
                          decimals={2}
                        />
                      }
                      bg={"rgba(240, 1, 5,.2)"}
                    />
                  </Stack>
                </CustomCard>
              </AnimatedContainer>
            </Grid>

            <Grid item xs={12} md={8}>
              <AnimatedContainer delay={0.6}>
                <CustomCard title="Total Sales for Last 7 Days (GHS)">
                  <LineChart
                    height={300}
                    labels={summary?.data?.sevenDays?.labels}
                    datasets={[
                      {
                        label: "Vouchers & Tickets",
                        data: summary?.data?.sevenDays?.voucher?.data ?? [],
                        borderColor: palette.warning.main,
                        tension: 0.3,
                      },
                      {
                        label: "Prepaid Units",
                        data: summary?.data?.sevenDays?.ecg?.data ?? [],
                        borderColor: palette.info.main,
                        tension: 0.3,
                      },
                      {
                        label: "Airtime Units",
                        data: summary?.data?.sevenDays?.airtime?.data ?? [],
                        borderColor: palette.success.main,
                        tension: 0.3,
                      },
                      {
                        label: "Data Bundle",
                        data: summary?.data?.sevenDays?.bundle?.data ?? [],
                        borderColor: palette.error.main,
                        tension: 0.3,
                      },
                    ]}
                  />
                </CustomCard>
                <div style={{ marginTop: "16px" }}>
                  <CustomCard title="Activity Log">
                    <Grid item xs={12} md={8} mt={2}>
                      <CustomStepper logs={summary?.data?.logs} />
                    </Grid>
                  </CustomCard>
                </div>
              </AnimatedContainer>
            </Grid>
          </Grid>
        </div>
        <AnimatedContainer delay={0.7}>
          <CustomCard title="Cummulative Transactions by Months (GHS)">
            <BarChart
              labels={summary?.data?.transactionByMonth?.labels}
              datasets={[
                {
                  label: "Vouchers & Tickets",
                  data: summary?.data?.transactionByMonth?.voucher?.data ?? [],
                  backgroundColor: palette.secondary.main,
                  barThickness: 20,
                  borderRadius: 2,
                },
                {
                  label: "Prepaid Units",
                  data: summary?.data?.transactionByMonth?.ecg?.data ?? [],
                  backgroundColor: palette.info.main,
                  barThickness: 20,
                  borderRadius: 2,
                },
                {
                  label: "Airtime Transfers",
                  data: summary?.data?.transactionByMonth?.airtime?.data ?? [],
                  backgroundColor: palette.success.main,
                  barThickness: 20,
                  borderRadius: 2,
                },
                {
                  label: "Data Bundle",
                  data: summary?.data?.transactionByMonth?.bundle?.data ?? [],
                  backgroundColor: palette.error.main,
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
