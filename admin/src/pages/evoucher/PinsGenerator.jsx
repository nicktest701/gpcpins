import { LoadingButton } from "@mui/lab";
import { Stack, TextField, Typography } from "@mui/material";
import MaterialTable from "material-table";
import { useContext, useMemo, useState } from "react";
import { generatePins } from "../../config/keyGenerator";
import { tableIcons } from "../../config/tableIcons";
import _ from "lodash";
import Pin from "../pin&serials/Pin";
import Serial from "../pin&serials/Serials";
import CustomTitle from "../../components/custom/CustomTitle";
import { AuthContext } from "../../context/providers/AuthProvider";

function PinsGenerator() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState("Pins & Serials");
  const [isPinChecked, setIsPinChecked] = useState(true);
  const [pinOption, setPinOption] = useState("numbers");
  const [pinNumber, setPinNumber] = useState(10);
  const [pinLength, setPinLength] = useState(10);
  const [isSerialChecked, setIsSerialChecked] = useState(true);
  const [serialOption, setSerialOption] = useState("numbers");
  const [serialNumber, setSerialNumber] = useState(10);
  const [serialLength, setSerialLength] = useState(10);

  const keysType = useMemo(() => {
    const isChecked =
      isPinChecked && isSerialChecked
        ? "both"
        : isPinChecked
        ? "pin"
        : "serial";

    return isChecked;
  }, [isPinChecked, isSerialChecked]);

  const handleGenerate = () => {
    if (keysType === "pin") {
      const pins = generatePins(pinLength, pinNumber, pinOption, "pin");

      setData(pins);
      return;
    }
    if (keysType === "serial") {
      const serials = generatePins(
        serialLength,
        serialNumber,
        serialOption,
        "serial"
      );

      setData(serials);
      return;
    }
    const pins = generatePins(pinLength, pinNumber, pinOption, "pin");
    const serials = generatePins(
      serialLength,
      serialNumber,
      serialOption,
      "serial"
    );

    Promise.all([pins, serials]).then((a) => {
      const both = _.values(_.merge(_.keyBy(a[0], "id"), _.keyBy(a[1], "id")));

      setData(both);
    });
  };

  return (
    <>
      <>
        <CustomTitle
          title="Pins & Serials Generator"
          subtitle="Generate all your pins & serials for your vouchers & tickets"
          divider
        />

        <Typography sx={{ paddingY: 2, textAlign: "center" }} variant="body2">
          To generate random pins and serials, select how many you need and
          click the blue generate button
        </Typography>
        <Stack
          direction={{ sm: "column", md: "row" }}
          spacing={5}
          paddingY={2}
          width="inherit"
          justifyContent="center"
        >
          <Pin
            isPinChecked={isPinChecked}
            setIsPinChecked={setIsPinChecked}
            pinOption={pinOption}
            setPinOption={setPinOption}
            pinNumber={pinNumber}
            setPinNumber={setPinNumber}
            pinLength={pinLength}
            setPinLength={setPinLength}
          />

          <Serial
            isSerialChecked={isSerialChecked}
            setIsSerialChecked={setIsSerialChecked}
            serialOption={serialOption}
            setSerialOption={setSerialOption}
            serialNumber={serialNumber}
            setSerialNumber={setSerialNumber}
            serialLength={serialLength}
            setSerialLength={setSerialLength}
          />
        </Stack>
        <Stack justifyContent="center" paddingY={3} spacing={3}>
          <TextField
            size="small"
            label="Export file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value?.toUpperCase())}
            fullWidth
          />

          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleGenerate}
          >
            Generate
          </LoadingButton>

          {data.length !== 0 && (
            <MaterialTable
              title={`${fileName} Pins & Serials`}
              icons={tableIcons}
              columns={[
                {
                  title: "id",
                  field: "id",
                  hidden: true,
                  export: true,
                },
                {
                  title: "pin",
                  field: "pin",
                  hidden: !isPinChecked,
                },
                {
                  title: "serial",
                  field: "serial",
                  hidden: !isSerialChecked,
                },
              ]}
              data={data}
              options={{
                search: false,
                exportFileName: fileName,
                exportAllData: true,

                exportButton: user?.permissions?.includes(
                  "Export Pins & Serials"
                )
                  ? {
                      pdf: false,
                      csv: true,
                    }
                  : false,
              }}
            />
          )}
        </Stack>
      </>
    </>
  );
}

export default PinsGenerator;
