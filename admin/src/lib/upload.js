import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { compressImage } from "./compress-image";

export async function uploadFile({ folder, file, onProgress }) {
  if (!file) {
    throw new Error("File is required.");
  }

  // 🔥 Compress if > 5MB
  const optimizedFile = await compressImage(file, {
    maxSizeInMB: 5,
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.6,
  });

  const fileName = `${crypto.randomUUID()}-${optimizedFile.name}`;
  const storageRef = ref(storage, `gpcpins/${folder}/${fileName}`);

  const uploadTask = uploadBytesResumable(storageRef, optimizedFile, {
    contentType: optimizedFile.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        onProgress?.(progress);
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        resolve({
          downloadURL,
          fullPath: uploadTask.snapshot.ref.fullPath,
        });
      },
    );
  });
}
