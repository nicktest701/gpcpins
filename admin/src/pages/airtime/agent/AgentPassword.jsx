import { useContext } from "react";
import { Stack, TextField, Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CustomTitle from "../../../components/custom/CustomTitle";
import AnimatedContainer from "../../../components/animations/AnimatedContainer";
import { Formik } from "formik";
import { useParams } from "react-router-dom";
import { passwordValidationSchema } from "../../../config/validationSchema";
import { useMutation } from "@tanstack/react-query";
import { globalAlertType } from "../../../components/alert/alertType";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { putAgentPassword } from "../../../api/agentAPI";
function AgentPassword() {
  const { id } = useParams();
  const { customDispatch } = useContext(CustomContext);
  const initialValues = {
    id,
    password: "",
    confirmPassword: "",
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: putAgentPassword,
  });

  const onSubmit = (values) => {
    mutate(values, {
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", "Changes Saved"));
      },

      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };
  return (
    <Box sx={{ bgcolor: "#fff", p: 2 }}>
      <CustomTitle
        titleVariant="h4"
        title="Password"
        subtitle="Reset or make changes to agents password"
      />

      <AnimatedContainer delay={0.4}>
        <Formik
          initialValues={initialValues}
          validationSchema={passwordValidationSchema}
          onSubmit={onSubmit}
        >
          {({ values, errors, touched, handleChange, handleSubmit }) => {
            return (
              <Stack spacing={2} paddingTop={2}>
                <TextField
                  size="small"
                  type="password"
                  label="Password"
                  fullWidth
                  required
                  value={values?.password}
                  onChange={handleChange("password")}
                  error={Boolean(touched?.password && errors?.password)}
                  helperText={touched?.password && errors?.password}
                />

                <TextField
                  size="small"
                  type="password"
                  label="Confirm Password"
                  fullWidth
                  required
                  value={values?.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  error={Boolean(
                    touched?.confirmPassword && errors?.confirmPassword
                  )}
                  helperText={
                    touched?.confirmPassword && errors?.confirmPassword
                  }
                />
                <ul style={{ paddingLeft: "16px" }}>
                  <li>
                    <small>Password must be at least 8 characters</small>
                  </li>
                  <li>
                    <small>Password must start with an uppercase letter</small>
                  </li>
                  <li>
                    <small>
                      Password must contain both numbers and alphabets
                    </small>
                  </li>
                </ul>

                <LoadingButton
                  variant="contained"
                  onClick={handleSubmit}
                  loading={isLoading}
                  sx={{
                    alignSelf: "flex-start",
                  }}
                >
                  {isLoading ? "Updating" : "Update Password"}
                </LoadingButton>
              </Stack>
            );
          }}
        </Formik>
      </AnimatedContainer>
    </Box>
  );
}

export default AgentPassword;
