import {
  Autocomplete,
  Dialog,
  DialogContent,
  Input,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import _ from "lodash";
import { useContext, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { postBroadcastMessage } from "../../api/broadcastMessageAPI";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import {
  isValidEmail,
  isValidPhoneNumber,
  trimObject,
} from "../../config/validation";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { readXLSX } from "../../config/readXLSX";
import { readCSV } from "../../config/readCSV";

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],
  ["link", "image", "video", "formula"],

  // [{ header: 1 }, { header: 2 }], // custom button values
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  // [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  //   ["undo", "redo"],
  ["clean"], // remove formatting button
];

const CSV_FILE_TYPE = "text/csv";
const XLSX_FILE_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const XLS_FILE_TYPE = "application/vnd.ms-excel";

function AddMessage({ open, setOpen }) {
  const [dataPath, setDataPath] = useState("");
  const [content, setContent] = useState([]);
  const [groupErr, setGroupErr] = useState("");
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const initialValues = {
    type: "SMS",
    recipient: "",
    title: "",
    message: "",
    phoneNumber: "",
    email: "",
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postBroadcastMessage,
  });
  const onSubmit = (values) => {
    let payload = {};

    if (values.recipient === "Group") {
      if (content.length === 0) {
        setGroupErr("Required*");
        return;
      }
      values = {
        ...values,
        group: content,
      };
    }

    payload = trimObject(values);

    mutateAsync(payload, {
      onSettled: () => {
        queryClient.invalidateQueries(["broadcast-messages"]);
        queryClient.invalidateQueries(["notifications"]);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", data));
        handleClose();
      },
      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <CustomDialogTitle
        title="New Message"
        subtitle="Enter your message details here"
        onClose={handleClose}
      />
      <DialogContent>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          enableReinitialize={true}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            setFieldValue,
          }) => {
            //LOAD Checkers from file excel,csv
            function handleLoadFile(e) {
              setContent([]);
              setGroupErr("");
              const files = e.target.files[0];

              if (!files) return;

              try {
                const reader = new FileReader();
                files.type === CSV_FILE_TYPE
                  ? reader.readAsText(files, "utf-8")
                  : reader.readAsArrayBuffer(files);

                reader.onload = function (event) {
                  let recipients = [];

                  if (
                    files.type === XLSX_FILE_TYPE ||
                    files.type === XLS_FILE_TYPE
                  ) {
                    recipients = readXLSX(event.target.result);
                  }

                  if (files.type === CSV_FILE_TYPE) {
                    recipients = readCSV(event.target.result);
                  }

                  const data = recipients.flatMap((obj) => Object.values(obj));

                  const inValidRecipients = data?.filter((recipient) =>
                    values?.type === "Email"
                      ? !isValidEmail(recipient)
                      : !isValidPhoneNumber(recipient)
                  );

                  if (!_.isEmpty(inValidRecipients)) {
                    setGroupErr(
                      `Select list contains invalid ${
                        values?.type === "Email"
                          ? "Email address"
                          : "Phone Number"
                      }.Please check and upload again.`
                    );
                  } else {
                    setDataPath(files.name);
                    setContent(data);
                  }
                };
              } catch (error) {
                customDispatch(globalAlertType("error", error));
              }
            }

            return (
              <Stack rowGap={2} py={2}>
                <Autocomplete
                  size="small"
                  options={["Individual", "Group", "Customers", "Employees"]}
                  freeSolo
                  noOptionsText="No option avaiable"
                  value={values.recipient}
                  onChange={(e, value) => setFieldValue("recipient", value)}
                  getOptionLabel={(option) => option || ""}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label="Recipient"
                      error={Boolean(touched.recipient && errors.recipient)}
                      helperText={touched.recipient && errors.recipient}
                    />
                  )}
                />
                <Autocomplete
                  size="small"
                  options={["Email", "SMS"]}
                  freeSolo
                  noOptionsText="No option avaiable"
                  value={values.type}
                  onChange={(e, value) => setFieldValue("type", value)}
                  getOptionLabel={(option) => option || ""}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label="Choose Type"
                      error={Boolean(touched.type && errors.type)}
                      helperText={touched.type && errors.type}
                    />
                  )}
                />
                <TextField
                  label="Message Title"
                  size="small"
                  fullWidth
                  value={values.title}
                  onChange={handleChange("title")}
                  error={Boolean(touched.title && errors.title)}
                  helperText={touched.title && errors.title}
                />

                {values.type === "SMS" && (
                  <>
                    <TextField
                      multiline
                      rows={5}
                      size="small"
                      label="Message here"
                      fullWidth
                      value={values.message}
                      onChange={handleChange("message")}
                      error={Boolean(touched.message && errors.message)}
                      helperText={touched.message && errors.message}
                    />
                    {values.recipient === "Individual" && (
                      <TextField
                        size="small"
                        type="tel"
                        inputMode="tel"
                        label="Recipient Number"
                        required
                        value={values.phoneNumber}
                        onChange={handleChange("phoneNumber")}
                        error={Boolean(
                          touched.phoneNumber && errors.phoneNumber
                        )}
                        helperText={touched.phoneNumber && errors.phoneNumber}
                      />
                    )}
                  </>
                )}

                {values.type === "Email" && (
                  <>
                    <ReactQuill
                      theme="snow"
                      value={values.message}
                      onChange={handleChange("message")}
                      placeholder="Message here"
                      style={{ height: "200px", marginBottom: "30px" }}
                      modules={{
                        history: {
                          // delay: 2000,
                          maxStack: 500,
                          userOnly: true,
                        },

                        toolbar: {
                          container: toolbarOptions,
                        },
                      }}
                    />
                    {values.recipient === "Individual" && (
                      <TextField
                        size="small"
                        type="email"
                        variant="outlined"
                        label="Recipient Email Address"
                        required
                        value={values.email}
                        onChange={handleChange("email")}
                        error={Boolean(touched.email && errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    )}
                  </>
                )}

                {values.recipient === "Group" && (
                  <Stack spacing={1} py={2} width="100%">
                    <small>
                      Select an EXCEL/CSV file containing list of{" "}
                      {values?.type === "SMS"
                        ? "Phone Numbers"
                        : "Email Addresses"}
                    </small>
                    <Input
                      accept=".xlsx,.xls,.csv"
                      type="file"
                      id="pins"
                      name="pins"
                      onChange={handleLoadFile}
                      onClick={(e) => {
                        e.target.value = null;
                        e.currentTarget.value = null;
                      }}
                    />
                    <small
                      style={{
                        color: groupErr !== "" ? "red" : "var(--secondary)",
                      }}
                    >
                      {groupErr || "e.g. *.csv,*.xlsx"}
                    </small>

                    <TextField
                      label="File Name"
                      id="browse"
                      placeholder="Load Data Here"
                      size="small"
                      value={dataPath}
                      fullWidth
                    />
                    {content.length > 0 && (
                      <Typography>
                        Data Preview : [{content?.join(" , ")}]
                      </Typography>
                    )}
                  </Stack>
                )}

                <LoadingButton
                  loading={isLoading}
                  // color='secondary'
                  variant="contained"
                  fullWidth
                  onClick={handleSubmit}
                  sx={{ mt: 8 }}
                >
                  Send
                </LoadingButton>
              </Stack>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default AddMessage;
