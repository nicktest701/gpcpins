import { useEffect, useState } from "react";
import {
  Container,
  Stack,
  TextField,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useParams } from "react-router-dom";
import moment from "moment";
import Swal from "sweetalert2";

import DialogContainer from "../../../components/dialogs/DialogContainer";
import CustomDatePicker from "../../../components/inputs/CustomDatePicker";
import CustomFormControl from "../../../components/inputs/CustomFormControl";
import { useCustomContext } from "../../../context/providers/CustomProvider";
import { globalAlertType } from "../../../components/alert/alertType";
import {
  agentBusinessValidationSchema,
  agentContactValidationSchema,
  agentPersonalValidationSchema,
  agentValidationSchema,
} from "../../../config/validationSchema";
import { getAgent, putAgent } from "../../../api/agentAPI";

const EditAgent = () => {
  const { id } = useParams();
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine which section is being edited
  const section = searchParams.get("personal")
    ? "personal"
    : searchParams.get("contact")
    ? "contact"
    : searchParams.get("business")
    ? "business"
    : null;

  const open = Boolean(section);

  // Fetch agent data
  const { data: agent, isLoading: isLoadingData } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => getAgent(id),
    enabled: !!id,
    initialData: () =>
      queryClient.getQueryData(["agents"])?.find((a) => a.id === id),
  });



  // Prepare initial values based on section
  const getDefaultValues = () => {
    if (!agent) return {};
    switch (section) {
      case "personal":
        return {
          id: agent.id,
          firstname: agent.firstname || "",
          lastname: agent.lastname || "",
          username: agent.username || "",
          dob: agent.dob ? moment(agent.dob) : moment(),
          nid: agent.nid || "",
        };
      case "contact":
        return {
          id: agent.id,
          residence: agent.residence || "",
          email: agent.email || "",
          phonenumber: agent.phonenumber || "",
        };
      case "business":
        return {
          agent_id: agent.id,
          business_id: agent.businessId || "",
          business_name: agent.businessName || "",
          business_location: agent.businessLocation || "",
          business_description: agent.businessDescription || "",
          business_email: agent.businessEmail || "",
          business_phonenumber: agent.businessPhonenumber || "",
        };
      default:
        return {};
    }
  };

  // Get validation schema for the current section
  const getValidationSchema = () => {
    switch (section) {
      case "personal":
        return agentPersonalValidationSchema;
      case "contact":
        return agentContactValidationSchema;
      case "business":
        return agentBusinessValidationSchema;
      default:
        return agentValidationSchema;
    }
  };

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(getValidationSchema()),
    defaultValues: getDefaultValues(),
  });

  // Reset form when agent data or section changes
  useEffect(() => {
    if (agent && section) {
      const values = getDefaultValues();
      reset(values);
    }
  }, [agent, section, reset]);

  // Mutation
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: putAgent,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      queryClient.invalidateQueries(["agents"]);
      queryClient.invalidateQueries(["agent", id]);
      handleClose();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const onSubmit = (values) => {
    // For personal section, format dob
    const payload = { ...values };
    if (section === "personal" && values.dob) {
 
      payload.dob = moment(values?.dob).format("YYYY-MM-DD");
    }

    Swal.fire({
      title: "Save Changes?",
      text: "Are you sure you want to update this agent's information?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save",
    }).then((result) => {
      if (result.isConfirmed) {
        mutateAsync(payload);
      }
    });
  };

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("personal");
      params.delete("contact");
      params.delete("business");
      return params;
    });
  };

  // Get title and subtitle based on section
  const getTitle = () => {
    switch (section) {
      case "personal":
        return "Edit Personal Details";
      case "contact":
        return "Edit Contact Details";
      case "business":
        return "Edit Business Information";
      default:
        return "Edit Agent";
    }
  };
  const getSubtitle = () => {
    switch (section) {
      case "personal":
        return "Update the agent's personal information";
      case "contact":
        return "Update the agent's contact information";
      case "business":
        return "Update the agent's business details";
      default:
        return "";
    }
  };

  if (isLoadingData) {
    return (
      <DialogContainer open={open} onClose={handleClose} title="Loading..." loading>
        <CircularProgress />
      </DialogContainer>
    );
  }

  return (
    <DialogContainer
      open={open}
      onClose={handleClose}
      title={getTitle()}
      subtitle={getSubtitle()}
      onConfirm={handleSubmit(onSubmit)}
      loading={isSubmitting || isLoading}
      confirmText="Save Changes"
      maxWidth="md"
    >
      <form noValidate>
        <Stack spacing={2}>
          {section === "personal" && (
            <>
              <CustomFormControl>
                <Controller
                  name="firstname"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      required
                      error={!!errors.firstname}
                      helperText={errors.firstname?.message}
                    />
                  )}
                />
                <Controller
                  name="lastname"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      required
                      error={!!errors.lastname}
                      helperText={errors.lastname?.message}
                    />
                  )}
                />
              </CustomFormControl>

              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    fullWidth
                    required
                    disabled
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                )}
              />

              <CustomFormControl>
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <CustomDatePicker
                      label="Date of Birth"
                      value={field.value}
                      setValue={(val) => setValue("dob", val)}
                      error={!!errors.dob}
                      helperText={errors.dob?.message}
                      minDate={moment("1900-01-01")}
                      disableFuture
                      format="Do MMMM, YYYY"
                    />
                  )}
                />
                <Controller
                  name="nid"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="National ID / Voter's ID"
                      fullWidth
                      required
                      error={!!errors.nid}
                      helperText={errors.nid?.message}
                    />
                  )}
                />
              </CustomFormControl>
            </>
          )}

          {section === "contact" && (
            <>
              <CustomFormControl>
                <Controller
                  name="phonenumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telephone No."
                      fullWidth
                      required
                      type="tel"
                      error={!!errors.phonenumber}
                      helperText={errors.phonenumber?.message}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Address"
                      fullWidth
                      required
                      type="email"
                      disabled
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </CustomFormControl>

              <Controller
                name="residence"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Residential Address"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    error={!!errors.residence}
                    helperText={errors.residence?.message}
                  />
                )}
              />
            </>
          )}

          {section === "business" && (
            <>
              <Controller
                name="business_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Business Name"
                    fullWidth
                    required
                    error={!!errors.business_name}
                    helperText={errors.business_name?.message}
                  />
                )}
              />
              <Controller
                name="business_location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Business Location"
                    fullWidth
                    required
                    error={!!errors.business_location}
                    helperText={errors.business_location?.message}
                  />
                )}
              />
              <Controller
                name="business_description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Business Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.business_description}
                    helperText={errors.business_description?.message}
                  />
                )}
              />
              <CustomFormControl>
                <Controller
                  name="business_email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Business Email"
                      fullWidth
                      type="email"
                      error={!!errors.business_email}
                      helperText={errors.business_email?.message}
                    />
                  )}
                />
                <Controller
                  name="business_phonenumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Business Telephone"
                      fullWidth
                      type="tel"
                      error={!!errors.business_phonenumber}
                      helperText={errors.business_phonenumber?.message}
                    />
                  )}
                />
              </CustomFormControl>
            </>
          )}
        </Stack>
      </form>
    </DialogContainer>
  );
};

export default EditAgent;

