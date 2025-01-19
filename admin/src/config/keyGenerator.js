const serialsGenerator = (length, type) => {
  // Declare all characters
  //   let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let numbers = "0123456789";
  let alphabets = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let both = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz013456789";
  let key =
    type === "numbers" ? numbers : type === "letters" ? alphabets : both;

  // Pick characters randomly
  let str = "";
  for (let i = 0; i < length; i++) {
    str += key.charAt(Math.floor(Math.random() * key.length));
  }

  return str.toUpperCase();
};

export const generatePins = (length, number, type, option) => {
  const arr = [];
  for (let i = 0; i < number; i++) {
    const rand = serialsGenerator(length, type);

    const randObject = {
      id: i,
      [option]: rand,
    };
    arr.push(randObject);
  }
  return arr;
};
