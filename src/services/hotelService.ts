import axios from "axios";
import { api } from "../components/common/http-common"; //http://localhost:10888/api/v1
import { getToken } from "../services/authService";
import type { Booking, Hotel } from "../types/bookings.types";

export const searchHotels = async (filters: {
  country: string;
  city: string;
  start_date: string | null;
  end_date: string | null;
  personNumber: number;
  roomNumber: number;
}) => {
  try {
    const response = await axios.post(`${api.uri}/hotels/search`, {
      country: filters.country,
      city: filters.city,
      start_date: filters.start_date,
      end_date: filters.end_date,
      personNumber: filters.personNumber,
      roomNumber: filters.roomNumber,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching hotels:", error);
    throw error;
  }
};

// Function to create a booking
export const createBooking = async (bookingData: {
  start_date: string;
  end_date: string;
  staff_email: string | null; // Use null consistently
  first_message: string;
  room_ids: number[];
}) => {
  try {
    const token = getToken(); // Get the JWT token from authService
    if (!token) {
      throw new Error("User is not authenticated");
    }

    const response = await axios.post(
      `${api.uri}/hotels/bookings`, // Corrected API endpoint
      {
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        staff_email: bookingData.staff_email, // Pass null directly
        first_message: bookingData.first_message,
        room_ids: bookingData.room_ids,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
        },
      }
    );

    return response.data; // Return the response data
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const getBookingsForStaff = async (): Promise<Booking[]> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    const response = await axios.get(`${api.uri}/hotels/private/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format from server");
    }

    return response.data as Booking[];
  } catch (error) {
    console.error("Error in getBookingsForStaff:", error);
    throw error;
  }
};

export const getHotelById = async (hotel_id: number): Promise<Hotel> => {
  try {
    const response = await axios.get(`${api.uri}/hotels/${hotel_id}`);
    return response.data as Hotel; // Cast the response to the Hotel type
  } catch (error) {
    console.error("Error fetching hotel by ID:", error);
    throw error;
  }
};

export interface UserInfo {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  avatarurl: string;
}

export const getUserInfoById = async (user_id: number): Promise<UserInfo> => {
  try {
    const token = getToken(); // Get the JWT token from authService
    if (!token) {
      throw new Error("User is not authenticated");
    }

    const response = await axios.get<UserInfo>(
      `${api.uri}/users/booking/${user_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
        },
      }
    );

    return response.data; // Return the user info
  } catch (error) {
    console.error("Error fetching user info by ID:", error);
    throw error;
  }
};

// Function to update booking statuses
export const updateBookings = async (updateData: {
  booking_id: number;
  start_date: string | undefined;
  end_date: string | undefined;
  message: string;
  recipient_id: number;
  room_updates: {
    room_id: number;
    status: string;
  }[];
}) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    console.log("Sending update data:", JSON.stringify(updateData, null, 2));
    console.log("Request URL:", `${api.uri}/hotels/update/bookings`);

    const response = await axios.post(
      `${api.uri}/hotels/update/bookings`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating bookings:", error);

    // Log detailed error information for debugging
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown; headers?: unknown };
        config?: unknown;
      };
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
      console.error("Response headers:", axiosError.response?.headers);
      console.error("Request config:", axiosError.config);
    } else {
      console.error("Non-Axios error:", error);
    }

    throw error;
  }
};

// Function to get latest messages for booking IDs
export const getLatestMessages = async (booking_ids: number[]) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    console.log("Fetching messages for booking IDs:", booking_ids);
    console.log("Request URL:", `${api.uri}/msgs/bookings`);

    const response = await axios.post(
      `${api.uri}/msgs/bookings`,
      { booking_ids },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Messages response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);

    // Log detailed error information for debugging
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown; headers?: unknown };
        config?: unknown;
      };
      console.error(
        "Messages API - Response status:",
        axiosError.response?.status
      );
      console.error("Messages API - Response data:", axiosError.response?.data);
    }

    throw error;
  }
};
