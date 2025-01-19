import {
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useContext } from "react";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { Formik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { AuthContext } from "../../context/providers/AuthProvider";
import { getAgentBusiness, updateAgentBusiness } from "../../api/agentAPI";

const Business = () => {
  const { customDispatch } = useContext(CustomContext);
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: updateAgentBusiness,
  });

  const agentBusiness = useQuery({
    queryKey: ["agent-business"],
    queryFn: () => getAgentBusiness(user?.id),
    enabled: !!user?.id,
    initialData: () => {
      return {
        _id: user?.id,
        name: user?.businessName,
        location: user?.businessLocation,
        description: user?.businessDescription,
      };
    },
  });

  const onSubmit = (values) => {
    mutateAsync(values, {
      onSuccess: () => {
        customDispatch(globalAlertType("info", "Profile Updated!"));
        queryClient.invalidateQueries(["user"]);
      },
      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  return (
    <>
      <AnimatedContainer>
        <Box sx={{ width: "100%", flex: 1 }}>
          <Typography variant="h5">Business</Typography>
          <Typography variant="caption" color="secondary.main" paragraph>
            Manage Information about your business
          </Typography>

          <Formik
            initialValues={agentBusiness.data}
            // validationSchema={updateUserValidationSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, touched, handleChange, handleSubmit }) => {
              return (
                <Stack spacing={2} paddingTop={3}>
                  <TextField
                    size="small"
                    label="Business"
                    fullWidth
                    required
                    value={values?.name}
                    onChange={handleChange("name")}
                    error={Boolean(touched?.name && errors?.name)}
                    helperText={touched?.name && errors?.name}
                  />
                  <TextField
                    size="small"
                    label="Location"
                    fullWidth
                    required
                    value={values?.location}
                    onChange={handleChange("location")}
                    error={Boolean(touched?.location && errors?.location)}
                    helperText={touched?.location && errors?.location}
                  />

                  <TextField
                    size="small"
                    variant="outlined"
                    label="Description"
                    fullWidth
                    required
                    value={values?.description}
                    onChange={handleChange("description")}
                    error={Boolean(touched?.description && errors?.description)}
                    helperText={touched?.description && errors?.description}
                  />

                  <LoadingButton
                    variant="contained"
                    onClick={handleSubmit}
                    loading={isLoading}
                    loadingIndicator={
                      <CircularProgress color="inherit" size={16} />
                    }
                    sx={{ alignSelf: "flex-end" }}
                  >
                    {isLoading ? "Saving" : "Save Changes"}
                  </LoadingButton>
                </Stack>
              );
            }}
          </Formik>
        </Box>
      </AnimatedContainer>
    </>
  );
};

export default Business;
