import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAgent } from "../../api/agentAPI";
import {
  deleteToken,
  deleteUser,
  getUser,
  parseJwt,
  saveUser,
} from "../../config/sessionHandler";
import { useLayoutEffect } from "react";

export const AuthContext = React.createContext();
function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    id: "",
    profile: "",
    name: "",
    email: "",
    phonenumber: "",
    permissions: [],
    role: "",
    active: true,
  });

  useLayoutEffect(() => {
    setLoading(true);
    const loggedInUser = getUser();
    setUser(loggedInUser);
    setLoading(false);
  }, []);

  const login = (data) => {
    const newUser = parseJwt(data);
    setUser({ ...user, ...newUser });
    saveUser(data);
  };

  const updateProfilePhoto = (data) => {
    setUser({ ...user, ...data });
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: logoutAgent,
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
            lastname: "",
            firstname: "",
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
      <AuthContext.Provider value={{ user, updateProfilePhoto, login, logout }}>
        {children}
      </AuthContext.Provider>
      {(isLoading || loading) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: "99999",
            display: "grid",
            placeItems: "center",
            height: "100svh",
          }}
        >
          <div className="spinner2"></div>
        </div>
      )}
    </div>
  );
}

export default AuthProvider;
