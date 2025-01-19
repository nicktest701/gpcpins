import Add from "@mui/icons-material/Add";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MaterialTable, { MTableToolbar } from "material-table";
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { getVoucherByCategory, removeVoucher } from "../../api/voucherAPI";
import { tableIcons } from "../../config/tableIcons";
import { VOUCHER_COLUMNS, TICKETS_COLUMNS } from "../../mocks/columns";

import {
  Chip,
  FormControlLabel,
  IconButton,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { CustomContext } from "../../context/providers/CustomProvider";
import { DeleteRounded, Refresh } from "@mui/icons-material";
import { duplicateTickets } from "../../config/duplicateTickets";
import { globalAlertType } from "../alert/alertType";
import { getCategoryData } from "../../config/getCategoryData";
import { getMainCategory } from "../../api/categoryAPI";
import { useParams, useSearchParams } from "react-router-dom";
import LoadChecker from "../modals/LoadChecker";
import CustomTotal from "../custom/CustomTotal";
import {
  getDeletePinsPermission,
  getExportPinsPermission,
  getLoadPermission,
} from "../../config/getColumns";
import { AuthContext } from "../../context/providers/AuthProvider";

const LoadVoucher = () => {
  const { user } = useContext(AuthContext);
  const { category } = useParams();
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const [openLoadChecker, setOpenLoadChecker] = useState(false);
  const [checkerType, setCheckerType] = useState({
    id: "",
    voucherType: "",
  });
  const [voucherData, setVoucherData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortValue, setSortValue] = useState("all");

  const isTicket = ["bus", "cinema", "stadium"].includes(category);
  const isVoucher = ["waec", "university", "security"].includes(category);

  let modifiedvoucherTypeColumns = VOUCHER_COLUMNS.map((column) => {
    return { ...column };
  });

  if (isTicket) {
    modifiedvoucherTypeColumns = TICKETS_COLUMNS.map((column) => {
      return { ...column };
    });
  }

  const handleChangeDatatype = (value) => {
    setCheckerType(value);

    setSearchParams((params) => {
      params.set("_pid", value?.id);
      params.set("type", value?.voucherType);
      return params;
    });

    if (category === "bus") {
      customDispatch({
        type: "ticketDetails",
        payload: value?.details,
      });
    }
    if (["cinema", "stadium"].includes(category)) {
      const duplicates = duplicateTickets(value?.details?.pricing);
      customDispatch({
        type: "ticketDetails",
        payload: {
          quantity: value?.details?.quantity,
          duplicates,
        },
      });
    }
  };

  const categories = useQuery({
    queryKey: ["category", category],
    queryFn: () => getMainCategory(category),
    enabled: !!category,
    onSuccess: () => {
      if (checkerType?.id !== searchParams.get("_pid")) {
        setCheckerType({
          id: "",
          voucherType: "",
        });
      }
      setVoucherData([]);
    },
    select: (categories) => {
      if (_.isEmpty(categories)) {
        return [];
      }
      const options = getCategoryData(categories);

      const filtered = options.map((voucher) => {
        return {
          id: voucher?.id,
          voucherType: voucher?.voucherType,
          price: voucher?.price || 0,
          details: {
            pricing: voucher?.details?.pricing || [],
            noOfSeats: voucher?.details?.noOfSeats || 0,
            vehicleNo: voucher?.details?.vehicleNo || 0,
            quantity: voucher?.details?.quantity || 0,
          },
        };
      });

      return filtered;
    },
  });

  const vouchers = useQuery(
    ["voucher", category, checkerType?.id],
    () => getVoucherByCategory(category, checkerType?.id),
    {
      enabled: !!category && !!checkerType?.id,
      onSuccess: (vouchers) => {
        if (vouchers?.length > 0) {
          setVoucherData(vouchers);
          return;
        }
        setVoucherData([]);
      },
    }
  );

  const handleChangeSortValue = (event) => {
    const value = event.target.value;
    setSortValue(value);
    if (value === "all") {
      return;
    }
    const data = queryClient
      .getQueryData(["voucher", category, searchParams.get("_pid")])
      ?.filter(({ status }) => status === value);
    setVoucherData(data);
  };

  // const getUsedVouchers = () =>
  //   _.filter(
  //     vouchers?.data,
  //     ({ status, active }) => !active && ["sold", "used"].includes(status)
  //   )?.length;

  const handleOpenLoadCheckers = () => {
    if (
      category === "bus" &&
      checkerType?.details?.noOfSeats === voucherData?.length
    ) {
      Swal.fire({
        title: "Ticket Limit Reached!",
        text: "Expected tickets limit reached.No more tickets can be loaded again!",
      });
      return;
    }
    if (
      ["stadium", "cinema"].includes(category) &&
      checkerType?.details?.quantity === voucherData?.length
    ) {
      Swal.fire({
        title: "Ticket Limit Reached!",
        text: "Expected tickets limit reached.No more tickets can be loaded again!",
      });
      return;
    }
    setOpenLoadChecker(true);
  };

  const handleSelectionChange = (data) => {
    const ids = data?.map(({ _id }) => _id);
    setSelectedItems(ids);
  };

  const { mutateAsync: deleteMoreAsync } = useMutation({
    mutationFn: removeVoucher,
  });

  function removeVouchers() {
    Swal.fire({
      title: "Removing",
      text: "Do you want to remove all selected vouchers?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteMoreAsync(selectedItems, {
          onSettled: () => {
            queryClient.invalidateQueries([
              "voucher",
              category,
              searchParams?.get("_pid"),
            ]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  }

  const IS_LOAD_AVAILABLE = user?.permissions?.includes(
    getLoadPermission(category)
  );
  const IS_DELETE_AVAILABLE = user?.permissions?.includes(
    getDeletePinsPermission(category)
  );

  const IS_EXPORT_AVAILABLE = user?.permissions?.includes(
    getExportPinsPermission(category)
  );

  return (
    <Box
      sx={{
        borderRadius: 0,
        paddingBlock: "16px",
        width: { xs: "85svw", md: "100%" },
        marginInline: "auto",
        py: 4,
      }}
      className="scroll-container"
    >
      <MaterialTable
        title="Pins & Serials"
        icons={tableIcons}
        components={{
          Toolbar: (props) => {
            return (
              <>
                <MTableToolbar {...props} />
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                  paddingY={3}
                >
                  <Autocomplete
                    options={categories.data ? categories?.data : []}
                    loading={categories?.isLoading}
                    size="small"
                    closeText=" "
                    disableClearable
                    value={checkerType}
                    sx={{ minWidth: { xs: 300, sm: 400 } }}
                    onChange={(e, value) => handleChangeDatatype(value)}
                    isOptionEqualToValue={(option, value) =>
                      value?.id === undefined ||
                      value?.id === null ||
                      value?.id === "" ||
                      option?.id === value?.id
                    }
                    getOptionLabel={(option) => option?.voucherType || ""}
                    renderInput={(params) => {
                      return (
                        <TextField
                          {...params}
                          label={
                            isVoucher
                              ? "Available Vouchers"
                              : "Available Tickets"
                          }
                          size="small"
                          sx={{ minWidth: { xs: 300, sm: 400 } }}
                          // sx={{ minWidth: 320 }}
                          // helperText={
                          //   isVoucher ? 'Select Vouchers' : 'Select Tickets'
                          // }
                        />
                      );
                    }}
                  />
                  {IS_LOAD_AVAILABLE && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleOpenLoadCheckers}
                      disabled={checkerType?.id === "" ? true : false}
                      size="sm"
                    >
                      {isVoucher ? "Load Vouchers" : "Load Tickets"}
                    </Button>
                  )}
                </Box>
                {vouchers?.data && (
                  <>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={4}
                    >
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        alignItems="center"
                        gap={2}
                        spacing={2}
                      >
                        {["stadium", "cinema"].includes(category) && (
                          <ListItemText
                            primary="Expected Tickets"
                            primaryTypographyProps={{
                              color: "primary",
                              fontWeight: "bold",
                            }}
                            secondary={checkerType?.details?.quantity}
                          />
                        )}
                        {category === "bus" && (
                          <>
                            <ListItemText
                              primary="Vehicle Registration No."
                              primaryTypographyProps={{
                                color: "primary",
                                fontWeight: "bold",
                              }}
                              secondary={checkerType?.details?.vehicleNo}
                            />
                            <ListItemText
                              primary="No. of seats"
                              primaryTypographyProps={{
                                color: "primary",
                                fontWeight: "bold",
                              }}
                              secondary={checkerType?.details?.noOfSeats}
                            />
                          </>
                        )}

                        <ListItemText
                          primary={
                            isVoucher ? "Total Vouchers" : "Total Tickets"
                          }
                          primaryTypographyProps={{
                            color: "primary",
                            fontWeight: "bold",
                          }}
                          secondary={voucherData?.length}
                        />

                        {/* <ListItemText
                          primary="Used"
                          primaryTypographyProps={{
                            color: "primary",
                            fontWeight: "bold",
                          }}
                          secondary={`${getUsedVouchers()} out of ${
                            voucherData?.length
                          }`}
                        /> */}
                      </Stack>
                      <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        sx={{
                          justifyContent: "center",
                          alignItems: "center",
                          py: 2,
                        }}
                        value={sortValue}
                        onChange={handleChangeSortValue}
                      >
                        <FormControlLabel
                          value="new"
                          control={<Radio />}
                          label="New"
                        />
                        <FormControlLabel
                          value="sold"
                          control={<Radio />}
                          label="Sold"
                        />
                        {isTicket && (
                          <>
                            <FormControlLabel
                              value="used"
                              control={<Radio />}
                              label="Used"
                            />
                            <FormControlLabel
                              value="expired"
                              control={<Radio />}
                              label="Expired"
                            />
                          </>
                        )}
                      </RadioGroup>
                    </Stack>
                    {["stadium", "cinema"].includes(category) && (
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={2}
                        spacing={2}
                      >
                        {checkerType?.details?.pricing?.map((item) => {
                          return (
                            <Chip
                              color="primary"
                              size="small"
                              key={item?.id}
                              label={item?.type}
                              icon={<IconButton>{item?.quantity}</IconButton>}
                            />
                          );
                        })}
                      </Stack>
                    )}

                    {voucherData && (
                      <CustomTotal
                        title={_.capitalize(sortValue)}
                        total={voucherData?.length}
                      />
                    )}
                  </>
                )}
              </>
            );
          },
        }}
        columns={modifiedvoucherTypeColumns}
        data={voucherData ? voucherData : []}
        isLoading={vouchers.isFetching}
        options={{
          paginationType: "stepped",
          searchFieldVariant: "outlined",
          searchFieldStyle: {
            borderRadius: "20px",
            fontSize: "13px",
            marginTop: "10px",
            marginRight: "20px",
            height: "40px",
            width: "300px",
          },
          sorting: true,
          exportButton: IS_EXPORT_AVAILABLE,
          exportAllData: true,
          headerStyle: {
            backgroundColor: "whitesmoke",
            color: "secondary.main",
            textTransform: "uppercase",
            paddingBlock: "12px",
          },
          selection: IS_DELETE_AVAILABLE,
          showTextRowsSelected: false,
        }}
        style={{
          padding: "12px",
          boxShadow: "none",
        }}
        actions={[
          {
            icon: () => <Refresh />,
            onClick: () => {
              setSortValue("all");
              vouchers.refetch();
            },
            isFreeAction: true,
          },
          {
            icon: () => <DeleteRounded />,
            position: "toolbarOnSelect",
            tooltip: "Delete all",
            onClick: () => removeVouchers(),
          },
        ]}
        localization={{
          body: {
            emptyDataSourceMessage: <Typography>No Data Available</Typography>,
          },
        }}
        onSelectionChange={handleSelectionChange}
      />
      <LoadChecker open={openLoadChecker} setOpen={setOpenLoadChecker} />
    </Box>
  );
};

export default LoadVoucher;
