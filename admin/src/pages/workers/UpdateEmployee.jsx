import { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { updateEmployeeValidationSchema } from "../../config/validationSchema";
import { getEmployee, updateEmployee } from "../../api/employeeAPI";
import { getRoles } from "@/api/roleAPI";

const UpdateEmployee = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch employee data
  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
    enabled: !!id && Boolean(searchParams.get("update_employee")),
    initialData: queryClient
      .getQueryData(["employees"])
      ?.find((emp) => emp?.id === id),
  });

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(updateEmployeeValidationSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      dob: moment(),
      nid: "",
      role: "",
      email: "",
      residence: "",
      phonenumber: "",

    },
  });

  // Populate form when employee data loads
  useEffect(() => {
    if (employee) {
      reset({
        firstname: employee.firstname || "",
        lastname: employee.lastname || "",
        username: employee.username || "",
        dob: employee.dob ? moment(employee.dob) : moment(),
        nid: employee.nid || "",
        role: employee.role || "",
        email: employee.email || "",
        residence: employee.residence || "",
        phonenumber: employee.phonenumber || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [employee, reset]);

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("update_employee");
      return params;
    });
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      queryClient.invalidateQueries(["employee", id]);
      queryClient.invalidateQueries(["employees"]);
      handleClose();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const onSubmit = (values) => {
    Swal.fire({
      title: "Updating Employee",
      text: "Employee information modified. Save Changes?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        const payload = {
          ...values,
          id: employee?.id,
          dob: values?.dob.format("YYYY-MM-DD"),
        };
        mutateAsync(payload);
      }
    });
  };

  // Role options
  const roleOptions = roles.map((role) => role.name);

  return (
    <Dialog
      open={Boolean(searchParams.get("update_employee"))}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <CustomDialogTitle
        title="Edit Employee"
        subtitle="Make changes to employee information"
        onClose={handleClose}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2} py={2}>
            <Typography
              variant="caption"
              color="secondary.main"
              textTransform="uppercase"
              p={1}
            >
              Personal Details
            </Typography>

            <CustomFormControl>
              <Controller
                name="firstname"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
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
                    error={!!errors.lastname}
                    helperText={errors.lastname?.message}
                  />
                )}
              />
            </CustomFormControl>

            <CustomFormControl>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    fullWidth
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                )}
              />

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
                    format="Do MMMM,YYYY"
                    disableFuture
                    size="large"
                  />
                )}
              />
            </CustomFormControl>

            <Controller
              name="nid"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="National ID / Voter's ID Number"
                  fullWidth
                  required
                  error={!!errors.nid}
                  helperText={errors.nid?.message}
                />
              )}
            />

            {/* Role Autocomplete */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={roleOptions}
                  value={field.value || null}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Role"
                      error={!!errors.role}
                      helperText={errors.role?.message}
                    />
                  )}
                  noOptionsText="No roles available"
                  isOptionEqualToValue={(option, value) => option === value}
                />
              )}
            />

       
        
            <Typography
              variant="caption"
              color="secondary.main"
              textTransform="uppercase"
              p={1}
            >
              Contact Details
            </Typography>

            <CustomFormControl>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                   disabled
                    />
                )}
              />

              <Controller
                name="phonenumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="tel"
                    label="Telephone No."
                    fullWidth
                    error={!!errors.phonenumber}
                    helperText={errors.phonenumber?.message}
                    //  disabled
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
                  required
                  fullWidth
                  multiline
                  rows={5}
                  error={!!errors.residence}
                  helperText={errors.residence?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading || isSubmitting}
            sx={{ paddingX: 4 }}
          >
            Save Changes
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateEmployee;
