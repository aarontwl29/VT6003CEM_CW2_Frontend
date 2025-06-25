import React, { useEffect, useState } from "react";
import { getBookingsForStaff, getHotelById } from "../services/hotelService";
import type { Booking, Hotel } from "../types/bookings.types";

const TestingPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [hotelData, setHotelData] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getBookingsForStaff();
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(
          "Failed to fetch bookings. Please check the console for details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const fetchHotelById = async () => {
    if (!hotelId) {
      setError("Please enter a valid hotel ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getHotelById(hotelId);
      setHotelData(data);
    } catch (err) {
      console.error("Error fetching hotel by ID:", err);
      setError("Failed to fetch hotel. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Test Bookings and Hotel by ID</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Enter Hotel ID"
          value={hotelId || ""}
          onChange={(e) => setHotelId(parseInt(e.target.value))}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={fetchHotelById} style={{ padding: "5px 10px" }}>
          Fetch Hotel
        </button>
      </div>
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && bookings.length === 0 && <p>No bookings found.</p>}
      {!loading && !error && bookings.length > 0 && (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.booking_id} style={{ marginBottom: "10px" }}>
              <strong>Booking ID:</strong> {booking.booking_id} <br />
              <strong>User ID:</strong> {booking.user_id} <br />
              <strong>Start Date:</strong> {booking.start_date} <br />
              <strong>End Date:</strong> {booking.end_date} <br />
              <strong>Rooms:</strong> {booking.rooms.length} <br />
              <strong>First Message:</strong> {booking.first_message} <br />
              <strong>Staff Email:</strong>{" "}
              {booking.staff_email || "Not assigned"} <br />
              <hr />
            </li>
          ))}
        </ul>
      )}
      {hotelData && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "5px",
            marginTop: "20px",
          }}
        >
          <h3>{hotelData.name}</h3>
          <p>
            <strong>Description:</strong> {hotelData.description}
          </p>
          <p>
            <strong>City:</strong> {hotelData.city}
          </p>
          <p>
            <strong>Country:</strong> {hotelData.country}
          </p>
          <p>
            <strong>Address:</strong> {hotelData.address}
          </p>
          <p>
            <strong>Rating:</strong> {hotelData.rating}
          </p>
          <p>
            <strong>Review Count:</strong> {hotelData.review_count}
          </p>
          <img
            src={hotelData.image_url}
            alt={hotelData.name}
            style={{ maxWidth: "100%" }}
          />
          \
        </div>
      )}
    </div>
  );
};

export default TestingPage;
