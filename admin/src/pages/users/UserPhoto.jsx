import { Avatar, Box, Skeleton } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Compressor from "compressorjs";
import { useParams } from "react-router-dom";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { useQueryClient } from "@tanstack/react-query";
import { getInitials } from "../../config/validation";
import { updateUserProfile } from "../../api/userAPI";

function UserPhoto({ profile, email }) {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { customDispatch } = useContext(CustomContext);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    setPhoto(profile);
  }, [profile]);

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
            id,
            profile: data,
          };

          updateUserProfile(info)
            .then((result) => {
              customDispatch(globalAlertType("info", result));
              queryClient.invalidateQueries(["users"]);
              queryClient.invalidateQueries(["user", id]);
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
    <Box elevation={1} sx={{ bgcolor: "#fff" }}>
      <div style={{ display: "grid", placeItems: "center" }}>
        {isLoading ? (
          // <CircularProgress size={40} />
          <Skeleton variant="circular" width={70} height={70} />
        ) : (
          <>
            <label
              htmlFor="photo"
              style={{
                cursor: "pointer",
                borderRadius: "8px",
              }}
            >
              <Avatar
                alt="profile_icon"
                src={photo}
                sx={{
                  width: { xs: 50, md: 70 },
                  height: { xs: 50, md: 70 },
                  marginInline: "auto",
                  bgcolor: "primary.main",
                  cursor: "pointer",
                }}
              >
                {getInitials(email)}
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
          </>
        )}
      </div>
    </Box>
  );
}

export default UserPhoto;
