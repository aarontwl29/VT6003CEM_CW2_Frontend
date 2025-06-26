import React, { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Row,
  Col,
  Typography,
  Space,
  message,
  Spin,
  Button,
  Image,
  Timeline,
} from "antd";
import { MessageOutlined } from "@ant-design/icons";
import type { Booking, Hotel, Room } from "../types/bookings.types";
import {
  getBookingsForStaff,
  getHotelById,
  getLatestMessages,
} from "../services/hotelService";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

interface Message {
  id: number;
  booking_id: number;
  sender_id: number;
  recipient_id: number;
  message: string;
  // Note: created_at is not in the database schema, so we'll use id as a fallback for ordering
}

interface UserBookingItemProps {
  booking: Booking;
  hotelInfo?: Hotel;
  message?: Message;
}

const UserBookingItem: React.FC<UserBookingItemProps> = ({
  booking,
  hotelInfo,
  message,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  // Calculate total price
  const calculateRoomPrice = (room: Room): number => {
    let roomPrice = 0;
    if (room.actual_price !== undefined && room.actual_price !== null) {
      if (typeof room.actual_price === "number") {
        roomPrice = room.actual_price;
      } else {
        const parsedValue = parseFloat(String(room.actual_price));
        if (!isNaN(parsedValue)) {
          roomPrice = parsedValue;
        }
      }
    }
    return roomPrice;
  };

  const totalPrice = React.useMemo(() => {
    return (booking.rooms || []).reduce((total, room) => {
      return total + calculateRoomPrice(room);
    }, 0);
  }, [booking.rooms]);

  const roomCount = booking.rooms?.length || 0;

  // Calculate overall booking status based on room statuses
  const getOverallBookingStatus = () => {
    if (!booking.rooms || booking.rooms.length === 0) return "pending";

    const statuses = booking.rooms.map((room) => room.booking_status);
    if (statuses.every((status) => status === "approved")) return "approved";
    if (statuses.some((status) => status === "cancelled")) return "cancelled";
    return "pending";
  };

  const overallStatus = getOverallBookingStatus();

  // Format dates
  const startDate = dayjs(booking.start_date);
  const endDate = dayjs(booking.end_date);
  const nights = endDate.diff(startDate, "day");

  return (
    <Card
      style={{
        marginBottom: 24,
        border: "1px solid #e8e8e8",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Header Summary */}
      <div
        style={{
          background: "#fafafa",
          borderBottom: "1px solid #e8e8e8",
          padding: "16px 20px",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <div>
                <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                  Booking #{booking.booking_id}
                </Text>
                <br />
                <Space size="small">
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {roomCount} Room{roomCount > 1 ? "s" : ""} • {nights} night
                    {nights > 1 ? "s" : ""} • Total: ${totalPrice.toFixed(2)}
                  </Text>
                  <Tag
                    color={
                      overallStatus === "approved"
                        ? "green"
                        : overallStatus === "pending"
                        ? "orange"
                        : "red"
                    }
                  >
                    {overallStatus.charAt(0).toUpperCase() +
                      overallStatus.slice(1)}
                  </Tag>
                </Space>
              </div>

              <div>
                <Text strong style={{ fontSize: "14px" }}>
                  {hotelInfo?.name ||
                    booking.rooms?.[0]?.hotel_name ||
                    "Loading..."}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {startDate.format("MMM DD, YYYY")} -{" "}
                  {endDate.format("MMM DD, YYYY")}
                </Text>
              </div>
            </Space>
          </Col>

          <Col>
            <Space>
              {message && (
                <Tag icon={<MessageOutlined />} color="blue">
                  Latest Message
                </Tag>
              )}
              <Button
                type="primary"
                onClick={() => setExpanded(!expanded)}
                size="small"
              >
                {expanded ? "Hide Details" : "Show Details"}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: "20px" }}>
          {/* Overall Booking Status */}
          <div
            style={{
              background: "#f0f8ff",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              padding: "12px 16px",
              marginBottom: 24,
            }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Text strong style={{ fontSize: "14px" }}>
                  Booking Status:
                </Text>
                <Tag
                  color={
                    overallStatus === "approved"
                      ? "green"
                      : overallStatus === "pending"
                      ? "orange"
                      : "red"
                  }
                  style={{ marginLeft: 8, fontSize: "12px" }}
                >
                  {overallStatus.charAt(0).toUpperCase() +
                    overallStatus.slice(1)}
                </Tag>
              </Col>
              <Col>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Staff: {booking.staff_email || "Not assigned"}
                </Text>
              </Col>
            </Row>
          </div>

          {/* Hotel Information */}
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Title level={5} style={{ marginBottom: 16, color: "#1890ff" }}>
                Hotel Information
              </Title>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <Image
                  width={120}
                  height={90}
                  src={hotelInfo?.image_url}
                  alt="Hotel"
                  style={{ borderRadius: 8, objectFit: "cover" }}
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI2MCIgeT0iNDUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5Ib3RlbDwvdGV4dD48L3N2Zz4="
                />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: "12px" }}>
                    <Text strong style={{ fontSize: "18px" }}>
                      {hotelInfo?.name ||
                        booking.rooms?.[0]?.hotel_name ||
                        "Loading..."}
                    </Text>
                    {hotelInfo?.rating && (
                      <Tag color="gold" style={{ marginLeft: 8 }}>
                        ⭐ {hotelInfo.rating}/5
                      </Tag>
                    )}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Location: </Text>
                    <Text>
                      {hotelInfo?.city ||
                        booking.rooms?.[0]?.hotel_city ||
                        "Loading..."}
                      ,{" "}
                      {hotelInfo?.country ||
                        booking.rooms?.[0]?.hotel_country ||
                        "Loading..."}
                    </Text>
                  </div>
                  {hotelInfo?.address && (
                    <div style={{ marginBottom: "8px" }}>
                      <Text type="secondary">Address: </Text>
                      <Text>{hotelInfo.address}</Text>
                    </div>
                  )}
                  {hotelInfo?.description && (
                    <div>
                      <Text type="secondary">Description: </Text>
                      <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                        {hotelInfo.description}
                      </Paragraph>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          {/* Rooms Information */}
          <Title level={5} style={{ marginBottom: 16, color: "#1890ff" }}>
            Room Details
          </Title>
          <div
            style={{
              background: "#fafafa",
              borderRadius: 6,
              padding: "16px",
              marginBottom: 24,
            }}
          >
            {(booking.rooms || []).map((room, index) => (
              <div
                key={room.booking_room_id}
                style={{
                  background: "white",
                  borderRadius: 6,
                  padding: "16px",
                  marginBottom: index < booking.rooms.length - 1 ? "12px" : 0,
                  border: "1px solid #e8e8e8",
                }}
              >
                <Row align="middle" gutter={16}>
                  <Col span={3}>
                    <Text strong>Room {index + 1}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      ID: {room.room_id}
                    </Text>
                  </Col>

                  <Col span={3}>
                    <Text type="secondary">Capacity</Text>
                    <br />
                    <Text>{room.capacity} guests</Text>
                  </Col>

                  <Col span={3}>
                    <Text type="secondary">Bed</Text>
                    <br />
                    <Text>{room.bed_option}</Text>
                  </Col>

                  <Col span={6}>
                    <Text type="secondary">Amenities</Text>
                    <br />
                    <Text style={{ fontSize: "12px" }}>
                      {Array.isArray(room.amenities) &&
                      room.amenities.length > 0
                        ? room.amenities.join(", ")
                        : "None"}
                    </Text>
                  </Col>

                  <Col span={3} style={{ textAlign: "right" }}>
                    <Text type="secondary">Price/Night</Text>
                    <br />
                    <Text strong>
                      ${(Number(room.price_per_night) || 0).toFixed(2)}
                    </Text>
                    {room.has_discount && (
                      <>
                        <br />
                        <Text type="secondary" style={{ fontSize: "10px" }}>
                          -
                          {((Number(room.discount_rate) || 0) * 100).toFixed(0)}
                          %
                        </Text>
                      </>
                    )}
                  </Col>

                  <Col span={3} style={{ textAlign: "right" }}>
                    <Text type="secondary">Total</Text>
                    <br />
                    <Text strong style={{ color: "#52c41a" }}>
                      ${(Number(room.actual_price) || 0).toFixed(2)}
                    </Text>
                  </Col>

                  <Col span={3}>
                    <Text type="secondary">Status</Text>
                    <br />
                    <Tag
                      color={
                        room.booking_status === "approved"
                          ? "green"
                          : room.booking_status === "pending"
                          ? "orange"
                          : "red"
                      }
                    >
                      {room.booking_status?.charAt(0).toUpperCase() +
                        room.booking_status?.slice(1)}
                    </Tag>
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          {/* Messages Section */}
          <Title level={5} style={{ marginBottom: 16, color: "#1890ff" }}>
            Messages
          </Title>

          <Timeline
            items={[
              // Initial message from user
              {
                color: "blue",
                children: (
                  <div
                    style={{
                      background: "#e6f7ff",
                      padding: "12px 16px",
                      borderRadius: 6,
                      border: "1px solid #91d5ff",
                    }}
                  >
                    <Text strong style={{ color: "#0050b3" }}>
                      Your Initial Message:
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text>{booking.first_message}</Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: "12px" }}
                      ></Text>
                    </div>
                  </div>
                ),
              },
              // Latest staff response if exists
              ...(message
                ? [
                    {
                      color: "green",
                      children: (
                        <div
                          style={{
                            background: "#f6ffed",
                            padding: "12px 16px",
                            borderRadius: 6,
                            border: "1px solid #b7eb8f",
                          }}
                        >
                          <Text strong style={{ color: "#389e0d" }}>
                            Staff Response:
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            <Text>{message.message}</Text>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              (Message ID: {message.id})
                            </Text>
                          </div>
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}
    </Card>
  );
};

const BookingListUsers: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelInfoMap, setHotelInfoMap] = useState<{ [key: number]: Hotel }>(
    {}
  );
  const [messagesMap, setMessagesMap] = useState<{ [key: number]: Message }>(
    {}
  );

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true);

        // Fetch user's bookings (this will automatically filter for user role)
        const bookingsData = await getBookingsForStaff(); // This function handles role-based filtering
        setBookings(bookingsData);

        if (bookingsData.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch hotel info for each unique hotel_id
        const uniqueHotelIds = [
          ...new Set(
            bookingsData.flatMap((booking) =>
              (booking.rooms || []).map((room) => room.hotel_id).filter(Boolean)
            )
          ),
        ];

        const hotelInfoPromises = uniqueHotelIds.map(async (hotelId) => {
          try {
            const hotelInfo = await getHotelById(hotelId);
            return { hotelId, hotelInfo };
          } catch (error) {
            console.error(
              `Failed to fetch hotel info for hotel ${hotelId}:`,
              error
            );
            return { hotelId, hotelInfo: null };
          }
        });

        const hotelInfoResults = await Promise.all(hotelInfoPromises);
        const hotelInfoMapData: { [key: number]: Hotel } = {};
        hotelInfoResults.forEach(({ hotelId, hotelInfo }) => {
          if (hotelInfo) {
            hotelInfoMapData[hotelId] = hotelInfo;
          }
        });
        setHotelInfoMap(hotelInfoMapData);

        // Fetch latest messages for all bookings
        try {
          const bookingIds = bookingsData.map((booking) => booking.booking_id);
          const messages = await getLatestMessages(bookingIds);

          const messagesMapData: { [key: number]: Message } = {};
          if (Array.isArray(messages)) {
            messages.forEach((msg: Message) => {
              if (msg && msg.booking_id) {
                messagesMapData[msg.booking_id] = msg;
              }
            });
          }
          setMessagesMap(messagesMapData);
        } catch (error) {
          console.error("Failed to fetch messages:", error);
          // Continue without messages if this fails
        }
      } catch (error) {
        console.error("Error fetching user bookings:", error);
        message.error("Failed to load your bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading your bookings...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        My Bookings
      </Title>

      {bookings.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "48px" }}>
            <Text type="secondary">No bookings found</Text>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                Start by searching for hotels and making your first booking!
              </Text>
            </div>
          </div>
        </Card>
      ) : (
        <div>
          {bookings.map((booking) => {
            const hotelId = booking.rooms?.[0]?.hotel_id;
            const hotelInfo = hotelId ? hotelInfoMap[hotelId] : undefined;
            const message = messagesMap[booking.booking_id];

            return (
              <UserBookingItem
                key={booking.booking_id}
                booking={booking}
                hotelInfo={hotelInfo}
                message={message}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingListUsers;
