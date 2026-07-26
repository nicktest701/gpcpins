import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y, Scrollbar } from "swiper";
import { EffectFade } from "swiper";

// Styles must use direct files imports
import "swiper/css/bundle";
import "swiper/css"; // core Swiper
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import "swiper/css/pagination";

import { IMAGES } from "../../constants";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

const HOME_CONTENT = [
  {
    id: 1,
    title: "Gab Powerful Consult",
    content:
      "We provide you the best checkers, airtime and electricty services you can get across the globe!",
    bgImage: IMAGES.main,
    low: IMAGES.main_low,
    path: "/",
    btnText: "Explore More",
    color: "primary.contrastText",
  },
  {
    id: 2,
    title: "Checkers & Tickets",
    content:
      "All sorts of application checkers,vouchers and tickets ranginging from waec exams checkers,shs placement,bus tickets,etc",
    bgImage: IMAGES.checker2,
    low: IMAGES.bgImage1_low,
    path: "/evoucher",
    btnText: "Buy Now",
    color: "primary.contrastText",
  },
  {
    id: 3,
    title: "Prepaid Units",
    content: "Purchase prepaid electricity units quickly and securely for all major meters.",
    bgImage: IMAGES.bgImage2,
    low: IMAGES.bgImage2_low,
    path: "/electricity",
    btnText: "Top Up Now",
    color: "primary.contrastText",
  },
  {
    id: 4,
    title: "Airtime & Data Transfers",
    content:
      "Fast and secure airtime and data transfers to all major networks across the country.",
    bgImage: IMAGES.bgImage5,
    low: IMAGES.bgImage1_low,
    path: "/airtime",
    btnText: "Transfer Now",
    color: "primary.contrastText",
  },
];

function HomeSwiper() {
  return (
    <Swiper
      className="swiper"
      effect="fade"
      modules={[Autoplay, Pagination, Navigation, A11y, Scrollbar, EffectFade]}
      speed={2000}
      spaceBetween={30}
      centeredSlides={true}
      loop
      autoplay={{
        delay: 5000,
        // disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      // navigation={true}
    >
      {HOME_CONTENT.map(
        ({ id, title, content, bgImage, low, path, btnText, color }) => (
          <SwiperSlide key={id} className="swiper-slide">
            <div className="swiper-content">
              <div>
                <Typography variant="h1" className="hero-title">{title}</Typography>
                <Typography
                  // className="content-text subtitle"
                  variant='h2'
                  textAlign='center'
                  fontWeight='normal'
                  paragraph
                  color={color}
                >
                  {content}
                </Typography>
              </div>

              <Link
                to={path}
                className="home-btn"
                style={{
                  marginTop: "24px",
                  width: "250px",
                  textTransform: "uppercase",
                }}
              >
                {btnText}
              </Link>
            </div>
            <img
              src={bgImage}
              alt="swiper-img"
              width="100svh"
              height="100svw"
              style={{
                backgroundImage: `url(${low})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </SwiperSlide>
        )
      )}
    </Swiper>
  );
}

export default HomeSwiper;
