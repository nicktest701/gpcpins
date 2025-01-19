import { Avatar, CircularProgress, Box, Tooltip, Card } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useContext, useEffect, useState } from "react";
import Compressor from "compressorjs";
import { AuthContext } from "../../context/providers/AuthProvider";
import { updateUserProfile } from "../../api/userAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { getInitials } from "../../config/validation";
import coverImage from "../../assets/images/cover-01.png";

function ProfilePhoto() {
  const { user, updateProfilePhoto } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const { customDispatch } = useContext(CustomContext);
  const [photo, setPhoto] = useState(user?.profile);

  useEffect(() => {
    setPhoto(user?.profile);
  }, [user]);

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

          updateUserProfile(info)
            .then((result) => {
              customDispatch(globalAlertType("info", "Profile Updated!"));
              updateProfilePhoto({ profile: result });
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
          width: { xs: "200px", md: "260px" },
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
            width: {xs:80,md:120},
            height: {xs:80,md:120},
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
                  sx={{
                    width: { xs: 60, md: 100 },
                    height: { xs: 60, md: 100 },
                  }}
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
  );
}

export default ProfilePhoto;
