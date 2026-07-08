import { useMutation } from "@tanstack/react-query";
import React, { useState, useContext, useEffect } from "react";
import { logoutUser } from "@/api/userAPI";

import { deleteToken } from "@/config/sessionHandler";
import GlobalSpinner from "@/components/GlobalSpinner";
import { getUser } from "../../api/userAPI";
import { getToken } from "../../config/sessionHandler";

export const AuthContext = React.createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("An unknown error has occurred.");
  }
  return context;
};

function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoading(true);

    async function getAuthUser() {
      await getUser()
        .then((data) => {
          setUser(data.user);
          const token = getToken();
          setAccessToken(token);
        })
        .catch((e) => {
          setUser(null);
          setAccessToken("");
        })
        .finally(() => {
          setLoading(false);
        });
    }

    getAuthUser();
  }, []);

  function login(data) {
    setUser(data?.user);
    setAccessToken(data?.accessToken);
  }

  function updateUser(data) {
    setUser({ ...user, ...data });
  }

  function updateProfilePhoto(data) {
    setUser({ ...user, ...data });
  }

  const { mutateAsync, isPending } = useMutation({
    mutationFn: logoutUser,
  });

  function logout() {
    mutateAsync(
      {},

      {
        onSettled: () => {
          window.location.href = "/";
          deleteToken();
          setAccessToken("");
          setUser(null);
        },
      },
    );
  }

  if (isPending || loading) {
    return <GlobalSpinner />;
  }

  return (
    <div style={{ position: "relative" }}>
      <AuthContext.Provider
        value={{
          user,
          accessToken,
          updateUser,
          updateProfilePhoto,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </div>
  );
}

export default AuthProvider;
