import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  ButtonGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MaterialTable from "@material-table/core";
import { useContext, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { generatePins } from "../../config/keyGenerator";
import { tableIcons } from "../../config/tableIcons";
import _ from "lodash";
import Pin from "../pin&serials/Pin";
import Serial from "../pin&serials/Serials";
import CustomTitle from "../../components/custom/CustomTitle";
import { AuthContext } from "../../context/providers/AuthProvider";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

// ─── Yup schema ────────────────────────────────────────────────────────────
const schema = yup
  .object({
    fileName: yup
      .string()
      .required("File name is required")
      .min(1, "File name cannot be empty"),
    isPinChecked: yup.boolean(),
    pinOption: yup.string().when("isPinChecked", {
      is: true,
      then: (s) => s.required(),
    }),
    pinNumber: yup
      .number()
      .typeError("Must be a number")
      .when("isPinChecked", {
        is: true,
        then: (s) =>
          s
            .min(1, "At least 1 pin required")
            .max(10000, "Max 10 000 pins")
            .required(),
      }),
    pinLength: yup
      .number()
      .typeError("Must be a number")
      .when("isPinChecked", {
        is: true,
        then: (s) =>
          s
            .min(4, "Minimum length is 4")
            .max(32, "Maximum length is 32")
            .required(),
      }),
    isSerialChecked: yup.boolean(),
    serialOption: yup.string().when("isSerialChecked", {
      is: true,
      then: (s) => s.required(),
    }),
    serialNumber: yup
      .number()
      .typeError("Must be a number")
      .when("isSerialChecked", {
        is: true,
        then: (s) =>
          s
            .min(1, "At least 1 serial required")
            .max(10000, "Max 10 000 serials")
            .required(),
      }),
    serialLength: yup
      .number()
      .typeError("Must be a number")
      .when("isSerialChecked", {
        is: true,
        then: (s) =>
          s
            .min(4, "Minimum length is 4")
            .max(32, "Maximum length is 32")
            .required(),
      }),
  })
  .test(
    "at-least-one",
    "Select at least Pins or Serials",
    (val) => val.isPinChecked || val.isSerialChecked,
  );

// ─── CSV / Excel helpers ────────────────────────────────────────────────────
function buildRows(data, hasPins, hasSerials) {
  return data.map((row) => {
    const out = {};
    if (hasPins) out.pin = row.pin ?? "";
    if (hasSerials) out.serial = row.serial ?? "";
    return out;
  });
}

function exportCSV(data, hasPins, hasSerials, fileName) {
  const rows = buildRows(data, hasPins, hasSerials);
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${r[h]}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportExcel(data, hasPins, hasSerials, fileName) {
  // Dynamic import so we don't force xlsx as a hard dependency at load time.
  const XLSX = await import("xlsx");
  const rows = buildRows(data, hasPins, hasSerials);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pins & Serials");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

// ─── Component ──────────────────────────────────────────────────────────────
function PinsGenerator() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fileName: "PINS & SERIALS",
      isPinChecked: true,
      pinOption: "numbers",
      pinNumber: 10,
      pinLength: 10,
      isSerialChecked: true,
      serialOption: "numbers",
      serialNumber: 10,
      serialLength: 10,
    },
  });

  const isPinChecked = watch("isPinChecked");
  const isSerialChecked = watch("isSerialChecked");
  const fileName = watch("fileName");

  const keysType = useMemo(
    () =>
      isPinChecked && isSerialChecked
        ? "both"
        : isPinChecked
          ? "pin"
          : "serial",
    [isPinChecked, isSerialChecked],
  );

  const onSubmit = async (values) => {
    setIsGenerating(true);
    try {
      if (keysType === "pin") {
        const pins = generatePins(
          values.pinLength,
          values.pinNumber,
          values.pinOption,
          "pin",
        );
        setData(pins);
      } else if (keysType === "serial") {
        const serials = generatePins(
          values.serialLength,
          values.serialNumber,
          values.serialOption,
          "serial",
        );
        setData(serials);
      } else {
        const pins = generatePins(
          values.pinLength,
          values.pinNumber,
          values.pinOption,
          "pin",
        );
        const serials = generatePins(
          values.serialLength,
          values.serialNumber,
          values.serialOption,
          "serial",
        );
        const [p, s] = await Promise.all([pins, serials]);
        setData(_.values(_.merge(_.keyBy(p, "id"), _.keyBy(s, "id"))));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const canExport = data.length > 0;

  return (
    <>
      <CustomTitle
        title="Pins & Serials Generator"
        subtitle="Generate all your pins & serials for your vouchers & tickets"
        divider
      />

      <Typography sx={{ paddingY: 2, textAlign: "center" }} variant="body2">
        Select how many pins / serials you need, then click{" "}
        <strong>Generate</strong>.
      </Typography>

      {/* Pin + Serial panels — still accept their own state via setValue */}
      <Stack
        direction={{ sm: "column", md: "row" }}
        spacing={5}
        paddingY={2}
        width="inherit"
        justifyContent="center"
      >
        <Pin
          isPinChecked={isPinChecked}
          setIsPinChecked={(v) => setValue("isPinChecked", v)}
          pinOption={watch("pinOption")}
          setPinOption={(v) => setValue("pinOption", v)}
          pinNumber={watch("pinNumber")}
          setPinNumber={(v) => setValue("pinNumber", v)}
          pinLength={watch("pinLength")}
          setPinLength={(v) => setValue("pinLength", v)}
        />

        <Serial
          isSerialChecked={isSerialChecked}
          setIsSerialChecked={(v) => setValue("isSerialChecked", v)}
          serialOption={watch("serialOption")}
          setSerialOption={(v) => setValue("serialOption", v)}
          serialNumber={watch("serialNumber")}
          setSerialNumber={(v) => setValue("serialNumber", v)}
          serialLength={watch("serialLength")}
          setSerialLength={(v) => setValue("serialLength", v)}
        />
      </Stack>

      <Stack justifyContent="center" paddingY={3} spacing={3}>
        {/* File name field — managed by RHF */}
        <Controller
          name="fileName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              size="small"
              label="Export file name"
              fullWidth
              error={!!errors.fileName}
              helperText={errors.fileName?.message}
            />
          )}
        />

        {/* Schema-level error (neither checked) */}
        {errors[""] && (
          <Typography color="error" variant="caption">
            {errors[""].message}
          </Typography>
        )}

        <LoadingButton
          variant="contained"
          color="primary"
          loading={isGenerating}
          onClick={handleSubmit(onSubmit)}
        >
          Generate
        </LoadingButton>

        {/* Export buttons */}
        {canExport && (
          <Box display="flex" justifyContent="flex-end">
            <ButtonGroup variant="outlined" size="small">
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() =>
                  exportCSV(data, isPinChecked, isSerialChecked, fileName)
                }
              >
                Export CSV
              </Button>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() =>
                  exportExcel(data, isPinChecked, isSerialChecked, fileName)
                }
              >
                Export Excel
              </Button>
            </ButtonGroup>
          </Box>
        )}

        {canExport && (
          <MaterialTable
            title={`${fileName} Pins & Serials`}
            icons={tableIcons}
            columns={[
              { title: "id", field: "id", hidden: true, export: true },
              { title: "Pin", field: "pin", hidden: !isPinChecked },
              { title: "Serial", field: "serial", hidden: !isSerialChecked },
            ]}
            data={data}
            options={{
              search: false,
              exportFileName: fileName,
              exportAllData: true,
              exportButton: false, // replaced by our own buttons above
            }}
          />
        )}
      </Stack>
    </>
  );
}

