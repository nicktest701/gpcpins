import { LoadingButton } from "@mui/lab";
import {

  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {  useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { generatePins } from "../../config/keyGenerator";
import { tableIcons } from "../../config/tableIcons";
import _ from "lodash";
import Pin from "../pin&serials/Pin";
import Serial from "../pin&serials/Serials";
import CustomTitle from "../../components/custom/CustomTitle";
import { useAuth } from "../../context/providers/AuthProvider";

import CustomizedMaterialTable from "@/components/tables/CustomizedMaterialTable";

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




// ─── Component ──────────────────────────────────────────────────────────────
function PinsGenerator() {

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

       

        {canExport && (
          <CustomizedMaterialTable
            title={`${fileName}`}
            icons={tableIcons}
            columns={[
              { title: "id", field: "id", hidden: true, export: true },
              { title: "Pin", field: "pin", hidden: !isPinChecked },
              { title: "Serial", field: "serial", hidden: !isSerialChecked },
            ]}
            data={data}
            showExportButton={canExport}
            options={{
              search: false,
              exportFileName: fileName,

            }}
          />
        )}
      </Stack>
    </>
  );
}

export default PinsGenerator;
