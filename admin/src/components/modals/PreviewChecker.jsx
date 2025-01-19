import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  useTheme,
} from "@mui/material";
import _ from "lodash";
import Swal from "sweetalert2";
import { CustomContext } from "../../context/providers/CustomProvider";
import PropTypes from "prop-types";
import MaterialTable from "material-table";
import { tableIcons } from "../../config/tableIcons";
import { useParams, useSearchParams } from "react-router-dom";
import CustomDialogTitle from "../dialogs/CustomDialogTitle";
import CustomTitle from "../custom/CustomTitle";
import { hidePin } from "../../config/hideDetails";

function PreviewChecker() {
  const { palette } = useTheme();
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customState, customDispatch } = useContext(CustomContext);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState({ severity: "", text: "" });

  const checker = customState?.loadedChecker;

  useEffect(() => {
    setIsLoading(true);
    setMsg({ text: "", severity: "" });
    setData([]);

    //auto capitalize data columns
    const capitalizeColumns = _.map(checker.meta, _.lowerCase);

    //Check if data columns matches preferred columns
    const itExists = capitalizeColumns.some((column) =>
      ["id", "pin", "serial"].includes(column)
    );

    if (!itExists && itExists !== undefined) {
      setMsg({
        severity: "error",
        text: "The columns in the selected file does not match with Serials and Pins.Please try renaming your columns or choose an appropriate file",
      });
    } else {
      setData(checker.data);
    }
    setIsLoading(false);
  }, [checker]);

  const handleAddNewCheckers = () => {
    customDispatch({ type: "newCheckers", payload: checker?.data });
    handleClosePreviewChecker();
  };

  //CLOSE File Dialog
  const handleCloseDialog = () => {
    Swal.fire({
      title: "Exiting",
      text: "Do you want to exit?",
      confirmButtonColor: palette.primary.main,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        handleClosePreviewChecker();
      }
    });
  };

  const handleClosePreviewChecker = () => {
    setSearchParams((params) => {
      params.delete("preview");
      // params.delete("preview");
      return params;
    });
  };

  return (
    <Dialog
      maxWidth="lg"
      fullWidth
      fullScreen
      open={Boolean(searchParams.get("preview"))}
      sx={{ cursor: isLoading ? "wait" : "default" }}
    >
      <CustomDialogTitle onClose={handleCloseDialog} />

      <DialogContent sx={{ padding: 2 }}>
        {msg.text && <Alert severity={msg.severity}>{msg.text}</Alert>}

        <Container maxWidth="lg">
          <CustomTitle
            title="PINS & SERIALS"
            subtitle="View details of pins and serials loaded from your csv or excel file."
          />

          <Box display="flex" justifyContent="flex-end" gap={2} py={2}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              disabled={data?.length === 0 ? true : false}
              variant="contained"
              onClick={handleAddNewCheckers}
            >
              Import Data
            </Button>
          </Box>
          <MaterialTable
            isLoading={isLoading}
            title="Serials & Pins Preview"
            icons={tableIcons}
            columns={[
              {
                title: "ID",
                field: "id",
                hidden: true,
              },
              {
                title: "Serial No.",
                field: "serial",
                hidden: !_.map(checker.meta, _.lowerCase)?.includes("serial"),
                render: ({ serial }) => hidePin(serial),
                export: false,
              },
              {
                title: "Pin Code",
                field: "pin",
                hidden: !_.map(checker.meta, _.lowerCase)?.includes("pin"),
                render: ({ pin }) => hidePin(pin),
                export: false,
              },
              {
                title: "Serial",
                field: "serial",
                hidden: true,
              },

              {
                title: "Pin",
                field: "pin",
                hidden: true,
              },
              {
                title: "Seat",
                field: "id",
                hidden: category !== "bus",
                render: (rowData) => parseInt(rowData?.id) + 1,
              },
              {
                title: "Type",
                field: "type",
                hidden: !["stadium", "cinema"].includes(category),
              },
            ]}
            data={data ?? []}
            options={{
              filtering: false,
              sorting: false,
              selection: false,
              grouping: false,
              search: false,
              pageSize: 10,
              pageSizeOptions: [10, 20, 30],
            }}
          />
        </Container>
      </DialogContent>
    </Dialog>
  );
}

PreviewChecker.prototype = {
  isMatch: PropTypes.bool.isRequired,
  setIsMatch: PropTypes.func,
};

export default PreviewChecker;
