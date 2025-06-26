import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Spin, Tag, DatePicker, Button, Input, message } from "antd";
import axios from "axios";
import { api } from "../components/common/http-common";
import dayjs from "dayjs";
import { HeartOutlined, HeartFilled } from "@ant-design/icons"; // Import heart icons
import { UserOutlined } from "@ant-design/icons"; // Import person icon
import { isAuthenticated, getCurrentUser } from "../services/authService";
import { createBooking } from "../services/hotelService";
import { addFavorite, removeFavorite, isFavorite } from "../services/favsService";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { startDate, endDate } = location.state || {};
  const [loading, setLoading] = useState<boolean>(true);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]); // Track selected rooms
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [messageContent, setMessageContent] = useState<string>(""); // State for user message

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setLoading(true);
      try {
        const hotelResponse = await axios.get<Hotel>(
          `${api.uri}/hotels/${hotelId}`
        );
        setHotel(hotelResponse.data);

        const roomsResponse = await axios.get<Room[]>(
          `${api.uri}/hotels/${hotelId}/rooms`
        );
        setRooms(roomsResponse.data);

        // Check if this hotel is in user's favorites (only if authenticated)
        if (isAuthenticated() && hotelId) {
          try {
            const favoriteStatus = await isFavorite(parseInt(hotelId));
            setIsFavourite(favoriteStatus);
          } catch (error) {
            console.error("Error checking favorite status:", error);
            // Don't set error state, just keep default false
          }
        }
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

  const toggleFavourite = async () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      message.warning("Please log in to manage favorites.");
      navigate("/login");
      return;
    }

    if (!hotelId || !hotel) {
      message.error("Hotel information not available.");
      return;
    }

    try {
      const hotelIdNum = parseInt(hotelId);
      
      if (isFavourite) {
        // Remove from favorites
        await removeFavorite(hotelIdNum);
        setIsFavourite(false);
        message.success(`${hotel.name} removed from favorites!`);
      } else {
        // Add to favorites
        await addFavorite(hotelIdNum);
        setIsFavourite(true);
        message.success(`${hotel.name} added to favorites!`);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      message.error(error instanceof Error ? error.message : "Failed to update favorites. Please try again.");
    }
  };

  const handleRoomSelection = (roomId: number) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const calculateTotalPrice = () => {
    const selectedRoomPrices = rooms
      .filter((room) => selectedRooms.includes(room.id))
      .map((room) =>
        room.has_discount
          ? parseFloat(room.actual_price)
          : parseFloat(room.price_per_night)
      );

    const totalPrice = selectedRoomPrices.reduce(
      (acc, price) => acc + price,
      0
    );
    const originalPrice = rooms
      .filter((room) => selectedRooms.includes(room.id))
      .map((room) => parseFloat(room.price_per_night))
      .reduce((acc, price) => acc + price, 0);

    return { totalPrice, originalPrice };
  };

  const handleReserve = async () => {
    console.log("Reserve button clicked");

    // Check if the user is authenticated
    if (!isAuthenticated()) {
      message.warning("You need to log in to reserve a room.");
      navigate("/login");
      return;
    }

    // Get the current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      message.error("Unable to retrieve user information.");
      return;
    }

    // Validate inputs
    if (!startDate || !endDate) {
      message.error("Please select booking dates.");
      return;
    }

    if (!selectedRooms.length) {
      message.error("Please select at least one room.");
      return;
    }

    if (!messageContent.trim()) {
      message.error("Please leave a message for the staff.");
      return;
    }

    // Get the email input value
    const emailInput = document.querySelector(
      "input[type='email']"
    ) as HTMLInputElement;
    const staffEmail = emailInput?.value.trim() || null; // Always use null for empty email

    console.log("Email input value:", staffEmail); // Debug log for email

    // Prepare booking data
    const bookingData = {
      start_date: startDate,
      end_date: endDate,
      staff_email: staffEmail, // Pass null if email is empty
      first_message: messageContent,
      room_ids: selectedRooms,
    };

    try {
      // Call the createBooking function
      const response = await createBooking(bookingData);
      console.log("Booking response:", response);
      message.success("Reservation submitted successfully!");

      // Redirect to the search bar page
      navigate("/search-hotels");
    } catch (error) {
      console.error("Error during reservation:", error);
      message.error("Failed to submit reservation. Please try again.");
    }
  };

  const { totalPrice, originalPrice } = calculateTotalPrice();

  return (
    <div
      style={{
        marginTop: "20px",
        maxWidth: "1800px", // Increased width of the parent container
        margin: "20px auto",
      }}
    >
      {loading ? (
        <Spin tip="Loading hotel and room data..." />
      ) : !hotel ? (
        <p>Hotel not found.</p>
      ) : (
        <>
          {/* Hotel Information */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
            {hotel.image_url && (
              <img
                src={hotel.image_url}
                alt={hotel.name}
                style={{
                  width: "300px",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              {/* Hotel Name and Heart Icon */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "10px",
                }}
              >
                <h2
                  style={{
                    marginBottom: "0",
                    flexGrow: 1,
                    textAlign: "left",
                  }}
                >
                  {hotel.name}
                </h2>
                <div
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    color: isFavourite ? "red" : "#aaa",
                  }}
                  onClick={toggleFavourite}
                >
                  {isFavourite ? <HeartFilled /> : <HeartOutlined />}
                </div>
              </div>

              {/* Rating and Review */}
              <div style={{ marginBottom: "10px", textAlign: "left" }}>
                <Tag color="blue" style={{ marginRight: "8px" }}>
                  {hotel.rating}
                </Tag>
                <span style={{ color: "#777" }}>
                  ({hotel.review_count} reviews)
                </span>
              </div>

              {/* Address */}
              <p style={{ margin: "5px 0", textAlign: "left" }}>
                {hotel.address}
              </p>
              <p style={{ margin: "5px 0", textAlign: "left" }}>
                {hotel.city}, {hotel.country}
              </p>

              {/* Description */}
              <p style={{ textAlign: "left" }}>{hotel.description}</p>
            </div>
          </div>

          {/* Booking Dates */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ textAlign: "left" }}>Select Booking Dates</h3>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <DatePicker
                placeholder="Check-in"
                value={startDate ? dayjs(startDate) : null}
              />
              <DatePicker
                placeholder="Check-out"
                value={endDate ? dayjs(endDate) : null}
              />
            </div>
          </div>

          {/* Room List */}
          <h3 style={{ textAlign: "left" }}>Available Rooms</h3>
          <div
            style={{
              width: "1000px", // Hardcoded width for the entire area
              border: "1px solid #ddd",
              borderRadius: "4px",
              overflow: "hidden",
              margin: "0 auto", // Center the section horizontally
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "15px", // Reduced gap between columns
                marginBottom: "30px",
              }}
            >
              {/* Left Column: Room List */}
              <div style={{ flex: 4.5 }}>
                {" "}
                {/* Increased width */}
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center", // Vertically center items
                      borderBottom: "1px solid #ddd",
                      padding: "15px 0",
                      flexWrap: "nowrap", // Prevent wrapping
                    }}
                  >
                    {/* Room Info */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: "350px", // Increased minimum width
                        textAlign: "left",
                        marginLeft: "25px",
                      }}
                    >
                      <h4 style={{ marginBottom: "5px" }}>
                        <strong>Room Type:</strong>{" "}
                        <span style={{ color: "blue" }}>{room.bed_option}</span>
                      </h4>
                      <p
                        style={{
                          margin: "5px 0",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{ marginRight: "8px", fontWeight: "bold" }}
                        >
                          Number of Guests:
                        </span>
                        {Array.from({ length: room.capacity }).map(
                          (_, index) => (
                            <UserOutlined
                              key={index}
                              style={{
                                marginRight: "5px",
                                color: "#555",
                              }}
                            />
                          )
                        )}
                      </p>
                      <div style={{ margin: "5px 0" }}>
                        <span
                          style={{ fontWeight: "bold", marginRight: "8px" }}
                        >
                          Today's Price:
                        </span>
                        {room.has_discount ? (
                          <>
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "red",
                                marginRight: "8px",
                              }}
                            >
                              USD${parseFloat(room.price_per_night).toFixed(2)}
                            </span>
                            <span
                              style={{ fontWeight: "bold", fontSize: "16px" }}
                            >
                              USD${parseFloat(room.actual_price).toFixed(2)}
                            </span>
                            <Tag color="green" style={{ marginLeft: "8px" }}>
                              {parseFloat(room.discount_rate) * 100}% off
                            </Tag>
                          </>
                        ) : (
                          <span
                            style={{ fontWeight: "bold", fontSize: "16px" }}
                          >
                            USD${parseFloat(room.price_per_night).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <strong style={{ marginRight: "5px" }}>
                          Amenities
                        </strong>
                        <div
                          style={{
                            marginTop: "5px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "5px",
                          }}
                        >
                          {room.amenities.map((amenity, index) => (
                            <Tag key={index} color="blue">
                              {amenity}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center", // Center horizontally
                        justifyContent: "center", // Center vertically
                        flex: 0.3, // Reduced width
                      }}
                    >
                      <label
                        style={{ fontWeight: "bold", marginBottom: "5px" }}
                      >
                        Select rooms
                      </label>
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(room.id)}
                        onChange={() => handleRoomSelection(room.id)}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          backgroundColor: "white", // Explicitly set white background
                          border: "1px solid #ccc", // Add border for better visibility
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Total Price, Email Input, Message Box & Reserve Button */}
              <div
                style={{
                  flex: 1.2, // Reduced width
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start", // Stick to left
                  justifyContent: "flex-start", // Align to the top
                  gap: "10px",
                  borderLeft: "1px solid #ddd", // Divider between columns
                  paddingLeft: "20px", // Space from divider
                  paddingRight: "20px", // Add padding to the right
                  textAlign: "left", // Ensure text sticks to the left
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                    Total Price:
                  </h3>{" "}
                  {/* Slightly larger font */}
                  <p style={{ margin: "5px 0" }}>
                    {selectedRooms.length} room(s) for
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <span
                      style={{ textDecoration: "line-through", color: "red" }}
                    >
                      USD${originalPrice.toFixed(2)}
                    </span>{" "}
                    USD${totalPrice.toFixed(2)}
                  </p>
                  <p style={{ margin: "5px 0", color: "#777" }}>
                    • You won't be charged yet.
                  </p>
                </div>
                <Input
                  type="email"
                  placeholder="Agent Email"
                  style={{ width: "100%" }}
                />
                <Input.TextArea
                  placeholder="Leave a message for the staff"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                  style={{ width: "100%" }}
                />
                <Button
                  type="primary"
                  style={{ width: "100%" }}
                  onClick={handleReserve}
                >
                  Reserve
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HotelDetails;
