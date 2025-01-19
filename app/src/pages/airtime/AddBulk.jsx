import { useContext, useEffect, useState } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import { ArrowForward, Close } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import { currencyFormatter } from "../../constants";
import _ from "lodash";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ServiceProvider from "../../components/ServiceProvider";
import { AuthContext } from "../../context/providers/AuthProvider";
import {
  getInternationalMobileFormat,
  isValidPartner,
} from "../../constants/PhoneCode";

function AddBulk() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);
  const [provider, setProvider] = useState("None");
  const [providerErr, setProviderErr] = useState("");
  const [price, setPrice] = useState(0);
  const [pricingList, setPricingList] = useState([]);
  const [pricingError, setPricingError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(user?.phonenumber);
  const [phoneNumberErr, setPhoneNumberErr] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState(
    user?.phonenumber
  );
  const [confirmPhonenumberErr, setConfirmPhonenumberErr] = useState("");

  useEffect(() => {
    if (searchParams.get("info") !== null) {
      setPricingList(JSON.parse(searchParams.get("info")));
    }
  }, [searchParams]);

  const handleAddAirtimeType = () => {
    setPricingError("");
    setProviderErr("");
    setPhoneNumberErr("");
    setConfirmPhonenumberErr("");
    if (provider === "None") {
      setProviderErr("Required*");
      return;
    }

    if (phoneNumber === "") {
      setPhoneNumberErr("Required*");
      return;
    }

    if (!isValidPartner(provider, getInternationalMobileFormat(phoneNumber))) {
      setPhoneNumberErr(`Invalid ${provider} number`);
      return;
    }

    if (phoneNumber !== confirmPhonenumber) {
      setConfirmPhonenumberErr("Recipient Numbers do not match*");
      return;
    }

    if (price === "") {
      setPricingError("Required*");
      return;
    }
    if (price < 10) {
      setPricingError("Mininum Amount you can transfer is GHS 10*");
      return;
    }
    const item = {
      id: uuid(),
      type: provider,
      recipient: getInternationalMobileFormat(phoneNumber),
      price: Number(price),
    };

    setPricingList((prev) => {
      return _.values(_.merge(_.keyBy([...prev, item], "type")));
    });

    setProviderErr("");
    setPhoneNumber("");
    setConfirmPhonenumber("");
    setConfirmPhonenumberErr("");
    setPricingError("");
    setProvider("None");
    setPrice(0);
  };

  const handleRemoveAirtimeType = (id) => {
    const filteredAirtimes = pricingList.filter((item) => item.id !== id);
    setPricingList(filteredAirtimes);
  };

  const handleProceed = () => {
    sessionStorage.setItem(
      "value-x",
      _.sumBy(pricingList, ({ price }) => Number(price))
    );

    if (!user?.id) {
      navigate(
        `/user/login?redirect_url=${pathname}?link=${searchParams.get(
          "link"
        )}&info=${JSON.stringify(pricingList)}`
      );
      return;
    }

    navigate(
      `bulk_airtime/buy?link=${searchParams.get(
        "link"
      )}&type=Bulk&info=${JSON.stringify(pricingList)}`
    );
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        py: 4,
        my: 4,
        boxShadow: "20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff",
        borderRadius: 2,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <ServiceProvider
          size="large"
          value={provider}
          setValue={setProvider}
          error={providerErr !== ""}
          helperText={providerErr}
        />
        <TextField
          type="tel"
          inputMode="tel"
          variant="outlined"
          label="Recipient Number"
          fullWidth
          required
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={phoneNumberErr ? true : false}
          helperText={phoneNumberErr}
        />
        <TextField
          type="tel"
          inputMode="tel"
          variant="outlined"
          label="Confirm Recipient Number"
          fullWidth
          required
          value={confirmPhonenumber}
          onChange={(e) => setConfirmPhonenumber(e.target.value)}
          error={Boolean(confirmPhonenumberErr)}
          helperText={confirmPhonenumberErr}
          margin="dense"
        />

        <TextField
          fullWidth
          type="number"
          inputMode="decimal"
          label="Amount"
          placeholder="Amount here"
          value={price}
          onChange={(e) => setPrice(e.target.valueAsNumber)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography>GHS</Typography>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Typography>p</Typography>
              </InputAdornment>
            ),
          }}
          error={Boolean(pricingError)}
          helperText={pricingError}
        />

        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={handleAddAirtimeType}
        >
          Add
        </Button>
      </Stack>
      {pricingList.length !== 0 && (
        <List sx={{ bgcolor: "secondary.main", mt: 2 }}>
          {pricingList?.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`${item.type}  (${item?.recipient})`}
                primaryTypographyProps={{
                  fontWeight: "bold",
                  color: "primary.contrastText",
                }}
              />
              <ListItemSecondaryAction sx={{ color: "white" }}>
                ({currencyFormatter(item?.price)})
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleRemoveAirtimeType(item?.id)}
                >
                  <Close />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {pricingList.length > 0 && (
            <div style={{ width: "300px", marginInline: "auto" }}>
              <Typography color="success.main" textAlign="right" paragraph>
                {currencyFormatter(_.sumBy(pricingList, "price"))}
              </Typography>
              <Button
                variant="contained"
                onClick={handleProceed}
                endIcon={<ArrowForward />}
                fullWidth
              >
                Proceed to Recharge
              </Button>
            </div>
          )}
        </List>
      )}
    </Container>
  );
}

export default AddBulk;
