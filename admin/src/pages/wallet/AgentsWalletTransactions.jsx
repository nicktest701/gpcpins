import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  IconButton,
  Stack,
  TextField,
  Box,
  ListItemText,
  Alert,
} from "@mui/material";
import {
  ArrowBackRounded,
  NoteAlt,
  NoteRounded,
  RefreshRounded,
} from "@mui/icons-material";
import { AuthContext } from "../../context/providers/AuthProvider";
import moment from "moment";
import _ from "lodash";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateRandomCode } from "../../config/generateRandomCode";
import CustomTitle from "../../components/custom/CustomTitle";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import {
  geAllAgentWalletTransaction,
  geAllAgentWalletTransactionReport,
} from "../../api/transactionAPI";
import { currencyFormatter } from "../../constants";
import CustomDateRangePicker from "../../components/pickers/CustomDateRangePicker";
import { WALLET_TRANSACTIONS } from "../../mocks/columns";

function AgentsWalletTransactions() {
  const { user } = useContext(AuthContext);
  const [openPicker, setOpenPicker] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date("2024-01-01"),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  //Get all transactions by meter id
  const transactions = useQuery({
    queryKey: ["agents-wallet-transactions"],
    queryFn: () => geAllAgentWalletTransaction(date[0]),
    enabled: !!user?.id,
    initialData: [],
  });

  const resetDateRange = () =>
    setDate([
      {
        startDate: new Date("2024-01-01"),
        endDate: new Date(),
        key: "selection",
      },
    ]);

  const { mutateAsync, isLoading, isSuccess, isError, data } = useMutation({
    mutationFn: geAllAgentWalletTransactionReport,
  });
  const generateReport = () => {
    mutateAsync(date[0]);
  };
  const result = isLoading || isError || isSuccess;
  return (
    <div>
      <Link to={`/wallets?WMnmli=${generateRandomCode(200)}`}>
        <IconButton>
          <ArrowBackRounded />
        </IconButton>
      </Link>
      <>
        <CustomTitle
          icon={<NoteAlt sx={{ width: 50, height: 50 }} color="primary" />}
          title="Agent Wallet Transactions"
          subtitle="Manage all your wallet transactions made by agents "
        />

        {result && (
          <Alert severity={isLoading ? "info" : isError ? "error" : "success"}>
            {isLoading ? (
              "Generating Report.Please Wait..."
            ) : isError ? (
              "Report Generation failed.An error has occurred"
            ) : (
              <>
                {data === "No data found" ? (
                  "No transactional report found !"
                ) : (
                  <>
                    A copy of the report has been sent to your email. Download
                    or View Report{"  "}
                    <a href={data} target="_blank" rel="noreferrer">
                      here
                    </a>
                  </>
                )}
              </>
            )}
          </Alert>
        )}
        <CustomizedMaterialTable
          isLoading={transactions.isLoading}
          title="Transactions"
          search={true}
          columns={WALLET_TRANSACTIONS("agents")}
          data={transactions.data}
          showExportButton
          emptyMessage="No Transaction available"
          icon={<NoteAlt sx={{ width: 40, height: 40 }} color="primary" />}
          onRefresh={transactions.refetch}
          autocompleteComponent={
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Stack direction="row" sx={{ position: "relative" }}>
                <TextField
                  label="Select Date Range"
                  size="small"
                  sx={{
                    borderRadius: 0,
                    width: 250,
                  }}
                  onClick={() => setOpenPicker(true)}
                  value={`${moment(date[0].startDate).format("ll")} -${moment(
                    date[0].endDate
                  ).format("ll")}`}
                  InputProps={{
                    readOnly: true,
                  }}
                  inputProps={{
                    style: { cursor: "pointer" },
                  }}
                />
                <RefreshRounded
                  onClick={resetDateRange}
                  sx={{ position: "absolute", right: 8, top: 8 }}
                />
              </Stack>
              <LoadingButton
                variant="contained"
                endIcon={<NoteRounded />}
                onClick={generateReport}
                loading={isLoading}
              >
                {isLoading
                  ? "Generating Report.Please Wait..."
                  : " Generate Report"}
              </LoadingButton>

              <ListItemText
                primary={currencyFormatter(
                  _.sumBy(transactions.data, (item) => Number(item?.amount))
                )}
                primaryTypographyProps={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  // textAlign:'right'
                }}
                secondary="Total Amount"
                secondaryTypographyProps={{ color: "secondary" }}
                sx={{
                  flex: 1,
                  textAlign: "right",
                }}
              />
            </Box>
          }
          options={{
            exportAllData: true,
            exportButton: user?.permissions?.includes(
              "Export agent wallet Transaction"
            ),
          }}
        />
        <CustomDateRangePicker
          open={openPicker}
          setOpen={setOpenPicker}
          date={date}
          setDate={setDate}
          refetchData={transactions.refetch}
        />
      </>
    </div>
  );
}

export default AgentsWalletTransactions;
