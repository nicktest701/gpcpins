import { Mail, MapOutlined, Phone } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import PinDropIcon from "@mui/icons-material/PinDrop";
import MyLocationIcon from "@mui/icons-material/MyLocation";

function Footer() {
  const getLocation = () => {
    const position = [6.70675631287526, -1.6189752122036272];
    const destination = `${position[0]},${position[1]}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div className="main-footer">
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "secondary.contrastText",
          py: 1,
          mt: 4,
          pb: { xs: 5, md: 0 },
        }}
      >
        <Container
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "flex-start",
            py: 1,
            gap: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="body1" color="secondary" paragraph>
              Quick Links
            </Typography>
            <Link className="footer-link" to="/">
              Home
            </Link>

            <Link className="footer-link" to="/airtime/transactions">
              Airtime
            </Link>
            <Link className="footer-link" to="/bundle/transactions">
              Data Bundle
            </Link>
            <a
              className="footer-link"
              target="_blank"
              href="https://gpcpins.com/privacy-policy"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
            <a
              className="footer-link"
              target="_blank"
              href="https://gpcpins.com/terms-and-conditions"
              rel="noreferrer"
            >
              Terms and Conditions
            </a>
          </Stack>
          <Stack spacing={1}>
            <Typography variant="body1" color="secondary" paragraph>
              Contact Info
            </Typography>
            <Stack
              width="100%"
              alignItems="flex-start"
              justifyContent="flex-start"
              spacing={1}
            >
              <div className="footer-contact-item">
                <PinDropIcon fontSize="small" />
                <span>
                  Menhyia-Opposite St. Anne&apos;s International School
                </span>
              </div>
              <div className="footer-contact-item">
                <Phone fontSize="small" />
                <span>P.O Box KS 12656,Adum-Kumasi</span>
              </div>
              <div className="footer-contact-item">
                <Mail fontSize="small" />
                <span> info@gpcpins.com</span>
              </div>
              <div className="footer-contact-item">
                <MyLocationIcon fontSize="small" />
                <span> AK-004-5284</span>
              </div>
              <Button
                variant="outlined"
                size="small"
                sx={{ py: 0, px: 1 }}
                startIcon={<MapOutlined />}
                onClick={getLocation}
              >
                Get Directions
              </Button>
            </Stack>
          </Stack>

          <Box>
            <Stack>
              <Typography variant="body1" color="secondary" paragraph>
                Call Center
              </Typography>
              <Typography variant="body2">
                Our Support & Sales Team is Available 24/7 to Answer Your
                Queries.
              </Typography>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Typography color="#f78e2a">Business Lines :</Typography>
                <a className="footer-line-link" href="tel:+233244012766">
                  +233244012766
                </a>
                <a className="footer-line-link" href="tel:+233277155144">
                  +233277155144
                </a>
                <a className="footer-line-link" href="tel:+233208775458">
                  +233208775458
                </a>
                <a className="footer-line-link" href="tel:+233555763713">
                  +233555763713
                </a>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Typography color="#f78e2a">Office Lines : </Typography>
                <a className="footer-line-link" href="tel:0322036582">
                  0322036582
                </a>
                <a className="footer-line-link" href="tel:0555763713">
                  0555763713
                </a>
                <a className="footer-line-link" href="tel:+233277155144">
                  +233277155144
                </a>
                <a className="footer-line-link" href="tel:+233208775458">
                  +233208775458
                </a>
              </div>
            </Stack>
            {/* <Stack>
              <Typography variant="body1" color="primary" paragraph>
                Follow Us
              </Typography>
              <Stack direction="row" spacing={1}>
                <Whatsapp height={24} width={24} />
                <Facebook height={24} width={24} />
                <Twitter height={24} width={24} />
                <Instagram height={24} width={24} />
              </Stack>
            </Stack> */}
          </Box>
        </Container>
        <Container sx={{ py: 1, pb: 4 }}>
          <Divider flexItem />
          <Typography variant="body2" textAlign="center" paragraph pt={1}>
            Copyright &copy; {new Date().getFullYear()} | Gab Powerful Consult
          </Typography>
          <Typography textAlign="center" variant="body2">
            Designed by ❤
            <a
              rel="noreferrer"
              target="_blank"
              href="https://nanaakwasi-8d50e.web.app/"
              style={{
                textDecoration: "underline",
                color: "#5CE0E6",
                marginLeft: "4px",
              }}
            >
              nanaakwasi.dev
            </a>
            {"  "}❤
          </Typography>
        </Container>
      </Box>
    </div>
  );
}

export default Footer;
