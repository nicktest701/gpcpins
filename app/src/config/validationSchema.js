import {
  date,
  number,
  object,
  string,
  ref,
  ValidationError,
  boolean,
} from "yup";
import {
  getInternationalMobileFormat,
  isValidPartner,
} from "../constants/PhoneCode";
import { isValidEmail } from "./validation";

const momoSchema = {
  mobilePartner: string().required("Required*"),
  phoneNumber: string()
    .trim()
    .required("Required*")
    .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number !")
    .label("mobilePartner")
    .test("isValidNetwork", "", (value, { parent }) => {
      const partner = parent?.mobilePartner || "Mobile";
      if (!isValidPartner(partner, getInternationalMobileFormat(value))) {
        throw new ValidationError(
          `Invalid ${
            partner === "mtn-gh"
              ? "MTN"
              : partner === "vodafone-gh"
              ? "Telecel"
              : partner === "tigo-gh"
              ? "AirtelTigo"
              : partner
          } number !`,
          value, // Value to associate the error with
          "phoneNumber" // Field to associate the error with
        );
      }

      return true;
    }),
  confirmPhonenumber: string()
    .trim()
    .required("Required*")
    .oneOf([ref("phoneNumber"), null], "Phone Numbers do not match"),
};

export const salesValidationSchema = () => {
  return object().shape({
    category: string().required("Required*"),
    voucherType: object().shape({
      id: string().required("Required*"),
    }),
    quantity: number()
      .required("Required*")
      .max(1000, "Max Quantity is 1000")
      .min(1, "Quantity should be 1 or more!"),
  });
};
export const waecValidationSchema = (momo) => {
  return object().shape({
    categoryType: object().shape({
      voucherType: string().required("Required*"),
    }),
    pricingType: object().shape({
      type: string().required("Required*"),
    }),
    email: string().test("isValidEmail", "", (value) => {
      if (value?.trim() === "" || value === undefined) {
        return true;
      }

      if (!isValidEmail(value)) {
        throw new ValidationError(
          "Invalid email format",
          value, // Value to associate the error with
          "email" // Field to associate the error with
        );
      }

      return true;
    }),
    paymentMethod: string().required("Payment Method Required*"),
    ...(momo ? momoSchema : null),
  });
};
export const ticketValidationSchema = (momo) => {
  return object().shape({
    email: string().test("isValidEmail", "", (value) => {
      if (value?.trim() === "" || value === undefined) {
        return true;
      }

      if (!isValidEmail(value)) {
        throw new ValidationError(
          "Invalid email format",
          value, // Value to associate the error with
          "email" // Field to associate the error with
        );
      }

      return true;
    }),
    paymentMethod: string().required("Payment Method Required*"),
    ...(momo ? momoSchema : null),
  });
};

export const universityValidationSchema = (momo) => {
  return object().shape({
    categoryType: object().shape({
      voucherType: string().required("Required*"),
    }),
    quantity: number()
      .required("Required*")
      .max(1000, "Max Quantity is 1000")
      .min(1, "Quantity should be 1 or more!"),
    fullName: string().trim().required("Required*"),
    email: string().test("isValidEmail", "", (value) => {
      if (value?.trim() === "" || value === undefined) {
        return true;
      }

      if (!isValidEmail(value)) {
        throw new ValidationError(
          "Invalid email format",
          value, // Value to associate the error with
          "email" // Field to associate the error with
        );
      }

      return true;
    }),
    paymentMethod: string().required("Payment Method Required*"),
    ...(momo ? momoSchema : null),
  });
};

export const prepaidNonUserPaymentValidationSchema = (momo) => {
  return object().shape({
    amount: number()
      .required("Required")
      .min(50, "Minimum amount you can buy is GHS 50."),
    email: string().test("isValidEmail", "", (value) => {
      if (value?.trim() === "" || value === undefined) {
        return true;
      }

      if (!isValidEmail(value)) {
        throw new ValidationError(
          "Invalid email format",
          value, // Value to associate the error with
          "email" // Field to associate the error with
        );
      }

      return true;
    }),
    paymentMethod: string().required("Payment Method Required*"),
    ...(momo ? momoSchema : null),
  });
};

