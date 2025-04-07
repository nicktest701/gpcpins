import { date, number, object, ref, string } from "yup";

export const prepaidMeterValidationSchema = () => {
  return object().shape({
    number: string()
      .trim()
      .required("Required*")
      .matches(/^[A-Z]\d{9}$/, "Invalid Meter id"),
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
export const loginValidationSchema = () => {
  return object().shape({
    email: string().trim().required("Required*").email("Invalid email address"),
    token: string().trim().required("Required*"),
    password: string()
      .required("Required*")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must start with an uppercase letter")
      .matches(
        /[a-zA-Z].*\d|\d.*[a-zA-Z]/,
        "Password must contain both numbers and alphabets"
      ),
  });
};

export const passwordValidationSchema = () => {
  return object().shape({
    password: string()
      .required("Required*")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must start with an uppercase letter")
      .matches(
        /[a-zA-Z].*\d|\d.*[a-zA-Z]/,
        "Password must contain both numbers and alphabets"
      ),
    confirmPassword: string()
      .trim()
      .required("Required*")
      .oneOf([ref("password"), null], "Passwords do not match"),
  });
};

export const registerUserValidationSchema = () => {
  return object().shape({
    // name: string().trim().required('Required*'),
    token: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    // password: string()
    //   .trim()
    //   .required('Required*')
    //   .min(6, 'Password should 8-30 characters long'),
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
  });
};

export const addEmployeeValidationSchema = () => {
  return object().shape({
    firstname: string().trim().required("Required*"),
    lastname: string().trim().required("Required*"),
    username: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    role: string().trim().required("Required*"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    // password: string().trim().required('Required*').min(
    //   8,

    //   'Password should 8-30 characters long'
    // ),
    // confirmPassword: string()
    //   .trim()
    //   .required('Required*')
    //   .oneOf([ref('password'), null], 'Passwords do not match'),
  });
};

export const updateEmployeeValidationSchema = () => {
  return object().shape({
    firstname: string().trim().required("Required*"),
    lastname: string().trim().required("Required*"),
    username: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    role: string().trim().required("Required*"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    // password: string().trim().required('Required*').min(
    //   8,

    //   'Password should 8-30 characters long'
    // ),
    // confirmPassword: string()
    //   .trim()
    //   .required('Required*')
    //   .oneOf([ref('password'), null], 'Passwords do not match'),
  });
};
export const addClientValidationSchema = () => {
  return object().shape({
    name: string().trim().required("Required*"),
    location: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
    password: string().trim().required("Required*").min(
      8,

      "Password should 8-30 characters long"
    ),
    confirmPassword: string()
      .trim()
      .required("Required*")
      .oneOf([ref("password"), null], "Passwords do not match"),
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
    // date: date().required('Required*').min(moment(), 'Date must be present!'),
  });
};

export const addStadiumValidationSchema = () => {
  return object().shape({
    matchType: string().trim().required("Required*"),
    home: string().trim().required("Required*"),
    away: string().trim().required("Required*"),
    venue: string().trim().required("Required*"),
    // date: date().required('Required*').min(moment(), 'Date must be present!'),
  });
};

export const addBusValidationSchema = () => {
  return object().shape({
    price: number().required("Required").min(1, "Please enter a valid fare"),
    noOfSeats: number().required("Required").min(1, "No of Seats cannot be 0"),
    origin: string().trim().required("Required*"),
    destination: string().trim().required("Required*"),
    vehicleNo: string().trim().required("Required*"),
    // date: date().required('Required*').min(moment(), 'Date must be present!'),
  });
};

export const addWalletValidationSchema = () => {
  return object().shape({
    comment: string().trim().optional(),
    amount: number().required("Required").min(1, "Please enter a valid amount"),
  });
};

export const agentPersonalValidationSchema = () => {
  return object().shape({
    firstname: string().trim().required("Required*"),
    lastname: string().trim().required("Required*"),
    username: string().trim().required("Required*"),
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
  });
};

export const agentContactValidationSchema = () => {
  return object().shape({
    residence: string().trim().required("Required*"),
    email: string().trim().required("Required*").email("Invalid email address"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
  });
};

export const agentBusinessValidationSchema = () => {
  return object().shape({
    business_name: string().trim().required("Required*"),
    business_location: string().trim().required("Required*"),
    business_description: string().trim().required("Required*"),
    business_email: string()
      .trim()
      .required("Required*")
      .email("Invalid email address"),
    business_phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
  });
};

export const agentValidationSchema = () => {
  return object().shape({
    firstname: string().trim().required("Required*"),
    lastname: string().trim().required("Required*"),
    username: string().trim().required("Required*"),
    dob: date().optional(),
    nid:  string()
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
    business_description: string()
      .trim()
      .required("Required*")
      .max(200, "Description too long! Maximum of 200 characters is required."),
    business_email: string().email("Invalid email address").optional(),
    business_phonenumber: string()
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number")
      .optional(),
  });
};
export const userValidationSchema = () => {
  return object().shape({
    firstname: string().trim().required("Required*"),
    lastname: string().trim().required("Required*"),
    dob: date().optional(),
    nid:  string()
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
    email: string().trim().required("Required*").email("Invalid email address"),
    phonenumber: string()
      .trim()
      .required("Required*")
      .matches(/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/, "Invalid Phone number"),
  });
};

export const processPrepaidValidationSchema = () => {
  return object().shape({
    receipt: string().required(
      "A copy of the transaction receipt is required*"
    ),
    orderNo: string().required("Required*"),
    confirmOrderNo: string()
      .trim()
      .required("Required*")
      .oneOf([ref("orderNo"), null], "Tokens do not match"),
    paymentId: string().required("Required*"),
    confirmPaymentId: string()
      .trim()
      .required("Required*")
      .oneOf([ref("paymentId"), null], "Order IDs do not match"),
  });
};

// Add Category
export const refundValidationSchema = () => {
  return object().shape({
    id: string().trim().required("Required*"),
    category: string().trim().required("Required*"),
  });
};
