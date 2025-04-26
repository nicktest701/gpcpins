import { Box } from "@mui/material";
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

        <Box textAlign="center" sx={{ py: 1, fontSize: 20 }}>
          {value}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
