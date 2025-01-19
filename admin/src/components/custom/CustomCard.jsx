import { MoreHorizRounded, StackedLineChartOutlined } from "@mui/icons-material";
import { Card, Divider, IconButton, Stack, Typography } from "@mui/material";
// import { Link } from "react-router-dom";

function CustomCard({ title, children, width }) {
  return (
    <Card
      sx={{
        p: 2,
        width: "100%",
        // border: '1px solid whitesmoke',
        borderRadius: 0,
      }}
    >
      <Stack direction="row" justifyContent="flex-start" alignItems="center" gap={1}>
        <StackedLineChartOutlined/>
        <Typography variant="body1" fontWeight='600' color="primary.main" flexGrow={1}>
          {title}
        </Typography>
        {/* <Link > */}
          <IconButton color="secondary">
            <MoreHorizRounded />
          </IconButton>
        {/* </Link> */}
      </Stack>
      <Divider sx={{ mb: 2 }} />
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
