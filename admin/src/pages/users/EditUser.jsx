import { useEffect,} from "react";
import {
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useParams } from "react-router-dom";
import moment from "moment";
import Swal from "sweetalert2";

import DialogContainer from "../../components/dialogs/DialogContainer";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { userValidationSchema } from "../../config/validationSchema";
import { getUser, putUser } from "../../api/userAPI";

const EditUser = () => {
  const { id } = useParams();
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch user data
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    enabled: !!id && Boolean(searchParams.get("personal")),
    initialData: () => {
      return queryClient
        .getQueryData(["users"])
        ?.find((u) => u?.id === id);
    },
  });

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(userValidationSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      dob: moment(),
      nid: "",
      email: "",
      phonenumber: "",
    },
  });

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        dob: user.dob ? moment(user.dob) : moment(),
        nid: user.nid || "",
        email: user.email || "",
        phonenumber: user.phonenumber || "",
      });
    }
  }, [user, reset]);

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("personal");
      return params;
    });
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: putUser,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["user", id]);
      handleClose();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const onSubmit = (values) => {
    Swal.fire({
      title: "Save Changes?",
      text: "Are you sure you want to update this user's information?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save",
    }).then((result) => {
    
      if (result.isConfirmed) {
        const payload = {
          ...values,
          id: user?.id,
          dob: moment(values.dob).format("YYYY-MM-DD"),
          admin: true,
        };
        mutateAsync(payload);
      }
    });
  };

  const open = Boolean(searchParams.get("personal"));

  return (
    <DialogContainer
      open={open}
      onClose={handleClose}
      title="Edit User"
      subtitle="Make changes to user information"
      onConfirm={handleSubmit(onSubmit)}
      loading={isLoading || isSubmitting}
      confirmText="Save Changes"
      maxWidth="md"
    >
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
                format="Do MMMM, YYYY"
                disableFuture
                size="small"
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

        <CustomFormControl>
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
        </CustomFormControl>
      </Stack>
    </DialogContainer>
  );
};

export default EditUser;

// import {
//   Container,
//   Typography,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   Stack,
//   TextField,
// } from "@mui/material";
// // import Transition from '../../components/Transition';
// import CustomFormControl from "../../components/inputs/CustomFormControl";
// import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
// import { Formik } from "formik";
// import { LoadingButton } from "@mui/lab";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useContext, useState } from "react";
// import moment from "moment";
// import { useSearchParams, useParams } from "react-router-dom";
// import { CustomContext } from "../../context/providers/CustomProvider";
// import { globalAlertType } from "../../components/alert/alertType";
// import CustomDatePicker from "../../components/inputs/CustomDatePicker";
// import { userValidationSchema } from "../../config/validationSchema";
// import { getUser, putUser } from "../../api/userAPI";

// const EditUser = () => {
//   const { id } = useParams();
//   const { customDispatch } = useContext(CustomContext);
//   const queryClient = useQueryClient();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [dob, setDob] = useState(moment());

//   const { data } = useQuery({
//     queryKey: ["user", id],
//     queryFn: () => getUser(id),
//     enabled: !!id,
//     initialData: () => {
//       return queryClient
//         .getQueryData(["users"])
//         .find((user) => user?.id === id);
//     },
//   });

//   const initialValues = {
//     id: id || data?.id,
//     firstname: data?.firstname,
//     lastname: data?.lastname,
//     username: data?.username,
//     dob: moment(data?.dob),
//     nid: data?.nid,
//     email: data?.email,
//     phonenumber: data?.phonenumber,
//     admin: true,
//   };

//   const handleClose = () => {
//     setSearchParams((params) => {
//       params.delete("personal");
//       return params;
//     });
//   };

//   const { mutateAsync, isLoading } = useMutation({
//     mutationFn: putUser,
//   });
//   const onSubmit = (values) => {
//     // console.log(values);
//     values.dob = dob;
//     mutateAsync(values, {
//       onSettled: () => {
//         queryClient.invalidateQueries(["users"]);
//         queryClient.invalidateQueries(["user", id]);
//       },
//       onSuccess: (data) => {
//         customDispatch(globalAlertType("success", data));
//         handleClose();
//       },
//       onError: (error) => {
//         customDispatch(globalAlertType("error", error));
//       },
//     });
//   };

