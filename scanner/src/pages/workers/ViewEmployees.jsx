import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import ExcelIcon from "@mui/icons-material/InsertDriveFile"; // Replace with a suitable icon for Excel
import CsvIcon from "@mui/icons-material/Description"; // Replace with a suitable icon for CSV
import PdfIcon from "@mui/icons-material/PictureAsPdf";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import CustomTitle from "../../components/custom/CustomTitle";

import { getAllVerifiers } from "../../api/verifierAPI";
import {
  AddCircle,
  AddCircleRounded,
  GroupRounded,
  Refresh,
  Search,
} from "@mui/icons-material";
import EmployeeCard from "./EmployeeCard";
import { useMemo, useState } from "react";
import { exportToCSV, exportToExcel, exportToPDF } from "../../config/export";

const ViewEmployees = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const verifiers = useQuery({
    queryKey: ["verfifiers"],
    queryFn: getAllVerifiers,
    // initialData: [],
  });

  const modifiedVerifiers = useMemo(() => {
    if (searchTerm) {
      return verifiers?.data.filter((item) =>
        item?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
      );
    } else {
      return verifiers?.data;
    }
  }, [searchTerm, verifiers.data]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // const removeAllEmployees = () => {};

  //VIEW Employee Details
  const handleNewEmployee = () => {
    navigate(`/verifiers/new`);
  };

  return (
    <Container>
      <CustomTitle
        title="Verifiers"
        subtitle="Dive into verifier details, staff information, and human resources data to effectively manage our team."
        icon={<GroupRounded sx={{ width: 80, height: 80 }} color="primary" />}
      />

      {verifiers?.data?.length > 0 && (
        <>
          <TextField
            placeholder="Search for verifier"
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            margin="normal"
            InputProps={{
              sx: {
                borderRadius: 10,
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Search
                    sx={{ color: "text.disabled", width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            py={2}
          >
            <Tooltip title="Add New ">
              <IconButton onClick={handleNewEmployee}>
                <AddCircle />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={verifiers.refetch}>
                <Refresh />
              </IconButton>
            </Tooltip>
            {/* <Button startIcon={<Filter />}>Filter</Button> */}
            <Tooltip title="Export to Excel">
              <IconButton onClick={() => exportToExcel(modifiedVerifiers)}>
                <ExcelIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export to CSV">
              <IconButton onClick={() => exportToCSV(modifiedVerifiers)}>
                <CsvIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export to PDF">
              <IconButton
                onClick={() => exportToPDF(modifiedVerifiers, ["profile"])}
              >
                <PdfIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </>
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          py: 4,
          mb: 2,
        }}
      >
        {verifiers.isLoading ? (
          <>
            {[...Array(12)].map((_, index) => (
              <ContactCardSkeleton key={index} />
            ))}
          </>
        ) : (
          <>
            {modifiedVerifiers.length > 0 ? (
              <>
                {modifiedVerifiers?.map((verifier) => {
                  return <EmployeeCard {...verifier} key={verifier?._id} />;
                })}
                {/* <EmployeeCard /> */}
                {/* <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 220,
                    border: "1px solid lightgray",
                    borderRadius: 1,
                  }}
                >
                  <IconButton onClick={handleNewEmployee}>
                    <Add sx={{ width: 64, height: "auto" }} />
                  </IconButton>
                </Box> */}
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",

                  width: "100%",
                  gap: 2,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={200.636}
                  height={332.174}
                  data-name="Layer 1"
                  viewBox="0 0 700 400"
                >
                  <path
                    fill="#f2f2f2"
                    d="M411.146 142.174h-174.51a15.018 15.018 0 0 0-15 15v387.85l-2 .61-42.81 13.11a8.007 8.007 0 0 1-9.99-5.31l-127.34-415.95a8.003 8.003 0 0 1 5.31-9.99l65.97-20.2 191.25-58.54 65.97-20.2a7.99 7.99 0 0 1 9.99 5.3l32.55 106.32Z"
                  />
                  <path
                    fill="#3f3d56"
                    d="m449.226 140.174-39.23-128.14a16.994 16.994 0 0 0-21.23-11.28l-92.75 28.39-191.24 58.55-92.75 28.4a17.015 17.015 0 0 0-11.28 21.23l134.08 437.93a17.027 17.027 0 0 0 16.26 12.03 16.79 16.79 0 0 0 4.97-.75l63.58-19.46 2-.62v-2.09l-2 .61-64.17 19.65a15.015 15.015 0 0 1-18.73-9.95L2.666 136.734a14.98 14.98 0 0 1 9.95-18.73l92.75-28.4 191.24-58.54 92.75-28.4a15.156 15.156 0 0 1 4.41-.66 15.015 15.015 0 0 1 14.32 10.61l39.05 127.56.62 2h2.08Z"
                  />
                  <path
                    fill="#f78e2a"
                    d="M122.68 127.82a9.016 9.016 0 0 1-8.61-6.366l-12.88-42.072a8.999 8.999 0 0 1 5.97-11.24L283.1 14.278a9.009 9.009 0 0 1 11.24 5.971l12.88 42.072a9.01 9.01 0 0 1-5.97 11.241l-175.94 53.864a8.976 8.976 0 0 1-2.63.395Z"
                  />
                  <circle cx={190.154} cy={24.955} r={20} fill="#f78e2a" />
                  <circle cx={190.154} cy={24.955} r={12.665} fill="#fff" />
                  <path
                    fill="#e6e6e6"
                    d="M602.636 582.174h-338a8.51 8.51 0 0 1-8.5-8.5v-405a8.51 8.51 0 0 1 8.5-8.5h338a8.51 8.51 0 0 1 8.5 8.5v405a8.51 8.51 0 0 1-8.5 8.5Z"
                  />
                  <path
                    fill="#3f3d56"
                    d="M447.136 140.174h-210.5a17.024 17.024 0 0 0-17 17v407.8l2-.61v-407.19a15.018 15.018 0 0 1 15-15h211.12Zm183.5 0h-394a17.024 17.024 0 0 0-17 17v458a17.024 17.024 0 0 0 17 17h394a17.024 17.024 0 0 0 17-17v-458a17.024 17.024 0 0 0-17-17Zm15 475a15.018 15.018 0 0 1-15 15h-394a15.018 15.018 0 0 1-15-15v-458a15.018 15.018 0 0 1 15-15h394a15.018 15.018 0 0 1 15 15Z"
                  />
                  <path
                    fill="#f78e2a"
                    d="M525.636 184.174h-184a9.01 9.01 0 0 1-9-9v-44a9.01 9.01 0 0 1 9-9h184a9.01 9.01 0 0 1 9 9v44a9.01 9.01 0 0 1-9 9Z"
                  />
                  <circle cx={433.636} cy={105.174} r={20} fill="#f78e2a" />
                  <circle cx={433.636} cy={105.174} r={12.182} fill="#fff" />
                </svg>
                <Typography>No Verifier Information Found!</Typography>
                {verifiers?.data?.length === 0 && (
                  <Button
                    startIcon={<AddCircleRounded />}
                    variant="contained"
                    onClick={handleNewEmployee}
                  >
                    New Verifier
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* <NewEmployee open={openNewEmployee} setOpen={setOpenNewEmployee} /> */}
    </Container>
  );
};

const ContactCardSkeleton = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        margin: 1,
        padding: 2,
        width: { xs: "100%", sm: 220 },
        height: "auto",
        borderRadius: 1,
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        bgcolor: "grey.300",
      }}
    >
      <Skeleton variant="rectangular" width="100%" height={118} />
      {/* Placeholder for image */}
      <Skeleton variant="text" width="80%" /> {/* Placeholder for name */}
      <Skeleton variant="text" /> {/* Placeholder for additional line */}
      <Skeleton variant="text" /> {/* Placeholder for another line */}
    </Box>
  );
};

export default ViewEmployees;
