import axios from "axios";
import { api } from "../components/common/http-common";
import { AUTH_STATE_CHANGE_EVENT } from "../App";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  about: string;
  email: string;
  avatarurl: string;
  role: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Function to handle user login
export const login = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${api.uri}/users/login`, {
      username,
      password,
    });

    if (response.status === 200) {
      // Store token and user in local storage for persistent auth
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Dispatch custom event to notify app of auth state change
      window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
    }

    return response.data;
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem("token") !== null;
};

// Function to get current user's role
export const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

// Function to get the current user from localStorage
export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem("user");
  if (!userString) return null;

  try {
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

// Function to handle user logout
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Dispatch custom event to notify app of auth state change
  window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
};

// Function to get the authentication token
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};
