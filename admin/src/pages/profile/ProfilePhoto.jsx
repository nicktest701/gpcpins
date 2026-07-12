import {
  Avatar,
  CircularProgress,
  Box,
  Tooltip,
  Typography,
  Stack,
  alpha,
  useTheme,
  IconButton,
  Paper,
} from "@mui/material";
import { PhotoCamera, Close } from "@mui/icons-material";
import { useContext, useState, useRef, useCallback } from "react";
import Compressor from "compressorjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { updateAdminProfile } from "../../api/adminAPI";
import { getInitials } from "../../config/validation";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

function ProfilePhoto() {
  const theme = useTheme();
  const { user, updateUser } = useAuth();
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Local state
  const [preview, setPreview] = useState(user?.profile || null);
  const [error, setError] = useState("");

  // --- Mutation ---
  const { mutate, isLoading } = useMutation({
    mutationFn: async (compressedFile) => {
      // Build FormData (or JSON) – adjust to your API
      const formData = new FormData();
      formData.append("profile", compressedFile, "profile.jpg");
      formData.append("id", user?.id);
      return updateAdminProfile(formData);
    },
    onSuccess: (result) => {
      // Update user context with new profile URL
      const newProfile = result?.profile || result;
      updateUser({ profile: newProfile });
      setPreview(newProfile);
      customDispatch(globalAlertType("info", "Profile photo updated!"));
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setError("");
    },
    onError: (err) => {
      customDispatch(
        globalAlertType("error", err?.message || "Failed to upload photo")
      );
      setError(err?.message || "Upload failed");
      // Revert preview to previous if error
      setPreview(user?.profile || null);
    },
  });

  // --- Handlers ---
  const handleFileSelect = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Please select a JPEG, PNG, or WEBP image.");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError("Image size must be less than 5MB.");
        return;
      }

      setError("");

      // Compress image
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 400,
        maxHeight: 400,
        mimeType: "image/jpeg",
        success: (compressedFile) => {
          // Show preview
          const reader = new FileReader();
          reader.onload = (e) => setPreview(e.target.result);
          reader.readAsDataURL(compressedFile);

          // console.log(compressedFile)

          // Trigger mutation
          mutate(compressedFile);
        },
        error: (compressorError) => {
          setError("Failed to compress image. Please try a different image.");
          console.error(compressorError);
        },
      });

      // Reset input so same file can be selected again
      event.target.value = "";
    },
    [mutate]
  );

  const handleRemovePhoto = useCallback(() => {
    // Optionally reset to default – we just clear preview and keep existing
    setPreview(null);
    // Could also call an API to remove photo if needed
    // For now, just allow re-upload
  }, []);

  const handleClearError = useCallback(() => setError(""), []);

  // --- Render ---
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        bgcolor: "background.paper",
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        position: "relative",
      }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: alpha(theme.palette.common.black, 0.08),
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            backdropFilter: "blur(2px)",
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <CircularProgress size={40} />
            <Typography variant="caption" color="text.secondary">
              Uploading...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Avatar with upload trigger */}
      <Tooltip title="Click to upload a new photo" arrow>
        <label
          htmlFor="profile-photo-input"
          style={{
            cursor: "pointer",
            position: "relative",
            display: "inline-block",
          }}
        >
          <Avatar
            alt={user?.name || "Profile"}
            src={preview || user?.profile}
            sx={{
              width: { xs: 100, sm: 120 },
              height: { xs: 100, sm: 120 },
              bgcolor: "primary.main",
              fontSize: { xs: "2rem", sm: "2.5rem" },
              border: `3px solid ${theme.palette.primary.main}`,
              transition: "all 0.3s ease",
              "&:hover": {
                opacity: 0.85,
                transform: "scale(1.02)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            {!preview && !user?.profile && getInitials(user?.name || user?.email)}
          </Avatar>
          {/* Camera icon overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 4,
              right: 4,
              bgcolor: "secondary.main",
              borderRadius: "50%",
              p: 0.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[2],
            }}
          >
            <PhotoCamera fontSize="small" sx={{ color: "white" }} />
          </Box>
        </label>
      </Tooltip>

      <input
        ref={fileInputRef}
        type="file"
        id="profile-photo-input"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        hidden
        disabled={isLoading}
      />

      {/* Status & actions */}
      <Stack spacing={1} alignItems="center" sx={{ width: "100%" }}>
        {error && (
          <Typography
            variant="caption"
            color="error"
            align="center"
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.08),
              px: 2,
              py: 0.5,
              borderRadius: 1,
              width: "100%",
            }}
          >
            {error}
            <IconButton size="small" onClick={handleClearError} sx={{ ml: 0.5 }}>
              <Close fontSize="small" />
            </IconButton>
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary">
          {isLoading
            ? "Uploading photo..."
            : "Click the avatar to change your photo"}
        </Typography>

        {preview && !isLoading && (
          <IconButton
            size="small"
            onClick={handleRemovePhoto}
            sx={{ mt: 0.5, color: "text.secondary" }}
          >
            <Close fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              Remove
            </Typography>
          </IconButton>
        )}
      </Stack>
    </Paper>
  );
}

