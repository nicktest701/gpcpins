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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllTickets } from "../../api/categoryAPI";
import { getCategoryData } from "../../config/getCategoryData";
import { getAllVerifiers } from "../../api/verifierAPI";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import { ticketsValidationSchema } from "../../config/validationSchema";
import { assignTicket } from "../../api/ticketAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { useCustomData } from "../../context/providers/CustomProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";

function TicketAssignmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { customDispatch } = useCustomData();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pricingType, setPricingType] = useState([]);
  const [selectedVerifier, setSelectedVerifier] = useState({
    id: "",
    name: "",
  });
  const [ticketType, setTicketType] = useState({
    id: "",
    voucherType: "",
    pricing: [],
  });

  const categories = useQuery({
    queryKey: ["categories", selectedCategory],
    queryFn: () => getAllTickets(selectedCategory),
    enabled: !!selectedCategory,
    initialData: [],
    select: (categories) => {
      if (_.isEmpty(categories)) {
        return [];
      }
      return getCategoryData(categories);
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
    if (!_.isEmpty(ticketType.pricing)) {
      return ticketType?.pricing?.map((ticket) => {
        return {
          id: ticket?.id,
          type: ticket?.type,
        };
      });
    } else {
      return [];
    }
  }, [ticketType.pricing]);

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
      category: ticketType.id,
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
            queryClient.invalidateQueries(["verifiers"]);
            options.setSubmitting(false);
          },
          onSuccess: () => {
            customDispatch(
              globalAlertType("info", "Ticket successfully assigned!")
            );

            setSearchParams((params) => {
              params.set("t", "all");
              return params;
            });
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
                    onChange={(e) => {
                      setPricingType([]);
                      setTicketType({ id: "", voucherType: "", pricing: [] });
                      setSelectedCategory(e.target.value);
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
                    closeText=" "
                    disableClearable
                    value={ticketType}
                    // sx={{ minWidth: { xs: 300, sm: 400 } }}
                    onChange={(e, value) => {
                      setPricingType([]);
                      setTicketType(value);
                    }}
                    isOptionEqualToValue={(option, value) =>
                      value?.id === undefined ||
                      value?.id === null ||
                      value?.id === "" ||
                      option?.id === value?.id
                    }
                    getOptionLabel={(option) => option?.voucherType || ""}
                    // readOnly={!_.isEmpty(id)}
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
                {["cinema", "stadium"].includes(selectedCategory) && (
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
                    closeText=" "
                    disableClearable
                    value={selectedVerifier}
                    // sx={{ width: { xs: 300, sm: '100%' } }}
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
                    Assign Ticket
                  </LoadingButton>
                </Stack>
              </Stack>
            </>
          );
        }}
      </Formik>
      {isLoading && <GlobalSpinner />}
    </Container>
  );
}

export default TicketAssignmentPage;
