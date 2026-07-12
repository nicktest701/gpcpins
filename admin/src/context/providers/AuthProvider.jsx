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
    setLoading(true);

    async function getAuthUser() {
      await getAdmin()
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