export const prepaidMeterValidationSchema = () => {
  return object().shape({
    number: string()
      .trim()
      .uppercase()
      .required("Required*")
      .matches(/^[a-zA-Z]\d{9}$/, "Invalid Meter id"),
    confirmNumber: string()
      .trim()
      .uppercase()
      .required("Required*")
      .oneOf([ref("number"), null], "Meter IDs do not match"),
    // SPNNumber: string().nullable()
    //   .trim()
    //   .uppercase(),
    // confirmSPNNumber: string()
    //   .when("SPNNumber", {
    //     is: SPNNumber => SPNNumber !== null && SPNNumber !== '',
    //     then: string().required("Required*"),
    //     otherwise: string().trim()
    //       .uppercase()
    //       .oneOf([ref("SPNNumber"), null], "SPN Numbers do not match")
    //   }).trim()
    //   .uppercase()
    //   .oneOf([ref("SPNNumber"), null], "SPN Numbers do not match")
    // ,
    name: string().trim().required("Required*"),
  });
};
export const airtimeORbundleValidationSchema = () => {
  return object().shape({
    type: string().required("Required*"),
    provider: string().required("Required*"),
    phoneNumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    confirmPhonenumber: string()
      .trim()
      .required("Required*")
      .oneOf([ref("phoneNumber"), null], "Phone Numbers do not match"),
  });
};

export const airtimeValidationSchema = () => {
  return object().shape({
    amount: number()
      .required("Required")
      .min(1, "Minimum airtime you can buy is GHS 1.")
      .max(100, "Maximum airtime you can buy is GHS 100."),
    paymentMethod: string().required("Payment Method Required*"),
    // wallet: boolean().oneOf([true], "Payment option required*"),
    // mobilePartner: string().required("Required*"),
    // phonenumber: string()
    //   .trim()
    //   .required("Required*")
    //   .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
  });
};
export const bundleValidationSchema = () => {
  return object().shape({
    amount: number().required("Required"),
    paymentMethod: string().required("Payment Method Required*"),
    // wallet: boolean().oneOf([true], "Payment option required*"),
    // mobilePartner: string().required("Required*"),
    // phonenumber: string()
    //   .trim()
    //   .required("Required*")
    //   .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
  });
};

export const bulkAirtimeValidationSchema = (momo) => {
  return object().shape({
    email: string().test("isValidEmail", "", (value) => {
      if (value?.trim() === "" || value === undefined) {
        return true;
      }

      if (!isValidEmail(value)) {
        throw new ValidationError(
          "Invalid email format",
          value, // Value to associate the error with
          "email" // Field to associate the error with
        );
      }

      return true;
    }),
    amount: number()
      .required("Required")
      .min(1, "Minimum airtime you can buy is GHS 1."),
    paymentMethod: string().required("Payment Method Required*"),
    ...(momo ? momoSchema : null),
    // wallet: boolean().oneOf([true], "Payment option required*"),

    // mobilePartner: string().required("Required*"),
    // phonenumber: string()
    //   .trim()
    //   .required("Required*")
    //   .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
  });
};

export const messageValidationSchema = () => {
  return object().shape({
    name: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),

    body: string()
      .trim()
      .required("Required*")
      .max(200, "Message too long! Maximum of 50 words is required."),
  });
};
export const hostingMessageValidationSchema = () => {
  return object().shape({
    name: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    description: string()
      .trim()
      .required("Required*")
      .max(200, "Message too long! Maximum of 50 words is required."),
  });
};

export const organizationMessageValidationSchema = () => {
  return object().shape({
    firstname: string().trim().required("Required*"),
    lastname: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    businessname: string().trim().required("Required*"),
    location: string().trim().required("Required*"),
    category: object().shape({
      id: string().required("Required*"),
      name: string().required("Required*"),
    }),
    description: string()
      .trim()
      .required("Required*")
      .max(200, "Description too long! Maximum of 200 characters is required."),
  });
};
export const agentRegistrationValidationSchema = () => {
  return object().shape({
    firstname: string().trim().required("Required*"),
    lastname: string().trim().required("Required*"),
    dob: date().required("Required*"),
    nid: string()
      .optional()
      .test(
        "is-valid-id",
        "Enter a valid Voter ID (digits only) or National ID (GHA-XXXXXXXXX-X)",
        function (value) {
          if (!value) return true; // optional when empty

          const isVoterId = /^\d{10}$/.test(value); // adjust the digit length if needed
          const isNationalId = /^GHA-\d{9}-\d$/.test(value);

          return isVoterId || isNationalId;
        }
      ),
    residence: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    business_name: string().trim().required("Required*"),
    business_location: string().trim().required("Required*"),
    business_description: string().trim().required("Required*"),
    business_email: string().email("Invalid email address").optional(),
    business_phonenumber: string()
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number")
      .optional(),
  });
};

