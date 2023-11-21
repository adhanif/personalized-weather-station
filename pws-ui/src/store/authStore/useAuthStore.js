import { create } from "zustand";
import axios from "axios";
import { extractUserInfoFromToken } from "../../misc/tokenUtils";

import axiosClient from "./axiosClient";

const AUTH_API_URL = (import.meta.env.VITE_BE_URL || "") + "/api/auth";

// Create a Zustand store for authentication
const useAuthStore = create((set) => {
  const storedToken = localStorage.getItem("token");
  const initialTokenData = storedToken
    ? extractUserInfoFromToken(storedToken)
    : null;

  set({
    username: initialTokenData ? initialTokenData.username : null,
    email: initialTokenData ? initialTokenData.email : null,
    id: initialTokenData ? initialTokenData.id : null,
    token: storedToken,
  });

  return {
    // Sign-up function
    signUp: async (userData) => {
      try {
        const response = await axiosClient.post(`/signup`, userData);
        const { username, id, email, token } = response.data;
        set({ username, email, id, token });
        return { status: "success", message: "Sign-up successful!" };
      } catch (error) {
        return { success: false, message: "Sign-up failed. Please try again." };
      }
    },

    // Sign-in function
    signIn: async (credentials) => {
      try {
      
        const response = await axiosClient.post("/signin", credentials);

        const { username, id, email, token } = response.data;
        set({ username, id, email, token });
        localStorage.setItem("token", token);
        return { status: "success", message: "Sign-in successful!" };
      } catch (error) {
        return {
          status: "error",
          message: "Sign-in failed. Please check your credentials.",
        };
      }
    },

    signOut: async () => {
      try {
        const response = await axiosClient.post("/logout");
        set((state) => {
          return { username: null, token: null, email: null };
        });
        localStorage.removeItem("token");
        return { success: true, message: "Logout successful!" };
      } catch (error) {}
    },

    notification: {
      open: false,
      message: "",
      severity: "",
    },

    setNotification: (open, message, severity) =>
      set((state) => ({
        notification: { ...state.notification, open, message, severity },
      })),

    checkStoredToken: () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const initialTokenData = extractUserInfoFromToken(storedToken);

        set({
          email: initialTokenData ? initialTokenData.email : null,
          id: initialTokenData ? initialTokenData.id : null,
          token: storedToken,
        });
      }
    },
  };
});

export default useAuthStore;
