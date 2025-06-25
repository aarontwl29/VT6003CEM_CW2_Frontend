export interface Room {
  booking_room_id: number;
  booking_status: "pending" | "approved" | "cancelled";
  room_id: number;
  hotel_id: number;
  capacity: number;
  bed_option: string;
  amenities: string[];
  price_per_night: number;
  has_discount: boolean;
  discount_rate: number;
  actual_price: number;
  hotel_name: string;
  hotel_city: string;
  hotel_country: string;
}

export interface Booking {
  booking_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  staff_email: string | null;
  first_message: string;
  rooms: Room[];
}

export interface Hotel {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  address: string;
  rating: number;
  review_count: number;
  image_url: string;
}