export default PinsGenerator;

// import { LoadingButton } from "@mui/lab";
// import { Stack, TextField, Typography } from "@mui/material";
// import MaterialTable from "@material-table/core";
// import { useContext, useMemo, useState } from "react";
// import { generatePins } from "../../config/keyGenerator";
// import { tableIcons } from "../../config/tableIcons";
// import _ from "lodash";
// import Pin from "../pin&serials/Pin";
// import Serial from "../pin&serials/Serials";
// import CustomTitle from "../../components/custom/CustomTitle";
// import { AuthContext } from "../../context/providers/AuthProvider";

// function PinsGenerator() {
//   const { user } = useContext(AuthContext);
//   const [data, setData] = useState([]);
//   const [fileName, setFileName] = useState("Pins & Serials");
//   const [isPinChecked, setIsPinChecked] = useState(true);
//   const [pinOption, setPinOption] = useState("numbers");
//   const [pinNumber, setPinNumber] = useState(10);
//   const [pinLength, setPinLength] = useState(10);
//   const [isSerialChecked, setIsSerialChecked] = useState(true);
//   const [serialOption, setSerialOption] = useState("numbers");
//   const [serialNumber, setSerialNumber] = useState(10);
//   const [serialLength, setSerialLength] = useState(10);

//   const keysType = useMemo(() => {
//     const isChecked =
//       isPinChecked && isSerialChecked
//         ? "both"
//         : isPinChecked
//           ? "pin"
//           : "serial";

