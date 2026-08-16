import { useEffect, useState } from "react";
import {
  Autocomplete,
  Avatar,
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
import moment from "moment";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import CustomImageChooser from "../../components/inputs/CustomImageChooser";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { addEmployeeValidationSchema } from "../../config/validationSchema";
import { addEmployee } from "../../api/employeeAPI";
import { getRoles } from "@/api/roleAPI";

const NewEmployee = ({ open, setOpen }) => {
  const queryClient = useQueryClient();
  const { customDispatch } = useCustomContext();
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(addEmployeeValidationSchema),
    defaultValues: {
      profile: null,
      firstname: "",
      lastname: "",
      username: "",
      dob: moment(),
      nid: "",
      residence: "",
      email: "",
      phonenumber: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset();
      setProfileImagePreview(null);
    }
  }, [open, reset]);

  const handleClose = () => setOpen(false);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: addEmployee,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      queryClient.invalidateQueries(["employees"]);
      handleClose();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const onSubmit = (values) => {
    const payload = {
      ...values,
      dob: values?.dob.format("YYYY-MM-DD"),
      // dob: new Date(values?.dob.toISOString()),
    };
    // console.log(payload)
    // return
    mutateAsync(payload);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("profile", file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // Role options (name + id) for Autocomplete
  const roleOptions = roles.map((role) => role.name);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <CustomDialogTitle
        title="New Employee"
        subtitle="Add new employee to list"
        onClose={handleClose}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2}>
            <Typography
              variant="caption"
              paragraph
              color="secondary.main"
              textTransform="uppercase"
              p={1}
            >
              Personal Details
            </Typography>

            {/* Profile Image */}
            <Stack
              position="relative"
              justifyContent="center"
              alignItems="center"
              mb={4}
            >
              <Avatar
                alt="profile"
                src={profileImagePreview}
                sx={{ width: 100, height: 100 }}
              />
              <CustomImageChooser handleImageUpload={handleImageUpload} />
            </Stack>

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
              paragraph
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

            {/* Password Fields */}
            <Typography
              variant="caption"
              paragraph
              color="secondary.main"
              textTransform="uppercase"
              p={1}
            >
              Account Credentials
            </Typography>

            <CustomFormControl>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    fullWidth
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    fullWidth
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                )}
              />
            </CustomFormControl>
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
            Add Employee
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewEmployee;
