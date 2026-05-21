export async function compressImage(file, options = {}) {
  const {
    maxSizeInMB = 5,
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
  } = options;

  const maxBytes = maxSizeInMB * 1024 * 1024;

  // If not image or already small → skip compression
  if (!file.type.startsWith("image/") || file.size <= maxBytes) {
    return file;
  }

  const imageBitmap = await createImageBitmap(file);

  let { width, height } = imageBitmap;

  // Resize while maintaining aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not supported.");

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  // Convert to WebP (recommended)
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
      "image/webp",
      quality,
    );
  });

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
  });
}
