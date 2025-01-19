import { CircularProgress, Container, Typography } from "@mui/material";
import AvailableTickets from "./AvailableTickets";
import MovieDropdown from "../../components/dropdowns/MovieDropdown";
import { useEffect, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { IMAGES } from "../../constants";
import Cinema from "../../components/jsx-icons/Cinema";

function CinemaTickets() {
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState("");
  const [movies, setMovies] = useState([]);
  const [pending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load the low-quality image initially
    const backgroundDiv = document.getElementById("background-div");
    backgroundDiv.style.background = `url(${IMAGES.cinema_bg_low})`;

    // Create an image object for the original image
    const originalImage = new Image();
    originalImage.src = IMAGES.cinema_bg;

    // Replace low-quality image with original image on load
    originalImage.onload = () => {
      backgroundDiv.style.backgroundImage = `url(${IMAGES.cinema_bg})`;
      setLoaded(true);
    };
  }, []);

  const handleSearch = (e) => {
    setValue(e?.target?.value);
    startTransition(() => {
      const value = e?.target?.value;
      if (value?.trim() === "") {
        setMovies([]);
        return;
      }
      const filteredMovies = queryClient
        .getQueryData(["all-category"])
        ?.filter(
          (voucher) =>
            voucher?.voucherType
              ?.toLowerCase()
              ?.includes(value?.toLowerCase()) && voucher?.category === "cinema"
        );
      setMovies(filteredMovies);
    });
  };

  return (
    <>
      <div
        id="background-div"
        className={loaded ? "loaded" : ""}
        style={{
          // background: `linear-gradient(to bottom,rgba(0,0,0,0.5),rgba(0,0,0,0.7)),url(${IMAGES.cinema_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "100svh",
        }}
      >
        <div className="overlay">
          <Container
            maxWidth="md"
            sx={{
              height: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Cinema height={84} width={84} />
            <Typography variant="h1" color="primary" textAlign="center">
              Cinema & <b style={{ color: "var(--secondary)" }}>Event</b>{" "}
              Tickets
            </Typography>
            <Typography
              color="white"
              variant="body1"
              textAlign="center"
              paragraph
            >
              Buy a ticket and discover the world of captivating story telling
              movies,award nights,music shows and many more...
            </Typography>

            <div className="movie-search-container">
              <input
                type="search"
                inputMode="search"
                placeholder="Search for tickets"
                className="movie-search"
                value={value}
                onChange={handleSearch}
              />
              {pending && <CircularProgress size="small" />}
              {movies?.length !== 0 && <MovieDropdown movies={movies} />}
            </div>
          </Container>
        </div>
      </div>

      <AvailableTickets />
    </>
  );
}

export default CinemaTickets;
