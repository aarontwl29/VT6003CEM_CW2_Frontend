import axios from "axios";
import { api } from "../components/common/http-common";

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
