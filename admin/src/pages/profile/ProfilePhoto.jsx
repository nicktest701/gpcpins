import { Avatar, CircularProgress, Box, Tooltip } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Compressor from "compressorjs";
import { AuthContext } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { updateAdminProfile } from "../../api/adminAPI";
import { getInitials } from "../../config/validation";

function ProfilePhoto() {
  const { user, login } = useContext(AuthContext);
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

          updateAdminProfile(info)
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
    <Box
      elevation={1}
      sx={{
        p: 2,
        width: "100%",
        minHeight: 100,
        bgcolor: "#fff",
      }}
    >
      <div style={{ display: "grid", placeItems: "center", gap: "24px" }}>
        {isLoading ? (
          <CircularProgress size={20} />
        ) : (
          <>
            <Tooltip title="Click to upload photo">
              <label
                htmlFor="photo"
                style={{
                  cursor: "pointer",
                  border: "2px solid lightgray",
                  borderRadius: "50%",
                  padding: "4px",
                }}
              >
                <Avatar
                  alt="profile_icon"
                  src={photo}
                  sx={{
                    width: { xs: 80, md: 100 },
                    height: { xs: 80, md: 100 },
                    marginInline: "auto",
                    bgcolor: "primary.main",
                    cursor: "pointer",
                  }}
                >
                  {getInitials(user?.email)}
                </Avatar>
              </label>
            </Tooltip>
            <div>
              <input
                type="file"
                id="photo"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleUploadFile}
                hidden
              />

              <small>Change Photo</small>
            </div>
          </>
        )}
      </div>
    </Box>
  );
}

export default ProfilePhoto;
