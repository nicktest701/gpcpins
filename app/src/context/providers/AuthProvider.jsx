import { useMutation } from "@tanstack/react-query";
import React, { useState, useContext, useEffect } from "react";
import { logoutUser } from "@/api/userAPI";

import { deleteToken } from "@/config/sessionHandler";
import GlobalSpinner from "@/components/GlobalSpinner";
import { getUser } from "../../api/userAPI";

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
    let isMounted = true;
    setLoading(true);

    async function getAuthUser() {
      try {
        const data = await getUser();

        // Defense-in-depth: never accept a non-admin identity in the admin app
        if (data?.user?.role !== "1101") {
          throw new Error(
            "Unauthorized: User does not have required privileges.",
          );
        }

        if (isMounted) {
          setUser(data.user);
        }
      } catch (e) {
        // console.error("Error fetching user data:", e);
        if (isMounted) {
          deleteToken();
          setAccessToken("");
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    getAuthUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      setUser(null);
      setAccessToken("");
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
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