export default ProfilePhoto;

// import { Avatar, CircularProgress, Box, Tooltip } from "@mui/material";
// import { useContext, useEffect, useState } from "react";
// import Compressor from "compressorjs";
// import { useAuth } from "../../context/providers/AuthProvider";
// import { globalAlertType } from "../../components/alert/alertType";
// import { useCustomContext } from "../../context/providers/CustomProvider";
// import { updateAdminProfile } from "../../api/adminAPI";
// import { getInitials } from "../../config/validation";

// function ProfilePhoto() {
//   const { user, updateUser } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const { customDispatch } = useCustomContext();
//   const [photo, setPhoto] = useState(user?.profile);

//   useEffect(() => {
//     setPhoto(user?.profile);
//   }, [user]);

//   const handleUploadFile = (e) => {
//     if (e.target.files) {
//       const image = e.target.files[0];

//       new Compressor(image, {
//         height: 200,
//         width: 200,
//         quality: 0.6,

//         success(data) {
//           setIsLoading(true);
//           const info = {
//             id: user?.id,
//             profile: data,
//           };

//           updateAdminProfile(info)
//             .then((result) => {
//               customDispatch(globalAlertType("info", "Profile Updated!"));
//               updateUser({ profile: result });
//             })
//             .catch((error) => {
//               customDispatch(globalAlertType("error", error));
//             })
//             .finally(() => {
//               setIsLoading(false);
//             });
//         },
//       });
//     }
//   };

//   return (
//     <Box
//       elevation={1}
//       sx={{
//         p: 2,
//         width: "100%",
//         minHeight: 100,
//         bgcolor: "#fff",
//       }}
//     >
//       <div style={{ display: "grid", placeItems: "center", gap: "24px" }}>
//         {isLoading ? (
//           <CircularProgress size={20} />
//         ) : (
//           <>
//             <Tooltip title="Click to upload photo">
//               <label
//                 htmlFor="photo"
//                 style={{
//                   cursor: "pointer",
//                   border: "2px solid lightgray",
//                   borderRadius: "50%",
//                   padding: "4px",
//                 }}
//               >
//                 <Avatar
//                   alt="profile_icon"
//                   src={photo}
//                   sx={{
//                     width: { xs: 80, md: 100 },
//                     height: { xs: 80, md: 100 },
//                     marginInline: "auto",
//                     bgcolor: "primary.main",
//                     cursor: "pointer",
//                   }}
//                 >
//                   {getInitials(user?.email)}
//                 </Avatar>
//               </label>
//             </Tooltip>
//             <div>
//               <input
//                 type="file"
//                 id="photo"
//                 accept=".png,.jpg,.jpeg,.webp"
//                 onChange={handleUploadFile}
//                 hidden
//               />

//               <small>Change Photo</small>
//             </div>
//           </>
//         )}
//       </div>
//     </Box>
//   );
// }

// export default ProfilePhoto;
