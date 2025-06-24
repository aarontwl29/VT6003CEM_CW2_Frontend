import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { List, Spin, Tag } from "antd";
import axios from "axios";
import { api } from "../components/common/http-common";

interface Room {
  id: number;
  hotel_id: number;
  capacity: number;
  bed_option: string;
  price_per_night: string;
  has_discount: boolean;
  discount_rate: string;
  actual_price: string;
  amenities: string[];
}

interface Hotel {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  address: string;
  rating: string;
  review_count: number;
  image_url?: string;
}

const HotelDetails: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setLoading(true);
      try {
        // Fetch hotel details
        const hotelResponse = await axios.get<Hotel>(
          `${api.uri}/hotels/${hotelId}`
        );
        console.log("Hotel API Response:", hotelResponse.data);
        setHotel(hotelResponse.data);

        // Fetch rooms for the hotel
        const roomsResponse = await axios.get<Room[]>(
          `${api.uri}/hotels/${hotelId}/rooms`
        );
        console.log("Rooms API Response:", roomsResponse.data);
        setRooms(roomsResponse.data);
      } catch (error) {
        console.error("Error fetching hotel or room data:", error);
        setHotel(null);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  return (
    <div style={{ marginTop: "20px" }}>
      {loading ? (
        <Spin tip="Loading hotel and room data..." />
      ) : !hotel ? (
        <p>Hotel not found.</p>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <h2>{hotel.name}</h2>
            <p>{hotel.description}</p>
            <p>Address: {hotel.address}</p>
            <p>City: {hotel.city}</p>
            <p>Country: {hotel.country}</p>
            <p>Rating: {hotel.rating}</p>
            <p>Review Count: {hotel.review_count}</p>
            {hotel.image_url && (
              <img
                src={hotel.image_url}
                alt={hotel.name}
                style={{ width: "300px", height: "auto" }}
              />
            )}
          </div>
          <List
            header={<h2>Room Details</h2>}
            bordered
            dataSource={rooms}
            renderItem={(room) => (
              <List.Item>
                <div style={{ width: "100%" }}>
                  <h3>{room.bed_option}</h3>
                  <p>Capacity: {room.capacity} persons</p>
                  <p>
                    Price per night: $
                    {parseFloat(room.price_per_night).toFixed(2)}
                  </p>
                  {room.has_discount && (
                    <p>
                      Discounted Price: $
                      {parseFloat(room.actual_price).toFixed(2)} (
                      {parseFloat(room.discount_rate) * 100}% off)
                    </p>
                  )}
                  <p>Amenities:</p>
                  <div>
                    {room.amenities.map((amenity, index) => (
                      <Tag key={index}>{amenity}</Tag>
                    ))}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </>
      )}
    </div>
  );
};

export default HotelDetails;
