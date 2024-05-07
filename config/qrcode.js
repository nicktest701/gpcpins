const QRCode = require('qrcode');

async function generateQRCode(id, voucherId, serial) {
  try {
    // const url = await QRCode.toDataURL(serial);
    const url = await QRCode.toDataURL(
      `https://gpcpins.com/verify?XwnA=${id}&bwhT=${voucherId}_${serial}`
    );
    // const url = await QRCode.toDataURL(
    //   `http://localhost:3000/verify?XwnA=${id}&bwhT=${voucherId}_${serial}`
    // );

    return url;
  } catch (error) {
    throw error;
  }
}

module.exports = generateQRCode;
