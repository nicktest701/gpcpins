import Edit from "@mui/icons-material/Edit";
import { FormLabel } from "@mui/material";

function CustomImageChooser({ handleImageUpload }) {
  return (
    <>
      <FormLabel
        htmlFor="profile"
        sx={{
          position: "absolute",
          left: 50,
          right: 0,
          bottom: -20,
          marginInline: "auto",
          textAlign: "center",
          bgcolor: "primary.main",
          height: 35,
          width: 35,
          borderRadius: 50,
          marginY:2
        }}
      >
        <Edit sx={{ color: "primary.contrastText", marginTop: 1 }} />
      </FormLabel>
      <input
        type="file"
        accept=".png, .jpg ,.webp"
        name="profile"
        id="profile"
        onChange={(e) => handleImageUpload(e)}
        hidden
      />
    </>
  );
}

export default CustomImageChooser;
