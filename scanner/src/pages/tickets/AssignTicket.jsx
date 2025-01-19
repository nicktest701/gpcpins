import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Autocomplete,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import _ from "lodash";
import CustomTitle from "../../components/custom/CustomTitle";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllTickets, getTicketByID } from "../../api/categoryAPI";
import {
  getCategoryData,
  getFormatttedCategory,
} from "../../config/getCategoryData";
import { getAllVerifiers } from "../../api/verifierAPI";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import { ticketsValidationSchema } from "../../config/validationSchema";
import { assignTicket } from "../../api/ticketAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { useCustomData } from "../../context/providers/CustomProvider";
import { AssessmentRounded } from "@mui/icons-material";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";

function AssignTicket() {
  const { id, category } = useParams();
  const { customDispatch } = useCustomData();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [pricingType, setPricingType] = useState([]);
  const [selectedVerifier, setSelectedVerifier] = useState({
    id: "",
    name: "",
  });
  const [ticketType, setTicketType] = useState({
    id: "",
    voucherType: "",
  });

  const categories = useQuery({
    queryKey: ["categories", category],
    queryFn: () => getAllTickets(category),
    enabled: !!category,
    initialData: [],
    select: (categories) => {
      if (_.isEmpty(categories)) {
        return [];
      }
      return getCategoryData(categories);
    },
  });

  const info = useQuery({
    queryKey: ["category", id],
    queryFn: () => getTicketByID(id),
    initialData: queryClient
      .getQueryData(["categories", category])
      ?.find((item) => item?._id === id),
    enabled: !!id,
    select: (data) => {
      const ticket = getFormatttedCategory(data);

      return ticket;
    },
    onSuccess: (ticket) => {
      setTicketType({
        id: ticket?.id,
        voucherType: ticket?.voucherType,
      });
    },
  });

  const verifiers = useQuery({
    queryKey: ["verifiers"],
    queryFn: getAllVerifiers,
    initialData: [],
    select: (veririfiers) => {
      return veririfiers?.map((verifier) => {
        return {
          id: verifier?._id,
          name: verifier?.name,
        };
      });
    },
  });

  const pricing = useMemo(() => {
    if (!_.isEmpty(info?.data)) {
      return info.data?.pricing?.map((ticket) => {
        return {
          id: ticket?.id,
          type: ticket?.type,
        };
      });
    } else {
      return [];
    }
  }, [info.data]);
  const initialValues = {
    selectedCategory,
    pricingType,
    selectedVerifier,
    ticketType,
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: assignTicket,
  });
  const onSubmit = (values, options) => {
    const payload = {
      category: id,
      type: JSON.stringify(values.pricingType),
      verifier: values.selectedVerifier.id,
    };

    Swal.fire({
      title: "Assigning Ticket",
      text: "Proceed with ticket assignment?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(payload, {
          onSettled: () => {
            queryClient.invalidateQueries(["employees"]);
            options.setSubmitting(false);
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
  };

  const goBack = () => navigate(-1);

  return (
    <Container>
      <CustomTitle
        title="Assign and Manage Tickets"
        subtitle="Assign tickets to users and manage ticket distribution efficiently."
        icon={
          <AssessmentRounded sx={{ width: 80, height: 80 }} color="primary" />
        }
      />

      <Formik
        initialValues={initialValues}
        validationSchema={ticketsValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ errors, touched, handleSubmit }) => {
          return (
            <>
              <Stack
                spacing={3}
                sx={{
                  // border: "1px solid lightgray",
                  borderRadius: 1,
                  p: 2,
                  width: "100%",
                  bgcolor: "#fff",
                }}
              >
                <FormControl>
                  <FormLabel sx={{ pb: 1 }}>Select Ticket Type</FormLabel>
                  <TextField
                    select
                    fullWidth
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    inputProps={{
                      readOnly: !_.isEmpty(id),
                    }}
                    error={Boolean(
                      touched.selectedCategory && errors.selectedCategory
                    )}
                    helperText={
                      touched.selectedCategory && errors.selectedCategory
                    }
                  >
                    <MenuItem value="cinema">Cinema Tickets</MenuItem>
                    <MenuItem value="stadium">Stadium Tickets</MenuItem>
                    <MenuItem value="bus">Bus Tickets</MenuItem>
                  </TextField>
                </FormControl>

                <FormControl>
                  <FormLabel sx={{ pb: 1 }}>Select Ticket Type</FormLabel>

                  <Autocomplete
                    options={categories.data}
                    loading={categories?.isLoading}
                    loadingText="Loading Categories.Please Wait...."
                    closeText=" "
                    disableClearable
                    value={ticketType}
                    // sx={{ minWidth: { xs: 300, sm: 400 } }}
                    onChange={(e, value) => setTicketType(value)}
                    isOptionEqualToValue={(option, value) =>
                      value?.id === undefined ||
                      value?.id === null ||
                      value?.id === "" ||
                      option?.id === value?.id
                    }
                    getOptionLabel={(option) => option?.voucherType || ""}
                    readOnly={!_.isEmpty(id)}
                    renderInput={(params) => {
                      return (
                        <TextField
                          {...params}
                          //   label="Available Tickets"
                          // sx={{ minWidth: { xs: 300, sm: 400 } }}
                          error={Boolean(
                            touched.ticketType?.id && errors.ticketType?.id
                          )}
                          helperText={
                            touched.ticketType?.id && errors.ticketType?.id
                          }
                        />
                      );
                    }}
                  />
                </FormControl>
                {["cinema", "stadium"].includes(category) && (
                  <FormControl>
                    <FormLabel sx={{ pb: 1 }}>Type</FormLabel>
                    <Autocomplete
                      multiple
                      freeSolo
                      fullWidth
                      defaultValue={pricing}
                      options={pricing}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option?.type || ""}
                      renderOption={(props, option, state) => {
                        return (
                          <ListItem
                            {...props}
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <Checkbox size="small" checked={state?.selected} />
                            <ListItemText secondary={option?.type} />
                          </ListItem>
                        );
                      }}
                      value={pricingType}
                      onChange={(e, value) => setPricingType(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(
                            touched.pricingType && errors.pricingType
                          )}
                          helperText={touched.pricingType && errors.pricingType}
                        />
                      )}
                    />
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel sx={{ pb: 1 }}>
                    Select Employee to assign ticket
                  </FormLabel>

                  <Autocomplete
                    options={verifiers.data}
                    loading={verifiers?.isLoading}
                    loadingText="Loading Verifiers.Please Wait...."
                    closeText=" "
                    disableClearable
                    value={selectedVerifier}
                    // sx={{ minWidth: { xs: 300, sm: 400 } }}
                    onChange={(e, value) => setSelectedVerifier(value)}
                    isOptionEqualToValue={(option, value) =>
                      value?.id === undefined ||
                      value?.id === null ||
                      value?.id === "" ||
                      option?.id === value?.id
                    }
                    getOptionLabel={(option) => option?.name || ""}
                    renderInput={(params) => {
                      return (
                        <TextField
                          {...params}
                          // sx={{ minWidth: { xs: 300, sm: 400 } }}
                          error={Boolean(
                            touched.selectedVerifier?.id &&
                              errors.selectedVerifier?.id
                          )}
                          helperText={
                            touched.selectedVerifier?.id &&
                            errors.selectedVerifier?.id
                          }
                        />
                      );
                    }}
                  />
                </FormControl>

                <Stack
                  pt={4}
                  direction="row"
                  alignItems="center"
                  justifyContent="flex-end"
                  spacing={2}
                >
                  <Button onClick={goBack}>Cancel</Button>

                  <LoadingButton
                    loading={isLoading}
                    variant="contained"
                    onClick={handleSubmit}
                  >
                    Proceed To Assign
                  </LoadingButton>
                </Stack>
              </Stack>
            </>
          );
        }}
      </Formik>
      {(categories.isLoading || info?.isLoading) && <GlobalSpinner />}
    </Container>
  );
}

export default AssignTicket;
