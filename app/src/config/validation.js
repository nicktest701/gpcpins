export function isValidDateOfBirth(dateString) {
  // Regular expression pattern for a valid date in YYYY-MM-DD format
  // const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  // // Check if the input matches the pattern
  // if (!datePattern.test(dateString)) {
  //   return false;
  // }

  // Parse the input string into a Date object
  const date = new Date(dateString);

  // Check if the parsed date is valid
  if (isNaN(date.getTime())) {
    return false;
  }

  // Compare the parsed date with the current date
  const currentDate = new Date();
  if (date > currentDate) {
    return false;
  }

  return true;
}

export function isValidEmail(email) {
  // Regular expression pattern for a valid email address
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if the input matches the pattern
  return emailPattern.test(email);
}

export function verifyCode(code) {
  return /^\d{6}$/.test(code);
}
export function verifyPin(code) {
  return /^\d{4}$/.test(code);
}

export function isValidPassword(password) {
  if (password?.length < 8 || password?.length > 30) {
    return false;
  }
  const passwordPattern = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9!@#$%^&*]+$/;

  // Check if the input matches the pattern
  return passwordPattern.test(password);
}

export function getInitials(fullName) {
  // Split the full name into words
  if (fullName?.trim() === '') return '';

  const words = fullName?.split(' ');

  // Extract the first character of each word
  const initials = words?.map((word) => word?.charAt(0));

  // Combine the initials into a string
  return initials?.join('')?.toUpperCase();
}


export function isBetween50And99(number) {
  return number >= 50 && number <= 99;
}
