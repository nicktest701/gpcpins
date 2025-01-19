import { Avatar, CircularProgress, Paper } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Compressor from "compressorjs";
import { AuthContext } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { updateAgentProfile } from "../../api/agentAPI";
import { getInitials } from "../../config/validation";

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

          updateAgentProfile(info)
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
    <Paper elevation={1} sx={{ p: 2 }}>
      <div style={{ display: "grid", placeItems: "center", gap: "24px" }}>
        {isLoading ? (
          <CircularProgress size={20} />
        ) : (
          <>
            <label
              title="Click to upload a photo"
              htmlFor="photo"
              style={{
                cursor: "pointer",
                // border: "1px solid var(--primary)",
                // padding: "8px",
                // borderRadius: "8px",
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
                  fontSize:{ xs: 20, md: 24 },
                }}
              >
                {getInitials(user?.email)}
              </Avatar>
            </label>
            <div>
              <input
                type="file"
                id="photo"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleUploadFile}
                hidden
              />
            </div>
            <p>Photo</p>
          </>
        )}
      </div>
    </Paper>
  );
}

export default ProfilePhoto;
