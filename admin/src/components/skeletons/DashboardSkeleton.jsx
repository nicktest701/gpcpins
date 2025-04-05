
import {
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
  Box,

} from "@mui/material";

const DashboardSkeleton = () => {
  return (
    <Box p={3}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        <Skeleton width="30%" />
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        <Skeleton width="50%" />
      </Typography>
      {/* Search Bar */}
      <Skeleton
        variant="rectangular"
        height={40}
        sx={{ borderRadius: 2, mb: 3 }}
      />
      {/* Account Balance Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <Skeleton width="20%" />
          </Typography>
          <Grid container spacing={2}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton width="80%" height={30} sx={{ mb: 1 }} />
                <Skeleton width="60%" height={20} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      {/* Total Sales Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <Skeleton width="20%" />
          </Typography>
          <Grid container spacing={2}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={2.4} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="50%" height={25} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} mt={2}>
        {/* Recent Transactions */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
              {[...Array(4)].map((_, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Skeleton width="40%" height={20} />
                  <Skeleton width="20%" height={20} />
                  <Skeleton width="90%" height={10} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Total Sales Count (Donut Chart) */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
              <Skeleton
                variant="circular"
                width={200}
                height={200}
                sx={{ mx: "auto" }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Today Sales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
              {[...Array(4)].map((_, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Skeleton width="40%" height={20} />
                  <Skeleton width="30%" height={20} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Total Sales for Last 7 Days (Line Chart) */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={200} />
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Log */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
              {[...Array(3)].map((_, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="30%" height={15} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardSkeleton;
