import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";


const ItemCard = ({ title, value, icon }) => {
  return (
    <Card
      sx={{
        position: "relative",
        width: "100%",
        bgcolor: "white",
      }}
      elevation={1}
    >
      <CardContent>
        <Typography variant="body1" fontWeight="bold" color="primary">
          {title}
        </Typography>

        <div
          style={{
            position: "absolute",
            right: 10,
            bottom: 5,
          }}
        >
          {icon}
        </div>
        {/* {typeof value === "number" || typeof value === "string" ? ( */}
        <Typography
          variant="body1"
          textAlign="center"
          // fontWeight="bold"
          sx={{ paddingY: 1 }}
        >
          {value}
        </Typography>
        {/* ) : (
          <>{value}</>
        )} */}
      </CardContent>
    </Card>
  );
};

// ItemCard.propTypes = {
//   title: PropTypes.string,
//   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   icon: PropTypes.node,
// };

export default ItemCard;
