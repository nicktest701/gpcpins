function getPhoneNumberInfo(phonenumber) {
  const code = getInternationalMobileFormat(phonenumber);

  let providerName = "Unknown";
  if (code?.startsWith("+")) {
    if (["+23320", "+23350", "+23330"]?.includes(code?.slice(0, 6))) {
      providerName = "Vodafone";
    }
    if (
      ["+23324", "+23354", "+23355", "+23359", "+23325", "+23353"]?.includes(
        code?.slice(0, 6),
      )
    ) {
      providerName = "MTN";
    }

    if (
      ["+23327", "+23357", "+23326", "+23356", "+23323"]?.includes(
        code?.slice(0, 6),
      )
    ) {
      providerName = "AirtelTigo";
    }
  } else {
    if (["020", "050", "030"]?.includes(code?.slice(0, 3))) {
      providerName = "Vodafone";
    }
    if (
      ["024", "054", "055", "059", "025", "053"]?.includes(code?.slice(0, 3))
    ) {
      providerName = "MTN";
    }

    if (["027", "057", "026", "056", "023"]?.includes(code?.slice(0, 3))) {
      providerName = "AirtelTigo";
    }
  }

  switch (providerName) {
    case "MTN":
      return {
        providerName,
        phoneNumber: code,
        code: 4,
      };
    case "Vodafone":
      return {
        providerName,
        phoneNumber: code,
        code: 6,
      };
    case "AirtelTigo":
      return {
        providerName,
        phoneNumber: code,
        code: 1,
      };

    default:
      return {
        providerName,
        phoneNumber: code,
        code: 0,
      };
  }
}
function getInternationalMobileFormat(mobileNumber, includePlus = true) {
  if (!mobileNumber) return "";

  // Remove all non-numeric characters (spaces, hyphens, existing plus signs)
  const cleanNumber = mobileNumber.toString().replace(/\D/g, "");
  const prefix = includePlus ? "+" : "";

  // Handle local format (e.g., 0244123456 -> 233244123456)
  if (cleanNumber.startsWith("0")) {
    return prefix + "233" + cleanNumber.slice(1);
  }

  // Handle already international format (e.g., 233244123456)
  if (cleanNumber.startsWith("233")) {
    return prefix + cleanNumber;
  }

  // Handle short local format missing the leading zero (e.g., 244123456)
  if (cleanNumber.length === 9) {
    return prefix + "233" + cleanNumber;
  }

  // Return cleaned number if it doesn't match standard Ghanaian patterns
  return prefix + cleanNumber;
}

// function getInternationalMobileFormat(mobileNumber) {
//   if (mobileNumber?.startsWith("0")) {
//     return "+233" + mobileNumber?.slice(1);
//   }

//   if (mobileNumber?.startsWith("233")) {
//     return "+" + mobileNumber;
//   }

//   return mobileNumber;
// }

function isValidPartner(provider, mobileNumber) {
  if (!/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/.test(mobileNumber)) {
    return false;
  }

  const phonenumber = getInternationalMobileFormat(mobileNumber)?.slice(0, 6);

  switch (provider) {
    case "MTN":
      return ["+23324", "+23354", "+23355", "+23359", "+23325"]?.includes(
        phonenumber,
      );
    case "Vodafone":
      return ["+23320", "+23350"]?.includes(phonenumber);
    case "AirtelTigo":
      return ["+23327", "+23357", "+23326", "+23356"]?.includes(phonenumber);

    default:
      return false;
  }
}

module.exports = {
  getInternationalMobileFormat,
  isValidPartner,
  getPhoneNumberInfo,
};
