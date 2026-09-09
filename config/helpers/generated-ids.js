function generateNextId(lastId = "") {
  // 1. Get today's date components (DDMMYYYY)
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const yyyy = today.getFullYear();
  const currentDateStr = `${dd}${mm}${yyyy}`;

  const prefix = "GPC";
  let nextCounter = 1;

  // 2. Parse the last ID if it matches the expected pattern
  // Pattern: GPC + 8 digits (date) + 3 digits (counter)
  const idPattern = /^GPC(\d{8})(\d{3})$/;
  const match = lastId.match(idPattern);

  if (match) {
    const lastDateStr = match[1];
    const lastCounter = parseInt(match[2], 10);

    // If the last ID was generated today, increment the counter
    if (lastDateStr === currentDateStr) {
      nextCounter = lastCounter + 1;
    }
  }

  // 3. Format the next counter to be 3 digits (e.g., 001, 002)
  const paddedCounter = String(nextCounter).padStart(3, "0");

  // 4. Combine components into the final ID
  return `${prefix}${currentDateStr}${paddedCounter}`;
}

module.exports = { generateNextId };
