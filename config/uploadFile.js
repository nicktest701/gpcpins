const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const fs = require("fs");
const path = require("path");

const { storage } = require("../firebase");

async function uploadVoucherFile(fileName) {
  const filePath = path.join(process.cwd(), "/vouchers/", fileName);
  const file = fs.readFileSync(filePath);

  const storageRef = ref(storage, `vouchers/${fileName}`);

  try {
    // Upload the file to Cloud Storage
    await uploadBytes(storageRef, file);
    // Get the download URL of the uploaded file
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Cloud Storage", error);
  }
}

async function uploadReceiptFile(fileName) {
  const filePath = path.join(process.cwd(), "/receipts/", fileName);
  const file = fs.readFileSync(filePath);

  const storageRef = ref(storage, `receipts/${fileName}`);

  try {
    // Upload the file to Cloud Storage
    await uploadBytes(storageRef, file);
    // Get the download URL of the uploaded file
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Cloud Storage", error);
  }
}

async function uploadPhoto(file) {
  const filePath = path.join(process.cwd(), "/images/", file?.filename);

  const storageRef = ref(storage, `photos/${file.filename}`);

  try {
    // Upload the file to Cloud Storage
    await uploadBytes(storageRef, fs.readFileSync(filePath));

    // Get the download URL of the uploaded file
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Cloud Storage", error);
  }
}

async function uploadAttachment(file) {
  const filePath = path.join(process.cwd(), "/images/attachments/", file?.filename);

  const storageRef = ref(storage, `attachments/${file.filename}`);

  try {
    // Upload the file to Cloud Storage
    await uploadBytes(storageRef, fs.readFileSync(filePath));

    // Get the download URL of the uploaded file
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Cloud Storage", error);
  }
}
async function uploadFiles(filename, location) {
  const filePath = path.join(process.cwd(), `/${location}/`, filename);

  const storageRef = ref(storage, `${location}/${filename}`);

  try {
    // Upload the file to Cloud Storage
    await uploadBytes(storageRef, fs.readFileSync(filePath));

    // Get the download URL of the uploaded file
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Cloud Storage", error);
  }
}

module.exports = {
  uploadReceiptFile,
  uploadVoucherFile,
  uploadPhoto,
  uploadAttachment,
  uploadFiles,
};
