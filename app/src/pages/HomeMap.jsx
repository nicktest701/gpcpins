import { Box, Button, alpha, useTheme } from "@mui/material";
import { NavigationRounded } from "@mui/icons-material";

const HomeMap = () => {
  const theme = useTheme();

  // Target Location coordinates for Gab Powerful Consult
  const lat = 6.70675631287526;
  const lng = -1.6189752122036272;
  // 6.705911441350579, -1.6179302145476935

  // Iframe Source URL
  const mapEmbedUrl = "https://maps.app.goo.gl/nmL7ebB4nyMRK7ve7";

  // External routing URL for directions
  const directionsUrl = `https://google.com,${lat},${lng}`;

  return (
    <Box
      className="map-container"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 0.6,
      }}
    >
      {/* Google Maps Responsive Frame Wrapper */}
      <Box
        sx={{
          width: "100%",
          height: "400px",
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          boxShadow: theme.shadows[2],
        }}
      >
        <iframe
          title="Gab Powerful Consult"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1792.0407205198937!2d-1.6198641681193835!3d6.705132611138522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdb97b66da0f579%3A0xfcc80441c2c71047!2sGAB%20POWERFUL%20CONSULT!5e1!3m2!1sen!2sgh!4v1783993492290!5m2!1sen!2sgh"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />

        {/* <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1792.0407205198937!2d-1.6198641681193835!3d6.705132611138522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdb97b66da0f579%3A0xfcc80441c2c71047!2sGAB%20POWERFUL%20CONSULT!5e1!3m2!1sen!2sgh!4v1783993492290!5m2!1sen!2sgh"
          width="600"
          height="450"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe> */}
      </Box>

      {/* Navigation Button Action Row */}
      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button
          component="a"
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          color="primary"
          startIcon={<NavigationRounded />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
            "&:hover": {
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
            },
          }}
        >
          Get Directions
        </Button>
      </Box>
    </Box>
  );
};

export default HomeMap;

// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';

// const HomeMap = () => {
//   return (
//     <MapContainer
//       center={[6.70675631287526, -1.6189752122036272]}
//       zoom={13}
//       style={{ width: '100%', height: '400px', flex: 0.6 }}
//       scrollWheelZoom={false}
//       fadeAnimation
//       className='map-container'
//     >
//       <TileLayer
//         // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
//       />
//       <Marker position={[6.70675631287526, -1.6189752122036272]}>
//         <Popup>Gab Powerful Consult</Popup>
//       </Marker>
//     </MapContainer>
//   );
// };

// export default HomeMap;
