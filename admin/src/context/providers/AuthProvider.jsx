import { useMutation } from "@tanstack/react-query";
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAdmin, getAdmin } from "../../api/adminAPI";
import { deleteToken, getToken } from "../../config/sessionHandler";
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
  const [accessToken, setAccessToken] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevents updating state if component unmounts
    setLoading(true);

    async function getAuthUser() {
      try {
        const data = await getAdmin();
        if (isMounted) {
      
          setUser(data.user);
          const token = getToken();
          setAccessToken(token);
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
        if (isMounted) {
          setUser(null);
          setAccessToken("");
          // Redirect cleanly without reloading the entire window
          // navigate("/auth/login?e=true");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    getAuthUser();

    return () => {
      isMounted = false; // Cleanup
    };
  }, [navigate]); // navigate is stable, so this still only runs once

  const login = (data) => {
    setUser(data?.user);
    setAccessToken(data?.accessToken);
  };

  const updateUser = (newData) => {
    setUser({
      ...user,
      ...newData,
    });
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
      },
    );
  };

  if (isLoading || loading) {
    return <GlobalSpinner />;
  }
  return (
    <div style={{ position: "relative" }}>
      <AuthContext.Provider
        value={{ user, accessToken, login, updateUser, logout }}
      >
        {children}
      </AuthContext.Provider>
    </div>
  );
}

export default AuthProvider;
