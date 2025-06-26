import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  List,
  Avatar,
  Space,
  Button,
  Input,
  Modal,
  message,
  Spin,
  Empty,
  Tag,
  Divider,
} from "antd";
import {
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../services/authService";
import { getLatestMessages } from "../services/hotelService";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Message {
  id: number;
  booking_id: number;
  sender_email: string;
  message: string;
  timestamp: string;
  hotel_name?: string;
  user_name?: string;
  is_from_operator?: boolean;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      message.warning("Please log in to view messages.");
      navigate("/login");
      return;
    }

    fetchMessages();
  }, [navigate]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // For demo purposes, we'll get messages from bookings
      // In a real app, you'd have a dedicated messages endpoint
      const bookingIds = [1, 2, 3, 4, 5]; // This would come from user's bookings
      const messagesData = await getLatestMessages(bookingIds);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      message.error("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (messageItem: Message) => {
    setSelectedMessage(messageItem);
    setReplyModalVisible(true);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) {
      message.warning("Please enter a reply message.");
      return;
    }

    setSending(true);
    try {
      // Here you would call your message reply API
      // await sendMessageReply(selectedMessage.booking_id, replyText);

      message.success("Reply sent successfully!");
      setReplyModalVisible(false);
      setReplyText("");
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error("Error sending reply:", error);
      message.error("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      // Here you would call your delete message API
      // await deleteMessage(messageId);

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      message.success("Message deleted successfully!");
    } catch (error) {
      console.error("Error deleting message:", error);
      message.error("Failed to delete message. Please try again.");
    }
  };

  const isOperator =
    currentUser?.role === "operator" || currentUser?.role === "admin";

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading messages...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          <MessageOutlined style={{ marginRight: 8 }} />
          {isOperator ? "Customer Messages" : "My Messages"}
        </Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchMessages}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {messages.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {isOperator
                  ? "No customer messages available"
                  : "No messages found"}
              </span>
            }
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={messages}
            renderItem={(messageItem) => (
              <List.Item
                key={messageItem.id}
                style={{
                  borderRadius: 8,
                  marginBottom: 16,
                  padding: 16,
                  backgroundColor: messageItem.is_from_operator
                    ? "#f6ffed"
                    : "#fff7e6",
                  border: `1px solid ${
                    messageItem.is_from_operator ? "#d9f7be" : "#ffd591"
                  }`,
                }}
                actions={[
                  <Button
                    key="reply"
                    type="primary"
                    size="small"
                    icon={<SendOutlined />}
                    onClick={() => handleReply(messageItem)}
                    disabled={!isOperator && messageItem.is_from_operator}
                  >
                    Reply
                  </Button>,
                  <Button
                    key="delete"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteMessage(messageItem.id)}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: messageItem.is_from_operator
                          ? "#52c41a"
                          : "#1890ff",
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{messageItem.sender_email}</Text>
                      {messageItem.is_from_operator && (
                        <Tag color="green">Operator</Tag>
                      )}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(messageItem.timestamp).toLocaleString()}
                      </Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {messageItem.hotel_name && (
                        <Text type="secondary">
                          <strong>Hotel:</strong> {messageItem.hotel_name}
                        </Text>
                      )}
                      <Text type="secondary">
                        <strong>Booking ID:</strong> #{messageItem.booking_id}
                      </Text>
                    </Space>
                  }
                />
                <Paragraph style={{ marginTop: 12 }}>
                  {messageItem.message}
                </Paragraph>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Reply Modal */}
      <Modal
        title="Send Reply"
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedMessage && (
          <div>
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 6,
              }}
            >
              <Text strong>Original Message:</Text>
              <Divider style={{ margin: "8px 0" }} />
              <Text>{selectedMessage.message}</Text>
            </div>

            <TextArea
              rows={4}
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              showCount
              maxLength={500}
            />

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Space>
                <Button onClick={() => setReplyModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendReply}
                  loading={sending}
                  disabled={!replyText.trim()}
                >
                  Send Reply
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
