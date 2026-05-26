const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
async function ImageToBase64(url, format) {
  const image = await fs.readFile(url, { encoding: "base64" });
  return `data:${format};base64,${image}`;
}

async function defaultImage(format) {
  const url = path.join(process.cwd(), "/images/", "noimage.png");

  const image = await fs.readFile(url, { encoding: "base64" });
  return `data:${format};base64,${image}`;
}

// utils/imageToBase64.js

/**
 * Convert image URL to Base64
 * @param {string} imageUrl
 * @returns {Promise<string>}
 */
async function imageUrlToBase64(imageUrl) {
  try {
    if (!imageUrl) {
      // throw new Error("Image URL is required");
      return "";
    }

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      maxContentLength: 10 * 1024 * 1024, // 10MB
    });

    const contentType = response.headers["content-type"];

    if (!contentType || !contentType.startsWith("image/")) {
      throw new Error("Invalid image content type");
    }

    const base64 = Buffer.from(response.data, "binary").toString("base64");

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Image to Base64 Error:", {
      message: error.message,
      imageUrl,
    });
  }
}

module.exports = {
  imageUrlToBase64,
  ImageToBase64,
  defaultImage,
};
