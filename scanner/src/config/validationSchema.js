import { object, ref, string } from "yup";




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

export const addVerifierValidationSchema = () => {
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

export const updateVerifierValidationSchema = () => {
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



export const ticketsValidationSchema = () => {
  return object().shape({
    selectedCategory: string().trim().required("Required*"),
    selectedVerifier: object().shape({
      id: string().required("Required*"),
      name: string().required("Required*"),
    }),
    ticketType: object().shape({
      id: string().required("Required*"),
      voucherType: string().required("Required*"),
    }),
 
  });
};




