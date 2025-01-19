import { useMutation } from "@tanstack/react-query";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutVerifier } from "../../api/verifierAPI";
import { deleteToken, deleteUser, getUser } from "../../config/sessionHandler";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";

export const AuthContext = React.createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("An unknown error has occurred.");
  }
  return context;
};

function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(getUser());

  const login = (data) => {
    setUser(data);
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: logoutVerifier,
  });

  const logout = () => {
    mutateAsync(
      {},
      {
        onSuccess: () => {
          navigate("/auth/login");
          deleteToken();
          deleteUser();

          setUser({
            id: "",
            profile: "",
            name: "",
            email: "",
            phonenumber: "",
            role: "",
          });
        },
      }
    );
  };

  if (isLoading) {
    return <GlobalSpinner />;
  }

  return (
    <div style={{ position: "relative" }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
      {/* {isLoading && <GlobalSpinner />} */}
    </div>
  );
}

export default AuthProvider;
