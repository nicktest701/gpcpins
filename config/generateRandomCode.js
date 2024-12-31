function generateRandomNumber(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNPQRSTUVWXYabcdefghijklmnpqrstuvwxy0123456789@#$()";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

module.exports = generateRandomNumber;
