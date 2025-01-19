import { useState } from "react";
import { Avatar, CircularProgress, Box, Tooltip, Card } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Compressor from "compressorjs";
import { useAuth } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { useCustomData } from "../../context/providers/CustomProvider";
import { updateVerifierProfile } from "../../api/verifierAPI";
import { getInitials } from "../../config/validation";
import coverImage from "../../assets/images/cover-01.png";

function ProfilePhoto() {
  const { user, login } = useAuth();
  const { customDispatch } = useCustomData();
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadFile = (e) => {
    if (e.target.files) {
      const image = e.target.files[0];

      new Compressor(image, {
        height: 200,
        width: 200,
        quality: 0.6,

        success(data) {
          setIsLoading(true);
          const info = {
            id: user?.id,
            profile: data,
          };

          updateVerifierProfile(info)
            .then((result) => {
              customDispatch(globalAlertType("info", "Profile Updated!"));
              login({ ...user, profile: result });
            })
            .catch((error) => {
              customDispatch(globalAlertType("error", error));
            })
            .finally(() => {
              setIsLoading(false);
            });
        },
      });
    }
  };

  return (
    <>
      <Card
        sx={{
          overflow: "hidden",
          borderRadius: 1,
          // border: "1px solid",
          borderColor: "stroke",
          bgcolor: "background.paper",
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 20,
            height: { xs: "200px", md: "260px" },
          }}
        >
          <img
            src={coverImage}
            alt="profile cover"
            style={{
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              objectFit: "cover",
            }}
          />
        </Box>

        <Box
          sx={{
            px: 4,
            pb: { xs: 6, lg: 8, xl: 11.5 },
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 30,
              mx: "auto",
              mt: -22,
              // width: "100%",
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              p: 1,
              display: "flex",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
              "& img": {
                width: "auto",
                height: "auto",
              },
              "& label": {
                position: "absolute",
                bottom: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "primary.main",
                color: "white",
                borderRadius: "50%",
                width: 34,
                height: 34,
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Tooltip title="upload photo">
                  <Avatar
                    variant="circular"
                    src={user?.profile}
                    alt="profile"
                    sx={{ width: 100, height: 100 }}
                  >
                    {getInitials(user?.email)}
                  </Avatar>
                  <label htmlFor="profile">
                    <EditIcon sx={{ fontSize: 14 }} />
                    <input
                      type="file"
                      name="profile"
                      id="profile"
                      style={{ display: "none" }}
                      accept=".png,.jpg,.jpeg,.webp"
                      onChange={handleUploadFile}
                    />
                  </label>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>
      </Card>
    </>
  );
}

export default ProfilePhoto;
