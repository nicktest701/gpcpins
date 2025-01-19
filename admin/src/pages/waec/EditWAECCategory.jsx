import { useContext, useState } from "react";
import _ from "lodash";
import { v4 as uuid } from "uuid";
import LoadingButton from "@mui/lab/LoadingButton";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import { CustomContext } from "../../context/providers/CustomProvider";
import { editCategory, getCategory } from "../../api/categoryAPI";
import Transition from "../../components/Transition";
import { globalAlertType } from "../../components/alert/alertType";
import moment from "moment";
import { CATEGORY, currencyFormatter } from "../../constants";
import CustomYearPicker from "../../components/inputs/CustomYearPicker";
import { addWaecValidationSchema } from "../../config/validationSchema";
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { WAEC_VOUCHER_PRICING } from "../../mocks/columns";
import Compressor from "compressorjs";

const EditWAECCategory = () => {
  const queryClient = useQueryClient();

  //Context
  const {
    customState: {
      editWaecCategory: { open, id },
    },
    customDispatch,
  } = useContext(CustomContext);
  //state
  const [logo, setLogo] = useState(null);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [voucherType, setVoucherType] = useState("");
  const [price, setPrice] = useState(0);
  const [voucherURL, setVoucherURL] = useState("");
  const [year, setYear] = useState(moment().format("YYYY"));
  const [pricingList, setPricingList] = useState([]);
  const [pricingError, setPricingError] = useState("");
  const [pricingType, setPricingType] = useState("");

  //load options

  const initialValues = {
    category: "waec",
    voucherType,
    price,
    voucherURL,
    sellingPrice,
  };

  const waec = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?._id === id),
    enabled: !!id,
    onSuccess: (waec) => {
      setSellingPrice(waec?.details?.price);
      setVoucherType(waec?.voucherType);
      setVoucherURL(waec?.details?.voucherURL);
      setYear(waec?.year);
      setPricingList(waec?.details?.pricing);
    },
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: editCategory,
  });
  const onSubmit = (values, option) => {
    const isProtocolPresent = values.voucherURL?.includes("http");

    const modifiedCategory = {
      id: waec.data?._id,
      category: values.category,
      voucherType: values.voucherType,
      details: {
        voucherURL: isProtocolPresent
          ? values.voucherURL
          : `https://${values.voucherURL}`,
        pricing: pricingList,
        logo: logo || waec?.data?.details?.logo,
        price: values.sellingPrice,
      },
      year,
    };

    mutateAsync(modifiedCategory, {
      onSettled: () => {
        option.setSubmitting(false);
        queryClient.invalidateQueries(["category"]);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", data));
        handleClose();
        option.resetForm();
      },
      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  //Close Add Category
  const handleClose = () => {
    customDispatch({
      type: "openEditWaecCategory",
      payload: { open: false, id: "" },
    });
  };

  const handleUploadFile = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const image = e.target.files[0];

      new Compressor(image, {
        height: 200,
        width: 200,
        quality: 0.6,

        success(data) {
          const reader = new FileReader();
          reader.onload = function (event) {
            const ImageURL = event.target.result;
            setLogo(ImageURL);
          };

          reader.readAsDataURL(data);
        },
      });
    }
  };
  const handleAddTicketType = () => {
    setPricingError("");
    if (pricingType?.trim() === "") {
      setPricingError("Required*");

      return;
    }

    const item = {
      id: uuid(),
      type: pricingType.toUpperCase(),
      price: Number(price),
    };
    setPricingList((prev) => {
      return _.orderBy(
        _.values(_.merge(_.keyBy([...prev, item], "type"))),
        "type",
        "asc"
      );
    });

    setPricingError(" ");
    setPricingType("");
    setPrice(0);
  };

  const handleRemoveTicketType = (id) => {
    const filteredTickets = pricingList.filter((item) => item.id !== id);
    setPricingList(filteredTickets);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addWaecValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ values, errors, touched, handleChange, handleSubmit }) => {
        return (
          <Dialog
            maxWidth="sm"
            fullWidth
            TransitionComponent={Transition}
            open={open}
            onClose={handleClose}
          >
            <DialogTitle>Edit WAEC Checkers</DialogTitle>
            <DialogContent>
              <Stack rowGap={2} paddingY={2}>
                <div>
                  <label htmlFor="cinema">Upload Logo</label>
                  <input
                    type="file"
                    id="logo"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(e) => handleUploadFile(e)}
                  />
                </div>
                <Autocomplete
                  size="small"
                  options={CATEGORY.exams}
                  freeSolo
                  noOptionsText="No option available"
                  value={voucherType || null}
                  onInputChange={(e, value) => setVoucherType(value)}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label="WAEC Checker"
                      error={Boolean(touched.voucherType && errors.voucherType)}
                      helperText={touched.voucherType && errors.voucherType}
                    />
                  )}
                />

                <CustomYearPicker label="Year" year={year} setYear={setYear} />

                <TextField
                  size="small"
                  type="number"
                  inputMode="decimal"
                  label="Selling Price"
                  placeholder="Price here"
                  value={values.sellingPrice}
                  onChange={handleChange("sellingPrice")}
                  error={Boolean(touched.sellingPrice && errors.sellingPrice)}
                  helperText={touched.sellingPrice && errors.sellingPrice}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography>GHS</Typography>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography>p</Typography>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Ticket type  */}
                {pricingError && (
                  <small
                    style={{
                      color: "red",
                    }}
                  >
                    {pricingError}
                  </small>
                )}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Autocomplete
                    options={WAEC_VOUCHER_PRICING}
                    freeSolo
                    closeText=""
                    disableClearable
                    fullWidth
                    size="small"
                    noOptionsText="No Quantity available"
                    value={pricingType || ""}
                    onInputChange={(e, value) => setPricingType(value)}
                    isOptionEqualToValue={(option, value) =>
                      option.toString() === value.toString()
                    }
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        label="Select Quantity"
                        error={pricingError.trim() !== ""}
                      />
                    )}
                  />
                  <Typography color="primary">FOR</Typography>
                  <TextField
                    size="small"
                    type="number"
                    inputMode="numeric"
                    label="Price"
                    placeholder="Price here"
                    fullWidth
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography>GHS</Typography>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography>p</Typography>
                        </InputAdornment>
                      ),
                    }}
                    error={Boolean(touched.price && errors.price)}
                    helperText={touched.price && errors.price}
                  />

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleAddTicketType}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Add
                  </Button>
                </Stack>
                <List sx={{ maxHeight: 200, overflow: "auto" }}>
                  {pricingList.length !== 0
                    ? pricingList.map((item) => (
                        <ListItem key={item.id}>
                          <ListItemText
                            primary={`${
                              item.type
                            } Checker(s) for (${currencyFormatter(
                              item?.price
                            )})`}
                            primaryTypographyProps={{
                              fontSize: 11,
                              color: "primary.main",
                              fontWeight: "bolder",
                            }}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleRemoveTicketType(item?.id)}
                            >
                              <Close />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    : null}
                </List>

                <TextField
                  size="small"
                  type="url"
                  inputMode="url"
                  label={`WAEC Website URL`}
                  value={values.voucherURL}
                  onChange={handleChange("voucherURL")}
                  error={Boolean(touched.voucherURL && errors.voucherURL)}
                  helperText={
                    errors.voucherURL
                      ? errors.voucherURL
                      : "eg. www.example.com"
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ padding: 1 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <LoadingButton
                variant="contained"
                loading={isLoading}
                onClick={handleSubmit}
              >
                Save Changes
              </LoadingButton>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default EditWAECCategory;
