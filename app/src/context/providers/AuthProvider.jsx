import { useQueryClient, useMutation } from "@tanstack/react-query";
import React, { useState, useLayoutEffect } from "react";
import { logoutUser } from "../../api/userAPI";
import { useNavigate } from "react-router-dom";

import {
  deleteToken,
  deleteUser,
  getUser,
  parseJwt,
  saveUser,
} from "../../config/sessionHandler";
import GlobalSpinner from "../../components/GlobalSpinner";

export const AuthContext = React.createContext();
function AuthProvider({ children }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  function login(data) {
    const newUser = parseJwt(data);
    setUser({ ...user, ...newUser });
    saveUser(data);
  }

  function updateProfilePhoto(data) {
    setUser({ ...user, ...data });
  }
 

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: logoutUser,
  });

  function logout() {
    mutateAsync(
      {},

      {
        onSettled: () => {
          queryClient.invalidateQueries(["wallet-balance"]);
        },
        onSuccess: () => {
          navigate("/");

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
  }

  return (
    <div style={{ position: "relative" }}>
      <AuthContext.Provider value={{ user, updateProfilePhoto, login, logout }}>
        {children}
      </AuthContext.Provider>

      {(isLoading || loading) && <GlobalSpinner />}
    </div>
  );
}

export default AuthProvider;
