import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const setAuth = (authUser) => {
    if (typeof authUser === "function") {
      setUser((prev) => {
        const newUser = authUser(prev);
        return newUser;
      });
    } else {
      setUser(authUser);
    }
  };

  const setUserData = (userData) => {
    setUser((prev) => ({
      ...prev,
      ...userData,
    }));
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
