import React, { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Row,
  Col,
  Typography,
  Space,
  DatePicker,
  message,
  Spin,
  Select,
  Button,
  Input,
  Avatar,
  Image,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { Booking, Hotel, Room } from "../types/bookings.types";
import {
  getBookingsForStaff,
  getUserInfoById,
  getHotelById,
  updateBookings,
  type UserInfo,
} from "../services/hotelService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface BookingItemProps {
  booking: Booking;
  userInfo?: UserInfo;
  hotelInfo?: Hotel;
}

const BookingItem: React.FC<BookingItemProps> = ({
  booking,
  userInfo,
  hotelInfo,
}) => {
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(
    dayjs(booking.start_date)
  );
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(
    dayjs(booking.end_date)
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [roomStatuses, setRoomStatuses] = useState<{ [key: number]: string }>(
    () => {
      const initialStatuses: { [key: number]: string } = {};
      if (booking.rooms && Array.isArray(booking.rooms)) {
        booking.rooms.forEach((room) => {
          const validStatus = ["pending", "approved", "cancelled"].includes(
            room.booking_status
          )
            ? room.booking_status
            : "pending";
          initialStatuses[room.booking_room_id] = validStatus;
        });
      }
      return initialStatuses;
    }
  );

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

  const roomPrices = React.useMemo(() => {
    return (
      booking.rooms?.map((room) => ({
        id: room.booking_room_id,
        price: calculateRoomPrice(room),
      })) || []
    );
  }, [booking.rooms]);

  const totalPrice = React.useMemo(() => {
    return roomPrices.reduce((total, item) => total + item.price, 0);
  }, [roomPrices]);

  const roomCount = booking.rooms?.length || 0;

  // Calculate overall booking status based on room statuses
  const getOverallBookingStatus = () => {
    const statuses = Object.values(roomStatuses);
    if (statuses.every((status) => status === "approved")) return "approved";
    if (statuses.some((status) => status === "cancelled")) return "cancelled";
    return "pending";
  };

  const overallStatus = getOverallBookingStatus();

  const handleRoomStatusChange = (roomId: number, status: string) => {
    const validStatuses = ["pending", "approved", "cancelled"];
    if (validStatuses.includes(status)) {
      setRoomStatuses((prev) => ({
        ...prev,
        [roomId]: status,
      }));
    }
  };

  const handleSubmit = async () => {
    const submissionData = {
      booking_id: booking.booking_id,
      start_date: startDate?.format("YYYY-MM-DD"),
      end_date: endDate?.format("YYYY-MM-DD"),
      message: newMessage,
      recipient_id: booking.user_id, // Add the required recipient_id field
      room_updates: (booking.rooms || []).map((room) => ({
        room_id: room.room_id, // Use room_id instead of booking_room_id
        status: roomStatuses[room.booking_room_id] || "pending", // Use status instead of new_status
      })),
    };

    console.log("Booking Submission Data:", submissionData);
    console.log(
      "JSON.stringify of submission data:",
      JSON.stringify(submissionData, null, 2)
    );

    setSubmitting(true);
    try {
      await updateBookings(submissionData);
      message.success(`Booking ${booking.booking_id} updated successfully!`);
      // Reload the page after successful update
      window.location.reload();
    } catch (error) {
      console.error("Error updating booking:", error);
      message.error("Failed to update booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      style={{
        marginBottom: 24,
        border: "1px solid #e8e8e8",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Clean Header Summary */}
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
                    {roomCount} Room{roomCount > 1 ? "s" : ""} • Total: $
                    {totalPrice.toFixed(2)}
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

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Avatar
                  size={32}
                  src={userInfo?.avatarurl}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <div>
                  <Text strong style={{ fontSize: "14px" }}>
                    {userInfo?.username || "Loading..."}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {userInfo?.email || "Loading..."}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>

          <Col>
            <Space>
              <DatePicker
                value={startDate}
                onChange={(date) => setStartDate(date)}
                placeholder="Check-in"
                size="small"
              />
              <DatePicker
                value={endDate}
                onChange={(date) => setEndDate(date)}
                placeholder="Check-out"
                size="small"
              />
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
                  Overall Booking Status:
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
                  This status is calculated based on individual room statuses
                </Text>
              </Col>
            </Row>
          </div>

          {/* Guest & Hotel Info Side by Side */}
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Title level={5} style={{ marginBottom: 16, color: "#1890ff" }}>
                Guest Information
              </Title>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <Avatar
                  size={48}
                  src={userInfo?.avatarurl}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Name: </Text>
                    <Text strong>
                      {userInfo?.firstname || ""} {userInfo?.lastname || ""}
                    </Text>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Username: </Text>
                    <Text strong>{userInfo?.username || "Loading..."}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Email: </Text>
                    <Text strong>{userInfo?.email || "Loading..."}</Text>
                  </div>
                </div>
              </div>
            </Col>

            <Col span={12}>
              <Title level={5} style={{ marginBottom: 16, color: "#1890ff" }}>
                Hotel Information
              </Title>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <Image
                  width={80}
                  height={60}
                  src={hotelInfo?.image_url}
                  alt="Hotel"
                  style={{ borderRadius: 6, objectFit: "cover" }}
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iNjAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI0MCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5Ij5Ib3RlbDwvdGV4dD48L3N2Zz4="
                />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text strong style={{ fontSize: "14px" }}>
                      {hotelInfo?.name ||
                        booking.rooms?.[0]?.hotel_name ||
                        "Loading..."}
                    </Text>
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
                    <div>
                      <Text type="secondary">Address: </Text>
                      <Text>{hotelInfo.address}</Text>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          {/* Rooms Table */}
          <Title level={5} style={{ marginBottom: 16, color: "#1890ff" }}>
            Rooms & Status
          </Title>
          <div
            style={{ background: "#fafafa", borderRadius: 6, padding: "16px" }}
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
                <Row align="middle" gutter={8}>
                  <Col span={2}>
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

                  <Col span={5}>
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

                  <Col span={2} style={{ textAlign: "right" }}>
                    <Text type="secondary">Total</Text>
                    <br />
                    <Text strong style={{ color: "#52c41a" }}>
                      ${(Number(room.actual_price) || 0).toFixed(2)}
                    </Text>
                  </Col>

                  <Col span={4}>
                    <Text type="secondary">Status</Text>
                    <br />
                    <div style={{ marginBottom: 4 }}>
                      <Tag
                        color={
                          roomStatuses[room.booking_room_id] === "approved"
                            ? "green"
                            : roomStatuses[room.booking_room_id] === "pending"
                            ? "orange"
                            : "red"
                        }
                        style={{ fontSize: "10px", padding: "2px 6px" }}
                      >
                        {roomStatuses[room.booking_room_id]
                          ?.charAt(0)
                          .toUpperCase() +
                          roomStatuses[room.booking_room_id]?.slice(1)}
                      </Tag>
                    </div>
                    <Select
                      value={roomStatuses[room.booking_room_id]}
                      onChange={(value) =>
                        handleRoomStatusChange(room.booking_room_id, value)
                      }
                      style={{ width: "100%" }}
                      size="small"
                    >
                      <Option value="pending">Pending</Option>
                      <Option value="approved">Approved</Option>
                      <Option value="cancelled">Cancelled</Option>
                    </Select>
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          {/* Messages Section */}
          <div style={{ marginTop: 24 }}>
            <Title level={5} style={{ marginBottom: 16, color: "#1890ff" }}>
              Messages
            </Title>

            {booking.first_message && (
              <div
                style={{
                  background: "#f6f6f6",
                  padding: "12px 16px",
                  borderRadius: 6,
                  marginBottom: 16,
                  border: "1px solid #e8e8e8",
                }}
              >
                <Text strong style={{ color: "#666" }}>
                  Guest Message:
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Text>{booking.first_message}</Text>
                </div>
              </div>
            )}

            <div>
              <Text strong style={{ marginBottom: 8, display: "block" }}>
                Staff Response:
              </Text>
              <TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your response message here..."
                rows={4}
                style={{ marginBottom: 16 }}
              />
            </div>

            <div style={{ textAlign: "right" }}>
              <Button
                type="primary"
                onClick={handleSubmit}
                size="large"
                loading={submitting}
                disabled={submitting}
                style={{ minWidth: 120 }}
              >
                {submitting ? "Updating..." : "Submit Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfoMap, setUserInfoMap] = useState<{ [key: number]: UserInfo }>(
    {}
  );
  const [hotelInfoMap, setHotelInfoMap] = useState<{ [key: number]: Hotel }>(
    {}
  );

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookingsData = await getBookingsForStaff();
        setBookings(bookingsData);

        // Fetch user info for each unique user_id
        const uniqueUserIds = [
          ...new Set(bookingsData.map((booking) => booking.user_id)),
        ];
        const userInfoPromises = uniqueUserIds.map(async (userId) => {
          try {
            const userInfo = await getUserInfoById(userId);
            return { userId, userInfo };
          } catch (error) {
            console.error(
              `Failed to fetch user info for user ${userId}:`,
              error
            );
            return { userId, userInfo: null };
          }
        });

        const userInfoResults = await Promise.all(userInfoPromises);
        const userInfoMapData: { [key: number]: UserInfo } = {};
        userInfoResults.forEach(({ userId, userInfo }) => {
          if (userInfo) {
            userInfoMapData[userId] = userInfo;
          }
        });
        setUserInfoMap(userInfoMapData);

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
      } catch (error) {
        console.error("Error fetching bookings:", error);
        message.error("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading bookings...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Booking List
      </Title>

      {bookings.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "48px" }}>
            <Text type="secondary">No bookings found</Text>
          </div>
        </Card>
      ) : (
        <div>
          {bookings.map((booking) => {
            const userInfo = userInfoMap[booking.user_id];
            const hotelId = booking.rooms?.[0]?.hotel_id;
            const hotelInfo = hotelId ? hotelInfoMap[hotelId] : undefined;

            return (
              <BookingItem
                key={booking.booking_id}
                booking={booking}
                userInfo={userInfo}
                hotelInfo={hotelInfo}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingList;
