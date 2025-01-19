import { Button, Grid, Stack, useTheme } from "@mui/material";
import CountUp from "react-countup";
import ItemCard from "../../components/custom/ItemCard";
import { NotesOutlined, RefreshRounded } from "@mui/icons-material";
import CustomCard from "../../components/custom/CustomCard";
import LineChart from "../../components/charts/LineChart";
import PieChart from "../../components/charts/PieChart";

import PlainTable from "../../components/tables/PlainTable";
import BarChart from "../../components/charts/BarChart";
import { getProductsTransaction } from "../../api/transactionAPI";
import { useQuery } from "@tanstack/react-query";
import { recentTransactionColumns, topSoldColumns } from "../../mocks/columns";
import LoadingSpinner from "../../components/spinners/LoadingSpinner";
import CustomTitle from "../../components/custom/CustomTitle";

function Products() {
  const { palette } = useTheme();
  const summary = useQuery({
    queryKey: ["products-summary"],
    queryFn: () => getProductsTransaction(),
  });

  return (
    <>
      <CustomTitle
        title="Vouchers & Tickets"
        subtitle="View history and data about purchased vouchers and tickets for various services effortlessly."
        icon={<BarChart sx={{ width: 50, height: 50 }} color="primary" />}
      />

      <Stack spacing={6}>
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

        <CustomCard title="Available Category">
          <ItemCard
            title="Total"
            icon={<NotesOutlined htmlColor="rgba(12, 126, 5)" />}
            value={summary.data?.category?.total}
            // bg='rgba(12, 126, 5)'
            bg={"rgba(12, 126, 5,.3)"}
          />
          <ItemCard
            title="Vouchers"
            icon={<NotesOutlined color="info" />}
            value={<CountUp start={0} end={summary.data?.category?.voucher} />}
            bg="info.light"
          />

          <ItemCard
            title="Tickets"
            icon={<NotesOutlined color="warning" />}
            value={<CountUp start={0} end={summary.data?.category?.ticket} />}
            bg="warning.light"
          />
        </CustomCard>

        <CustomCard title=" Available Pins & Serials">
          <ItemCard
            title="Total"
            icon={<NotesOutlined />}
            value={<CountUp start={0} end={summary.data?.pin?.total} />}
          />

          <ItemCard
            title="Vouchers"
            icon={<NotesOutlined />}
            value={<CountUp start={0} end={summary.data?.pin?.voucher} />}
          />

          <ItemCard
            title="Tickets"
            icon={<NotesOutlined />}
            value={<CountUp start={0} end={summary.data?.pin?.ticket} />}
          />
        </CustomCard>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <CustomCard title="Todays Transactions">
            <ItemCard
              title="Total"
              icon={<NotesOutlined color="info" />}
              value={summary.data?.today?.total}
            />

            <ItemCard
              title="Vouchers"
              icon={<NotesOutlined />}
              value={summary.data?.today?.voucher}
            />

            <ItemCard
              title="Tickets"
              icon={<NotesOutlined />}
              value={summary.data?.today?.ticket}
            />
          </CustomCard>

          <CustomCard title="Yesterday Transactions">
            <ItemCard
              title="Total"
              icon={<NotesOutlined color="info" />}
              value={summary.data?.yesterday?.total}
            />

            <ItemCard
              title="Vouchers"
              icon={<NotesOutlined />}
              value={summary.data?.yesterday?.voucher}
            />

            <ItemCard
              title="Tickets"
              icon={<NotesOutlined />}
              value={summary.data?.yesterday?.ticket}
            />
          </CustomCard>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={9} lg={6}>
              <CustomCard title="Total Sales for Last 7 days">
                <LineChart
                  labels={summary?.data?.lastSevenDays?.labels}
                  datasets={[
                    {
                      label: "Vouchers",
                      data: summary?.data?.lastSevenDays?.voucher ?? [],
                      borderColor: palette.info.main,
                      tension: 0.3,
                    },
                    {
                      label: "Tickets",
                      data: summary?.data?.lastSevenDays?.ticket ?? [],
                      borderColor: palette.secondary.main,
                      tension: 0.3,
                    },
                  ]}
                />
              </CustomCard>
            </Grid>

            <Grid item xs={12} sm={12} md={3} lg={3}>
              <CustomCard title="Voucher Status">
                <PieChart
                  height={200}
                  labels={["New", "Sold"]}
                  data={summary?.data?.grouped?.voucher}
                />
              </CustomCard>
            </Grid>
            <Grid item xs={12} sm={12} md={3} lg={3}>
              <CustomCard title="Ticket Status">
                <PieChart
                  height={200}
                  labels={["New", "Sold", "Used"]}
                  data={summary?.data?.grouped?.ticket}
                />
              </CustomCard>
            </Grid>
          </Grid>
        </Stack>
        <CustomCard title="Recent Transactions">
          <PlainTable
            isLoading={summary.isLoading}
            columns={recentTransactionColumns}
            data={summary?.data?.recent?.voucher}
            options={{
              paging: false,
            }}
          />
        </CustomCard>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          <CustomCard title="Top Selling Vouchers">
            <PlainTable
              columns={topSoldColumns}
              data={summary?.data?.topSold?.voucher}
              options={{
                paging: false,
              }}
            />
          </CustomCard>

          <CustomCard title="Top Selling Tickets">
            <PlainTable
              columns={topSoldColumns}
              data={summary?.data?.topSold?.ticket}
              options={{
                paging: false,
              }}
            />
          </CustomCard>
        </Stack>

        <CustomCard title="Sales by Month in (GHS)">
          <BarChart
            labels={summary?.data?.thisYear?.labels}
            datasets={[
              {
                label: "Vouchers",
                data: summary?.data?.thisYear?.voucher ?? [],
                backgroundColor: palette.info.main,
                barThickness: 20,
                borderRadius: 2,
              },
              {
                label: "Tickets",
                data: summary?.data?.thisYear?.ticket ?? [],
                backgroundColor: palette.secondary.main,
                barThickness: 20,
                borderRadius: 2,
              },
            ]}
          />
        </CustomCard>
        {summary?.isLoading && (
          <LoadingSpinner value="Loading Voucher & Ticket Transactions..." />
        )}
      </Stack>
    </>
  );
}

export default Products;
