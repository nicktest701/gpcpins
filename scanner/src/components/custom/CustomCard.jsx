import { MoreHorizRounded } from "@mui/icons-material";
import { Card, Divider, IconButton, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

function CustomCard({ title, children, width, value, to }) {
  return (
    <Card
      sx={{
        p: 2,
        width: "100%",
        border: "1px solid whitesmoke",
        borderRadius: 2,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        pb={2}
      >
        <LayersOutlinedIcon color='secondary' />
        <Typography variant="h6" color="primary.main" flexGrow={1}>
          {title}
        </Typography>
        {value && <Typography variant="h5">{value}</Typography>}
        {to && (
          <Link to={`/summary?YixHy=kjndsiud&summary_tab=5`}>
            <IconButton color="secondary">
              <MoreHorizRounded />
            </IconButton>
          </Link>
        )}
      </Stack>
      {/* <Divider sx={{ mb: 2 }} /> */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat( auto-fit, minmax(${
            width || "200px"
          }, 1fr))`,
          gap: "16px",
        }}
      >
        {children}
      </div>
    </Card>
  );
}

export default CustomCard;
