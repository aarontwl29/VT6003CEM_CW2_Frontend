import axios from "axios";
import { api } from "../components/common/http-common";

// User interface matching the backend model
export interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  about: string | null;
  email: string;
  password?: string; // Optional for frontend display
  avatarurl: string | null;
  role: string; // Role of the user ('admin', 'operator', 'user', etc.)
}

export interface UsersListResponse {
  users: User[];
  total?: number;
  page?: number;
  limit?: number;
}

// Create axios instance with auth header
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: api.uri,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
};

/**
 * Get the current user's profile information
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    console.log("Fetching user profile...");
    const axiosInstance = createAuthenticatedRequest();
    const response = await axiosInstance.get("/users/profile");
    console.log("User profile response:", response.data);
    return response.data as User;
  } catch (error) {
    console.error("Error fetching user profile:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Authentication required. Please log in.");
      } else if (axiosError.response?.status === 404) {
        throw new Error("User profile not found.");
      } else if (axiosError.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(
          axiosError.response?.data?.message ||
            "Failed to fetch user profile. Please try again."
        );
      }
    } else {
      throw new Error("Network error. Please check your connection.");
    }
  }
};

/**
 * Get list of all users (admin only)
 */
export const getUsersList = async (
  limit: number = 10,
  page: number = 1
): Promise<User[]> => {
  try {
    console.log("Fetching users list...", { limit, page });
    const axiosInstance = createAuthenticatedRequest();
    const response = await axiosInstance.get("/users/list", {
      params: { limit, page },
    });
    console.log("Users list response:", response.data);
    return response.data as User[];
  } catch (error) {
    console.error("Error fetching users list:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Authentication required. Please log in.");
      } else if (axiosError.response?.status === 403) {
        throw new Error("Access denied. Admin role required.");
      } else if (axiosError.response?.status === 404) {
        throw new Error("No users found.");
      } else if (axiosError.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(
          axiosError.response?.data?.message ||
            "Failed to fetch users list. Please try again."
        );
      }
    } else {
      throw new Error("Network error. Please check your connection.");
    }
  }
};

/**
 * Get user by ID (admin operations - fetch from users list and find by ID)
 */
export const getUserById = async (userId: number): Promise<User> => {
  try {
    console.log("Fetching user by ID:", userId);

    // Since there's no direct endpoint to get user by ID, we'll fetch all users and find the one we need
    const users = await getUsersList(100, 1); // Get a larger list to find the user
    const user = users.find((u) => u.id === userId);

    if (!user) {
      throw new Error("User not found.");
    }

    console.log("User by ID found:", user);
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);

    if (error instanceof Error) {
      throw error; // Re-throw if it's already a proper error
    }

    throw new Error("Failed to fetch user information. Please try again.");
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData: {
  firstname?: string;
  lastname?: string;
  about?: string;
  avatarurl?: string;
  oldPassword?: string;
  newPassword?: string;
}): Promise<User> => {
  try {
    console.log("Updating user profile...", profileData);
    const axiosInstance = createAuthenticatedRequest();
    const response = await axiosInstance.put("/users/profile", profileData);
    console.log("Profile update response:", response.data);
    return response.data as User;
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Authentication required. Please log in.");
      } else if (axiosError.response?.status === 400) {
        throw new Error(
          axiosError.response?.data?.message ||
            "Invalid profile data. Please check your input."
        );
      } else if (axiosError.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(
          axiosError.response?.data?.message ||
            "Failed to update profile. Please try again."
        );
      }
    } else {
      throw new Error("Network error. Please check your connection.");
    }
  }
};

/**
 * Upload avatar image
 */
export const uploadAvatar = async (
  file: File
): Promise<{ avatarUrl: string; message: string }> => {
  try {
    console.log("Uploading avatar...", file.name);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("upload", file);

    const response = await axios.post(
      `${api.uri}/users/upload-avatar`,
      formData,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Avatar upload response:", response.data);
    const data = response.data as { avatarUrl: string; message: string };
    return {
      avatarUrl: data.avatarUrl,
      message: data.message,
    };
  } catch (error) {
    console.error("Error uploading avatar:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Authentication required. Please log in.");
      } else if (axiosError.response?.status === 400) {
        throw new Error(
          axiosError.response?.data?.message ||
            "Invalid file. Please upload a valid image file."
        );
      } else if (axiosError.response?.status === 413) {
        throw new Error("File too large. Maximum size is 5MB.");
      } else if (axiosError.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(
          axiosError.response?.data?.message ||
            "Failed to upload avatar. Please try again."
        );
      }
    } else {
      throw new Error("Network error. Please check your connection.");
    }
  }
};

/**
 * Update any user's profile (admin only)
 */
export const updateUserProfileById = async (
  userId: number,
  profileData: {
    firstname?: string;
    lastname?: string;
    about?: string;
    avatarurl?: string;
    role?: string;
    newPassword?: string;
  }
): Promise<User> => {
  try {
    console.log("Updating user profile by ID...", userId, profileData);
    const axiosInstance = createAuthenticatedRequest();
    const response = await axiosInstance.put(
      `/users/profile/${userId}`,
      profileData
    );
    console.log("Profile update response:", response.data);
    return response.data as User;
  } catch (error) {
    console.error("Error updating user profile by ID:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 401) {
        throw new Error("Authentication required. Please log in.");
      } else if (axiosError.response?.status === 403) {
        throw new Error("Access denied. Admin role required.");
      } else if (axiosError.response?.status === 400) {
        throw new Error(
          axiosError.response?.data?.message ||
            "Invalid profile data. Please check your input."
        );
      } else if (axiosError.response?.status === 404) {
        throw new Error("User not found.");
      } else if (axiosError.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(
          axiosError.response?.data?.message ||
            "Failed to update user profile. Please try again."
        );
      }
    } else {
      throw new Error("Network error. Please check your connection.");
    }
  }
};

export default {
  getUserProfile,
  getUsersList,
  getUserById,
  updateUserProfile,
  uploadAvatar,
  updateUserProfileById,
};
