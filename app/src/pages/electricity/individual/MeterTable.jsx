import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,

  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const MeterTable = ({ meters }) => {
  const navigate = useNavigate();

  const handleRowClick = (meter) => {
    // customDispatch({
    //   type: "openViewMeter",
    //   payload: { open: true, details: meter },
    // });
         navigate(`/electricity/prepaid/${meter.number}/buy`, {
        state: {
          meterDetails: {
            number: meter?.number,
            name: meter.name,
            address: meter.address,
            spn: meter.spn,
            // any other data
          },
        },
      });
  };

  return (
    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: "grey.100" }}>
          <TableRow>
            <TableCell>Meter Number</TableCell>
            <TableCell>SPN Number</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {meters.map((meter) => (
            <TableRow
              key={meter.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => handleRowClick(meter)}
            >
              <TableCell>
                <Typography fontWeight="medium">{meter.number}</Typography>
              </TableCell>
              <TableCell>{meter.spn || "—"}</TableCell>
              <TableCell>{meter.name || "—"}</TableCell>
              <TableCell>
                <Chip
                  label={`${meter.type} (IMES)`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(meter);
                  }}
                >
                  Buy Prepaid
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MeterTable;