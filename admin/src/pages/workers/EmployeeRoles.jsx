import {
  Box,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import Swal from "sweetalert2";
import CustomTitle from "../../components/custom/CustomTitle";
import { EMPLOYEES_ROLES } from "../../mocks/columns";
import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CustomContext } from "../../context/providers/CustomProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEmployee } from "../../api/employeeAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { LoadingButton } from "@mui/lab";

function EmployeeRoles() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const [selectedTitles, setSelectedTitles] = useState(
    JSON.parse(decodeURIComponent(searchParams.get("permissions")))
  );
  const [enabledMainTitles, setEnabledMainTitles] = useState({});

  useEffect(() => {
    const initialEnabledMainTitles = {};
    EMPLOYEES_ROLES.forEach((item) => {
      if (selectedTitles.includes(item.title)) {
        initialEnabledMainTitles[item.title] = true;
      }
    });
    setEnabledMainTitles(initialEnabledMainTitles);
  }, [selectedTitles]);

  const handleMainCheckboxChange = (mainTitle) => {
    setSelectedTitles((prevSelectedTitles) => {
      const isChecked = !enabledMainTitles[mainTitle];
      const newSelectedTitles = isChecked
        ? [...prevSelectedTitles, mainTitle]
        : prevSelectedTitles.filter((t) => t !== mainTitle);

      if (!isChecked) {
        EMPLOYEES_ROLES.find((item) => item.title === mainTitle).roles.forEach(
          (role) => {
            newSelectedTitles.splice(newSelectedTitles.indexOf(role.title), 1);
          }
        );
      }

      return newSelectedTitles;
    });

    setEnabledMainTitles((prevEnabledMainTitles) => ({
      ...prevEnabledMainTitles,
      [mainTitle]: !prevEnabledMainTitles[mainTitle],
    }));
  };

  const handleRoleCheckboxChange = (roleTitle) => {
    setSelectedTitles((prevSelectedTitles) =>
      prevSelectedTitles.includes(roleTitle)
        ? prevSelectedTitles.filter((t) => t !== roleTitle)
        : [...prevSelectedTitles, roleTitle]
    );
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: updateEmployee,
  });
  const handleSavePermissions = () => {
    const values = {
      _id: id,
      permissions: selectedTitles,
    };

    Swal.fire({
      title: "Updating Employee Permissions",
      text: "Employee information modified.Save Changes?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(values, {
          onSettled: () => {
            queryClient.invalidateQueries(["employee", id]);
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

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Container sx={{ position: "relative", bgcolor: "#fff", py: 4 }}>
      <CustomTitle
        title="Roles & Permissions"
        subtitle=" Overview of how employees can manage their permissions and role
              assignments within the system."
      />

      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        width="100%"
        py={2}
        spacing={2}
      >
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          loading={isLoading}
          variant="contained"
          sx={{
            paddingX: 4,
          }}
          onClick={handleSavePermissions}
        >
          Save Changes
        </LoadingButton>
      </Stack>

      <Box py={2} pl={{ xs: 2, md: 20 }} height="70svh" overflow="auto">
        <Stack spacing={3}>
          {EMPLOYEES_ROLES.map((item, index) => (
            <div key={index}>
              <FormControlLabel
                label={
                  <Typography variant="h6" fontWeight="bold">
                    {item.title}
                  </Typography>
                }
                checked={enabledMainTitles[item.title] || false}
                onChange={() => handleMainCheckboxChange(item.title)}
                control={<Checkbox name={item.title} value={item.title} />}
              />

              {item?.roles?.map((role, roleIndex) => (
                <Stack pl={5} key={roleIndex}>
                  <label>
                    <FormControlLabel
                      label={role.title}
                      checked={selectedTitles.includes(role.title)}
                      onChange={() => handleRoleCheckboxChange(role.title)}
                      disabled={!enabledMainTitles[item.title]}
                      control={
                        <Checkbox name={role.title} value={role.title} />
                      }
                    />
                  </label>
                </Stack>
              ))}
            </div>
          ))}
        </Stack>
      </Box>
    </Container>
  );
}

export default EmployeeRoles;
