import React, { createContext, useContext, useEffect, useState } from "react";

import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getProfile()
      .then(({ user }) => setUser(user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user } = await authService.login(email, password);
    setUser(user);
    return user;
  };

  const signup = async (username, email, password) => {
    const { user } = await authService.signup(username, email, password);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    const { user } = await authService.getProfile();
    setUser(user);
    return user;
  };

  const updateProfile = async (patch) => {
    const { user } = await authService.updateProfile(patch);
    setUser(user);
    return user;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, refreshProfile, updateProfile, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