export const loginValidationSchema = () => {
  return object().shape({
    email: string()
      .trim()
      .required("Required*")
      .label("mobilePartner")
      .test("isValidNetwork", "", (value, { parent }) => {
        const details = parent?.email;

        if (details.includes("@")) {
          if (!/[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim.test(details)) {
            throw new ValidationError(
              `Invalid Email Address`,
              value, // Value to associate the error with
              "email" // Field to associate the error with
            );
          }
        } else {
          if (!/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/.test(details)) {
            throw new ValidationError(
              `Invalid Phone Number`,
              value, // Value to associate the error with
              "email" // Field to associate the error with
            );
          }
        }

        return true;
      }),

    token: string().trim().required("Required*"),
  });
};

export const registerUserValidationSchema = () => {
  return object().shape({
    token: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    terms: boolean() // use bool instead of boolean
      .oneOf([true], "You must accept the terms and conditions"),
  });
};
export const getStartedValidationSchema = () => {
  return object().shape({
    firstname: string().trim().required("Required*"),
    lastname: string().trim().required("Required*"),
    phonenumber: string()
      .optional()
      .test("is-valid-phone", "Enter a valid phone number", function (value) {
        if (!value) return true; // allow empty (optional)
        return /^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/.test(value); // customize pattern as needed
      }),
    nid: string()
      .optional()
      .test(
        "is-valid-id",
        "Enter a valid Voter ID (digits only) or National ID (GHA-XXXXXXXXX-X)",
        function (value) {
          if (!value) return true; // optional when empty

          const isVoterId = /^\d{10}$/.test(value); // adjust the digit length if needed
          const isNationalId = /^GHA-\d{9}-\d$/.test(value);

          return isVoterId || isNationalId;
        }
      ),
  });
};
export const updateUserValidationSchema = () => {
  return object().shape({
    firstname: string().trim().required("Required*"),
    lastname: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    nid: string()
      .optional()
      .test(
        "is-valid-id",
        "Enter a valid Voter ID (digits only) or National ID (GHA-XXXXXXXXX-X)",
        function (value) {
          if (!value) return true; // optional when empty

          const isVoterId = /^\d{10}$/.test(value); // adjust the digit length if needed
          const isNationalId = /^GHA-\d{9}-\d$/.test(value);

          return isVoterId || isNationalId;
        }
      ),
  });
};

// Add Category
export const addWaecValidationSchema = () => {
  return object().shape({
    voucherType: string().trim().required("Required*"),
    sellingPrice: number().min(1, "Please enter a valid price"),
    voucherURL: string().trim().required("Required*"),
  });
};

export const addUniversityValidationSchema = () => {
  return object().shape({
    voucherType: string().trim().required("Required*"),
    formType: string().trim().required("Required*"),
    price: number().required("Required").min(1, "Please enter a valid price"),
    voucherURL: string().trim().required("Required*"),
  });
};

export const addCinemaValidationSchema = () => {
  return object().shape({
    voucherType: string().trim().required("Required*"),
    theatre: string().trim().required("Required*"),
    location: string().trim().required("Required*"),
    date: date().required("Required*").min(new Date(), "Date must be present!"),
  });
};

export const addStadiumValidationSchema = () => {
  return object().shape({
    matchType: string().trim().required("Required*"),
    home: string().trim().required("Required*"),
    away: string().trim().required("Required*"),
    venue: string().trim().required("Required*"),
    date: date().required("Required*").min(new Date(), "Date must be present!"),
  });
};

export const addBusValidationSchema = () => {
  return object().shape({
    price: number().required("Required").min(1, "Please enter a valid fare"),
    noOfSeats: number().required("Required").min(1, "No of Seats cannot be 0"),
    origin: string().trim().required("Required*"),
    destination: string().trim().required("Required*"),
    vehicleNo: string().trim().required("Required*"),
    date: date().required("Required*").min(new Date(), "Date must be present!"),
  });
};
