const fs = require('fs/promises');
const path = require('path');
async function ImageToBase64(url, format) {
  const image = await fs.readFile(url, { encoding: 'base64' });
  return `data:${format};base64,${image}`;
}

async function defaultImage(format) {
  const url = path.join(process.cwd(), '/images/', 'noimage.png');

  const image = await fs.readFile(url, { encoding: 'base64' });
  return `data:${format};base64,${image}`;
}

module.exports = {
  ImageToBase64,
  defaultImage,
};
