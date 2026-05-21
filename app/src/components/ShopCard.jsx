import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

function ShopCard({ title, img, low, content, path, dashboard }) {
  const cardStyles = {
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
    transition: "all 250ms ease-in-out",
    backgroundColor: "#fff",
    boxShadow: "20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff",
    borderRadius: 2,

    ":hover": {
      transform: "scale(1.04)",
    },
  };
  return (
    <Link
      to={path}
      style={{ textDecoration: "none", color: "#333" }}
      className="shop-card"
    >
      <Stack sx={cardStyles} spacing={3} py={2}>
        <img
          src={img}
          alt="voucher_logo"
          style={{
            width: 120,
            height: 120,
            objectFit: "contain",
            backgroundImage: `url(${low})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <Typography
          title={title}
          sx={{ textAlign: "center" }}
          variant="h6"
          className={dashboard ? "content-title" : ""}
          color={dashboard ? "primary.main" : "secondary.main"}
        >
          {title}
        </Typography>

        <Typography textAlign="center" className="content-text">
          {content}
        </Typography>
      </Stack>
    </Link>
  );
}

export default ShopCard;
