import axios from "axios";
import { api } from "../components/common/http-common";
import { getToken } from "../services/authService";

export interface FavoriteHotel {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  address: string;
  rating: number;
  review_count: number;
  image_url?: string;
}

// Add a hotel to favorites
export const addFavorite = async (hotel_id: number): Promise<string> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    const response = await axios.post(
      `${api.uri}/favs/add`,
      { hotel_id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responseData = response.data as { message?: string };
    return responseData.message || "Favorite added successfully";
  } catch (error) {
    console.error("Error adding favorite:", error);
    
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      
      if (axiosError.response?.status === 400) {
        throw new Error(axiosError.response.data?.message || "Invalid request");
      }
      if (axiosError.response?.status === 401) {
        throw new Error("Please log in to add favorites");
      }
    }
    
    throw new Error("Failed to add favorite. Please try again.");
  }
};

// Remove a hotel from favorites
export const removeFavorite = async (hotel_id: number): Promise<string> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    const response = await axios({
      method: 'DELETE',
      url: `${api.uri}/favs/delete`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { hotel_id }
    });

    const responseData = response.data as { message?: string };
    return responseData.message || "Favorite removed successfully";
  } catch (error) {
    console.error("Error removing favorite:", error);
    
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      
      if (axiosError.response?.status === 400) {
        throw new Error(axiosError.response.data?.message || "Invalid request");
      }
      if (axiosError.response?.status === 401) {
        throw new Error("Please log in to manage favorites");
      }
    }
    
    throw new Error("Failed to remove favorite. Please try again.");
  }
};

// Get all favorite hotels for the current user
export const getFavorites = async (): Promise<FavoriteHotel[]> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    const response = await axios.get(
      `${api.uri}/favs/list`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responseData = response.data as FavoriteHotel[] | null;
    return responseData || [];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      
      if (axiosError.response?.status === 401) {
        throw new Error("Please log in to view favorites");
      }
    }
    
    throw new Error("Failed to load favorites. Please try again.");
  }
};

// Check if a hotel is in favorites (helper function)
export const isFavorite = async (hotel_id: number): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some(hotel => hotel.id === hotel_id);
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false; // Default to false if we can't check
  }
};
