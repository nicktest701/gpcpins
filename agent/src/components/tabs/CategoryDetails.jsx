import { ArrowBack, ArrowDropDown } from "@mui/icons-material";
import {
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getCategory } from "../../api/categoryAPI";
import PayLoading from "../PayLoading";
import { getVoucherDetails } from "../../api/voucherAPI";
import { currencyFormatter } from "../../constants";
import moment from "moment";
import MainDropdown from "../dropdowns/MainDropdown";
import Active from "../Active";

function CategoryDetails() {
  const { category, id } = useParams();
  const queryClient = useQueryClient();

  const isTicket = ["cinema", "stadium", "bus"];

  const info = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["category"])
      ?.filter((item) => item?._id === id),
    enabled: !!id,
  });

  const vouchers = useQuery({
    queryKey: ["voucher", category, id],
    queryFn: () => getVoucherDetails(id),
    enabled: !!category && !!id,
  });

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
    <Container maxWidth="md">
      <IconButton>
        <Link to={-1} style={{ color: "var(--primary)" }}>
          <ArrowBack />
        </Link>
      </IconButton>

      <Paper elevation={0} sx={{ position: "relative", p: 2, my: 5 }}>
        <Typography variant="h3" color="warning.main">
          {info?.data?.voucherType}
        </Typography>
        {category === "university" && (
          <Typography variant="body1">
            {info?.data?.details?.formType}
          </Typography>
        )}
        {!["cinema", "stadium"].includes(category) && (
          <Typography variant="h4">
            {currencyFormatter(info?.data?.price)}
          </Typography>
        )}

        <Active
          active={info?.data?.active}
          style={{
            position: "absolute",
            top: 30,
            right: 30,
          }}
        />

        {["cinema", "waec", "stadium"].includes(category) && (
          <>
            <Button
              variant="outlined"
              className="dropdown-trigger"
              sx={{
                position: "relative",
                mt: 3,
                borderRadius: 1,
              }}
              endIcon={<ArrowDropDown />}
            >
              Pricing
              <MainDropdown>
                <List>
                  {info?.data?.details?.pricing?.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={`${item.type} ${["cinema", "waec", "stadium"].includes(category)?'ticket':'checker'}`}
                        primaryTypographyProps={{
                          color: "primary.main",
                          fontWeight: "bolder",
                          fontSize: 13,
                        }}
                        secondary={currencyFormatter(item?.price)}
                        secondaryTypographyProps={{ fontSize: 12 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </MainDropdown>
            </Button>
          </>
        )}

        <Typography variant="body1" textAlign="right" fontStyle='italic' fontWeight='bold'>
          Created on -{moment(info?.data?.createdAt).format("lll")}
        </Typography>
      </Paper>
      <Typography
        sx={{
          backgroundColor: "primary.main",
          color: "#fff",
          p: 1,
          mb: 5,
        }}
        paragraph
      >
        Voucher/Tickets Information
      </Typography>
      <Paper elevation={0} sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }}>
          <ListItemText
            primary={vouchers?.data?.new}
            secondary="New"
            secondaryTypographyProps={{ color: "warning.main" }}
          />
          <ListItemText
            primary={vouchers?.data?.sold}
            secondary="Sold"
            secondaryTypographyProps={{ color: "warning.main" }}
          />
          {isTicket.includes(category) && (
            <>
              {" "}
              <ListItemText
                primary={vouchers?.data?.used}
                secondary="Used"
                secondaryTypographyProps={{ color: "warning.main" }}
              />
              <ListItemText
                primary={vouchers?.data?.expired}
                secondary="Expired"
                secondaryTypographyProps={{color:'warning.main'}}
              />
            </>
          )}
        </Stack>
        <Divider />
        <Typography
          variant="h3"
          textAlign="right"
          width="100%"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <span> TOTAL</span>{" "}
          <b style={{ color: "var(--secondary)" }}>{vouchers?.data?.total}</b>
        </Typography>
      </Paper>
    </Container>
  );
}

export default CategoryDetails;
