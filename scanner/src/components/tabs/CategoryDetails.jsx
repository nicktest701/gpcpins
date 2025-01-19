import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import DataThresholdingIcon from "@mui/icons-material/DataThresholding";
import TagIcon from "@mui/icons-material/Tag";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getTicketByID } from "../../api/categoryAPI";
import PayLoading from "../PayLoading";
import { getVoucherDetails } from "../../api/voucherAPI";
import Active from "../Active";
import { getFormatttedCategory } from "../../config/getCategoryData";
import BarChart from "../charts/BarChart";
import CustomCard from "../custom/CustomCard";
import ItemCard from "../custom/ItemCard";
import { RECENTLY_SCANNED_TICKET_COLUMNS } from "../../mocks/columns";
import PlainTable from "../tables/PlainTable";
import coverImage from "../../assets/images/ticket.jpg";

function CategoryDetails() {
  const navigate = useNavigate();
  const { category, id } = useParams();
  const queryClient = useQueryClient();

  const info = useQuery({
    queryKey: ["category", id],
    queryFn: () => getTicketByID(id),
    initialData: queryClient
      .getQueryData(["categories", category])
      ?.find((item) => item?._id === id),
    enabled: !!id,
    select: (data) => {
      return getFormatttedCategory(data);
    },
  });

  const vouchers = useQuery({
    queryKey: ["voucher", category, id],
    queryFn: () => getVoucherDetails(id),
    enabled: !!category && !!id,
  });



  const goToAssignTickets = () => {
    navigate(`/tickets/${category}/${id}`);
  };

  if (info.isLoading) {
    return <PayLoading />;
  }

  if (info.isError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>{info.error}</Typography>
      </div>
    );
  }

  return (
    <Container>
      <IconButton>
        <Link to={-1} style={{ color: "var(--primary)" }}>
          <ArrowBack />
        </Link>
      </IconButton>

      <Paper elevation={0} sx={{ position: "relative", p: 2, my: 2 }}>
        <Typography variant="h4">
          {info?.data?.voucherType || info?.data?.journey}
        </Typography>
        {/* <Divider /> */}
        <Typography variant="body2" textTransform="uppercase" color="secondary">
          {info?.data?.details?.companyName}
        </Typography>

        <Active
          active={info?.data?.active}
          style={{
            position: "absolute",
            top: 30,
            right: 30,
          }}
        />
      </Paper>

      <div
        style={{
          background: `linear-gradient(to bottom ,transparent,rgba(0,0,0,0.7)),url(${
            info?.data?.profile|| info?.data?.logo || coverImage
          })`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          height: "30vh",
          padding: "16px",
          overflow: "hidden",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        {/* <Back color="primary" bg="primary.contrastText" /> */}
      </div>

      <Stack direction="row" justifyContent="flex-end" alignItems="center">
        <Button variant="contained" onClick={goToAssignTickets}>
          Assign Ticket
        </Button>
      </Stack>

      <Box pb={4}>
        <Typography variant="h4">Summary</Typography>
        <Typography variant="body2">
          A brief overview of your tickets.
        </Typography>
        <Divider />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 2,
          width: "100%",
          pb: 4,
        }}
      >
        <ItemCard
          title="Total"
          value={vouchers?.data?.total}
          icon={<TagIcon />}
        />
        <ItemCard title="New" value={vouchers?.data?.new} icon={<TagIcon />} />
        <ItemCard
          title="Sold "
          value={Number(vouchers?.data?.sold + vouchers?.data?.used) || 0}
          icon={<TagIcon />}
        />
        <ItemCard
          title="Scanned"
          value={vouchers?.data?.used}
          icon={<QrCodeScannerIcon />}
        />
        <ItemCard
          title="Unscanned"
          value={vouchers?.data?.sold}
          icon={<DataThresholdingIcon />}
        />
      </Box>

      <Stack spacing={2} pb={4}>
        <Typography variant="h4">Details</Typography>
        <Typography variant="body2">
          Here you&apos;ll find comprehensive information about your ticket.
        </Typography>
        <Divider />
        {info?.data?.category !== "bus" && (
          <CustomCard title="Types">
            <Typography color="success.dark">
              {vouchers?.data?.pricingTypes?.join(",")}
            </Typography>
          </CustomCard>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
            gap: 2,
          }}
        >
          <CustomCard title="Verifiers">
            <PlainTable
              columns={[
                { field: "verifierName", title: "Verifier" },
                {
                  field: "verifierId",
                  title: "",
                  width: "20%",
                  render: (data) => (
                    <Link to={`/verifiers/${data?.verifierId}`}>View</Link>
                  ),
                },
                // { field: "type", title: "Verifier" },
              ]}
              data={vouchers?.data?.verifiers}
              options={{
                paging: false,
              }}
            />
            {/* <RadarChart labels={labels} values={datasets} /> */}
          </CustomCard>
          {info?.data?.category !== "bus" && (
            <CustomCard title="Ticket Types Details">
              <BarChart
                labels={vouchers?.data?.ticketTypes?.labels}
                datasets={vouchers?.data?.ticketTypes?.datasets}
              />
            </CustomCard>
          )}
        </Box>
      </Stack>

      <Box pb={4} mt={4}>
        <Typography variant="h4">Recent</Typography>
        <Typography variant="body2">
          This section displays a list of tickets that have been recently
          scanned.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <PlainTable
          columns={RECENTLY_SCANNED_TICKET_COLUMNS}
          data={vouchers?.data?.recent}
        />
      </Box>
    </Container>
  );
}

export default CategoryDetails;
