import { useState, useEffect, useRef } from "react";
import {
  Paper,
  Box,
  Avatar,
  CircularProgress,
  Tooltip,
  IconButton,
  Skeleton,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import Compressor from "compressorjs";
import { useAuth } from "../../context/providers/AuthProvider";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { updateUserProfile } from "../../api/userAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { getInitials } from "../../config/validation";
import coverImage from "../../assets/images/cover-01.png";

function ProfilePhoto() {
  const { user, updateProfilePhoto } = useAuth();
  const { customDispatch } = useCustomContext();
  const fileInputRef = useRef(null);

  const [photo, setPhoto] = useState(user?.profile || null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync photo with user profile changes
  useEffect(() => {
    setPhoto(user?.profile);
  }, [user]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    new Compressor(file, {
      height: 200,
      width: 200,
      quality: 0.6,
      success: (compressedFile) => {
        setIsUploading(true);
        updateUserProfile({ id: user?.id, profile: compressedFile })
          .then((result) => {
            customDispatch(globalAlertType("info", "Profile updated!"));
            updateProfilePhoto({ profile: result });
            setPhoto(result); // update local preview
          })
          .catch((error) => {
            customDispatch(globalAlertType("error", error.message || "Upload failed"));
          })
          .finally(() => {
            setIsUploading(false);
            // Reset file input so same file can be re-uploaded
            if (fileInputRef.current) fileInputRef.current.value = "";
          });
      },
      error: () => {
        customDispatch(globalAlertType("error", "Failed to compress image"));
      },
    });
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        bgcolor: "background.paper",
        width: "100%",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      {/* Cover Image */}
      <Box
        sx={{
          height: { xs: 100, sm: 140 },
          backgroundImage: `url(${coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      />

      {/* Avatar Section - centered over cover */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          mt: -6,
          px: 2,
          pb: 3,
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
          }}
        >
          {/* Avatar with loading overlay */}
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={photo}
              alt={user?.name || "Profile"}
              sx={{
                width: { xs: 90, sm: 120 },
                height: { xs: 90, sm: 120 },
                border: "4px solid",
                borderColor: "background.paper",
                boxShadow: 2,
                bgcolor: "secondary.main",
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              {getInitials(user?.name || user?.email)}
            </Avatar>

            {/* Loading overlay */}
            {isUploading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  bgcolor: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={32} sx={{ color: "white" }} />
              </Box>
            )}
          </Box>

          {/* Edit Button */}
          <Tooltip title="Change photo" arrow>
            <IconButton
              onClick={handleEditClick}
              disabled={isUploading}
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                bgcolor: "primary.main",
                color: "white",
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                boxShadow: 2,
              }}
            >
              <EditIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
            </IconButton>
          </Tooltip>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </Box>
      </Box>
    </Paper>
  );
}

export default ProfilePhoto;