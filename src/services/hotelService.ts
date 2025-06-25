import axios from "axios";
import { api } from "../components/common/http-common"; //http://localhost:10888/api/v1
import { getToken } from "../services/authService";

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
  staff_email?: string;
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
        staff_email: bookingData.staff_email,
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
