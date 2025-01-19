import { Container, Alert, Typography, Divider } from "@mui/material";
import ShopCard from "../../components/ShopCard";
import { shopRows } from "../../mocks/columns";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import RetrieveVoucher from "./RetrieveVoucher";
import AnimatedWrapper from "../../components/animations/AnimatedWrapper";

function Shop() {
  let delay = 5;
  return (
    <>
      <Alert
        variant="outlined"
        sx={{ border: "none", fontSize: 13 }}
        severity="info"
      >
        Lost Vouchers or Tickets? Retrieve from <a href="#lost">here 👈🏾</a>
      </Alert>
      <Container
        sx={{
          //   backgroundImage: ` linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0, 0,0, 0.1)),
          // url(${IMAGES.main}); `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          minHeight: "100%",
          py: 4,
          px: 2,
        }}
      >
        <Typography className="content-subtitle" variant="h2">
          VOUCHERS AND TICKETS
        </Typography>
        <Divider />
        <Container
          // maxWidth='md'
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 4,
            paddingY: 10,
          }}
        >
          {shopRows.map((shop, index) => {
            delay = delay * index;
            return (
              <AnimatedContainer key={shop.id} delay={delay}>
                <ShopCard {...shop} />
              </AnimatedContainer>
            );
          })}
        </Container>
        <AnimatedWrapper>
          <RetrieveVoucher />
        </AnimatedWrapper>
      </Container>
    </>
  );
}

export default Shop;