//   return (
//     <Dialog
//       open={Boolean(searchParams.get("personal"))}
//       maxWidth="md"
//       fullWidth
//       // fullScreen
//       // TransitionComponent={Transition}
//     >
//       <CustomDialogTitle
//         title="Edit User"
//         subtitle="Make Changes to business"
//       />
//       <Formik
//         initialValues={initialValues}
//         validationSchema={userValidationSchema}
//         onSubmit={onSubmit}
//         enableReinitialize
//       >
//         {({
//           errors,
//           values,
//           touched,
//           handleChange,
//           handleSubmit,
//         }) => {
//           return (
//             <>
//               <DialogContent>
//                 <Container>
//                   <Stack spacing={2}>
//                     <Typography
//                       variant="caption"
//                       paragraph
//                       bgcolor="primary.main"
//                       color="secondary.main"
//                       textTransform="uppercase"
//                       p={1}
//                     >
//                       Personal Details
//                     </Typography>
//                     <CustomFormControl>
//                       <TextField
//                         // variant="filled"
//                         label="First Name"
//                         fullWidth
//                         size="small"
//                         required
//                         value={values.firstname}
//                         onChange={handleChange("firstname")}
//                         error={Boolean(touched.firstname && errors.firstname)}
//                         helperText={touched.firstname && errors.firstname}
//                       />

//                       <TextField
//                         // variant="filled"
//                         label="Last Name"
//                         size="small"
//                         fullWidth
//                         required
//                         value={values.lastname}
//                         onChange={handleChange("lastname")}
//                         error={Boolean(touched.lastname && errors.lastname)}
//                         helperText={touched.lastname && errors.lastname}
//                       />
//                     </CustomFormControl>
//                     <CustomFormControl>
//                       <CustomDatePicker
//                          format='Do MMMM,YYYY'
//                         label="Date Of Birth"
//                         value={values.dob}
//                         setValue={setDob}
//                         error={Boolean(touched.date && errors.date)}
//                         helperText={touched.date && errors.date}
//                         minDate={moment("1900-01-01")}
//                         disableFuture={true}
//                         size="small"
//                       />
//                       <TextField
//                         label="National ID / Voter's ID Number"
//                         size="small"
//                         required
//                         fullWidth
//                         value={values.nid}
//                         onChange={handleChange("nid")}
//                         error={Boolean(touched.nid && errors.nid)}
//                         // helperText={
//                         //   touched.nid && errors.nid ? (
//                         //     errors.nid
//                         //   ) : (
//                         //     <ul style={{ display: "flex", gap: "4rem" }}>
//                         //       <li>National ID</li>
//                         //       <li>Voter&apos;s ID</li>
//                         //     </ul>
//                         //   )
//                         // }
//                       />
//                     </CustomFormControl>
//                     <CustomFormControl>
//                       <TextField
//                         size="small"
//                         label="Email Address"
//                         type="email"
//                         inputMode="email"
//                         fullWidth
//                         required
//                         value={values.email}
//                         onChange={handleChange("email")}
//                         error={Boolean(touched.email && errors.email)}
//                         helperText={touched.email && errors.email}
//                         InputProps={{
//                           readOnly: true,
//                         }}
//                         disabled
//                       />
//                       <TextField
//                         // variant="filled"
//                         type="tel"
//                         inputMode="tel"
//                         label="Telephone No."
//                         size="small"
//                         fullWidth
//                         required
//                         value={values.phonenumber}
//                         onChange={handleChange("phonenumber")}
//                         error={Boolean(
//                           touched.phonenumber && errors.phonenumber
//                         )}
//                         helperText={touched.phonenumber && errors.phonenumber}
//                       />
//                     </CustomFormControl>
//                   </Stack>
//                 </Container>
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={handleClose}>Cancel</Button>
//                 <LoadingButton
//                   loading={isLoading}
//                   variant="contained"
//                   sx={{
//                     paddingX: 4,
//                   }}
//                   onClick={handleSubmit}
//                 >
//                   Save Changes
//                 </LoadingButton>
//               </DialogActions>
//             </>
//           );
//         }}
//       </Formik>
//     </Dialog>
//   );
// };

// export default EditUser;
