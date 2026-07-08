import { Container, Alert, Typography, Divider } from "@mui/material";
import ShopCard from "@/components/ShopCard";
import { shopRows } from "@/mocks/columns";
import AnimatedContainer from "@/components/animations/AnimatedContainer";
import RetrieveVoucher from "./RetrieveVoucher";
import AnimatedWrapper from "@/components/animations/AnimatedWrapper";
import PageHero from "../../components/custom/PageHero";
import { IMAGES } from "../../constants";

function Shop() {
  let delay = 5;
  return (
    <>
        {/* Hero Banner */}
         <PageHero
        title="Vouchers & Tickets"
        subtitle=" Buy electricity units for your IMES meter instantly."
        bgImage={IMAGES.ges}
      />
      <Alert
        variant="outlined"
        sx={{ border: "none", fontSize: 13 }}
        severity="info"
      >
        Lost Vouchers or Tickets? Retrieve from <a href="#lost">here 👈🏾</a>
      </Alert>
      <Container

      >
  
        <Divider />
        <Container
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 4,
            py: 5,
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
