"use client";

import { useAuthContext } from "@/providers/auth-provider";

export function useAuth() {
  const {
    user,
    token,
    isLoading,
    login,
    logout,
    refreshProfile,
    isAuthenticated,
  } = useAuthContext();

  return {
    user,
    token,
    isLoading,
    login,
    logout,
    refreshProfile,
    isAuthenticated,
  };
}
