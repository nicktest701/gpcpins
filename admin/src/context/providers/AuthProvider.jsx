import { useMutation } from "@tanstack/react-query";
import React, { useState, useLayoutEffect,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../api/adminAPI";
import { deleteToken, getUser } from "../../config/sessionHandler";
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
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    id: "",
    profile: "",
    name: "",
    email: "",
    phonenumber: "",
    permissions:[],
    role: "",
    active: true,
  });

  useLayoutEffect(() => {
    setLoading(true);
    const user = getUser();
    setUser(user);
    setLoading(false);
  }, []);

  const login = (data) => {
    setUser(data);
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: logoutAdmin,
  });

  const logout = () => {
    mutateAsync(
      {},
      {
        onSuccess: () => {
          navigate("/auth/login");
          deleteToken();

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

  return (
    <div style={{ position: "relative" }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
      {(isLoading || loading) && <GlobalSpinner />}
    </div>
  );
}

export default AuthProvider;
