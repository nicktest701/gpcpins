function isEqual(obj1, obj2) {
  return obj1?.pin === obj2?.pin && obj1?.serial === obj2?.serial;
}

function findDuplicates(array1, array2) {
  // Create an empty array to store duplicate objects
  let duplicates = [];

  // Loop through the first array
  for (let obj1 of array1) {
    // Loop through the second array
    for (let obj2 of array2) {
      // Compare objects for equality (you may need a custom comparison function)
      if (isEqual(obj1, obj2)) {
        // If objects are equal, add them to the duplicates array
        duplicates.push(obj1);
        break; // Break the inner loop to avoid adding the same object multiple times
      }
    }
  }

  return duplicates;
}

module.exports = findDuplicates;