//     return isChecked;
//   }, [isPinChecked, isSerialChecked]);

//   const handleGenerate = () => {
//     if (keysType === "pin") {
//       const pins = generatePins(pinLength, pinNumber, pinOption, "pin");

//       setData(pins);
//       return;
//     }
//     if (keysType === "serial") {
//       const serials = generatePins(
//         serialLength,
//         serialNumber,
//         serialOption,
//         "serial",
//       );

//       setData(serials);
//       return;
//     }
//     const pins = generatePins(pinLength, pinNumber, pinOption, "pin");
//     const serials = generatePins(
//       serialLength,
//       serialNumber,
//       serialOption,
//       "serial",
//     );

//     Promise.all([pins, serials]).then((a) => {
//       const both = _.values(_.merge(_.keyBy(a[0], "id"), _.keyBy(a[1], "id")));

//       setData(both);
//     });
//   };

//   return (
//     <>
//       <>
//         <CustomTitle
//           title="Pins & Serials Generator"
//           subtitle="Generate all your pins & serials for your vouchers & tickets"
//           divider
//         />

//         <Typography sx={{ paddingY: 2, textAlign: "center" }} variant="body2">
//           To generate random pins and serials, select how many you need and
//           click the blue generate button
//         </Typography>
//         <Stack
//           direction={{ sm: "column", md: "row" }}
//           spacing={5}
//           paddingY={2}
//           width="inherit"
//           justifyContent="center"
//         >
//           <Pin
//             isPinChecked={isPinChecked}
//             setIsPinChecked={setIsPinChecked}
//             pinOption={pinOption}
//             setPinOption={setPinOption}
//             pinNumber={pinNumber}
//             setPinNumber={setPinNumber}
//             pinLength={pinLength}
//             setPinLength={setPinLength}
//           />

//           <Serial
//             isSerialChecked={isSerialChecked}
//             setIsSerialChecked={setIsSerialChecked}
//             serialOption={serialOption}
//             setSerialOption={setSerialOption}
//             serialNumber={serialNumber}
//             setSerialNumber={setSerialNumber}
//             serialLength={serialLength}
//             setSerialLength={setSerialLength}
//           />
//         </Stack>
//         <Stack justifyContent="center" paddingY={3} spacing={3}>
//           <TextField
//             size="small"
//             label="Export file name"
//             value={fileName}
//             onChange={(e) => setFileName(e.target.value?.toUpperCase())}
//             fullWidth
//           />

//           <LoadingButton
//             variant="contained"
//             color="primary"
//             onClick={handleGenerate}
//           >
//             Generate
//           </LoadingButton>

//           {data.length !== 0 && (
//             <MaterialTable
//               title={`${fileName} Pins & Serials`}
//               icons={tableIcons}
//               columns={[
//                 {
//                   title: "id",
//                   field: "id",
//                   hidden: true,
//                   export: true,
//                 },
//                 {
//                   title: "pin",
//                   field: "pin",
//                   hidden: !isPinChecked,
//                 },
//                 {
//                   title: "serial",
//                   field: "serial",
//                   hidden: !isSerialChecked,
//                 },
//               ]}
//               data={data}
//               options={{

//                 search: false,
//                 exportFileName: fileName,
//                 exportAllData: true,
//                 exportMenu:{
//                   csv: true,
//                   pdf: true,
//                 },
//                 exportButton: {
//                   pdf: true,
//                   csv: true,
//                 },
//                 // exportButton: user?.permissions?.includes(
//                 //   "Export Pins & Serials"
//                 // )
//                 //   ? {
//                 //       pdf: false,
//                 //       csv: true,
//                 //     }
//                 //   : false,
//               }}
//             />
//           )}
//         </Stack>
//       </>
//     </>
//   );
// }

// export default PinsGenerator;
