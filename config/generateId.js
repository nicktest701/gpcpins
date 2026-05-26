const { randomBytes } = require("crypto");
const generatedIds = new Set();

const generateId = (length) => {
  const uid = randomBytes(4).toString("hex");

  const hexID = uid?.toUpperCase();

  const MAX_RETRIES = 10;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Generate secure random values
    const randomArray = new Uint32Array(2);
    crypto.getRandomValues(randomArray);

    // Combine values for higher entropy
    const combined =
      BigInt(randomArray[0]) * BigInt(4294967296) + BigInt(randomArray[1]);

    // Convert to 12-digit number
    const id = (combined % BigInt(1_000_000_000)).toString().padStart(8, "0");

    const newID = "GPC" + hexID + id;

    // Ensure non-repeatable within runtime
    if (!generatedIds.has(newID)) {
      generatedIds.add(newID);
      return newID;
    }
  }

  throw new Error("Failed to generate a unique ID");
};

// export function clearGeneratedIds() {
//   generatedIds.clear();
// }

module.exports = generateId;
