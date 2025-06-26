import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Avatar,
  Descriptions,
  Spin,
  message,
  Button,
  Space,
  Tag,
} from "antd";
import { UserOutlined, MailOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getUserProfile, type User } from "../services/userInfoService";
import { isAuthenticated } from "../services/authService";

const { Title, Text } = Typography;

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        message.warning("Please log in to view your profile.");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const userProfile = await getUserProfile();
        setUser(userProfile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        message.error(
          error instanceof Error
            ? error.message
            : "Failed to load profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading your profile...</Text>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text type="secondary">Unable to load profile information.</Text>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "red";
      case "operator":
        return "orange";
      case "staff":
        return "blue";
      case "user":
        return "green";
      default:
        return "default";
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        My Profile
      </Title>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 32,
            padding: "16px 0",
          }}
        >
          <Avatar
            size={120}
            src={user.avatarurl}
            icon={<UserOutlined />}
            style={{
              backgroundColor: "#1890ff",
              fontSize: 48,
            }}
          />
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
              {user.firstname} {user.lastname}
            </Title>
            <Text type="secondary" style={{ fontSize: 16, marginBottom: 8 }}>
              @{user.username}
            </Text>
            <div style={{ marginBottom: 12 }}>
              <Tag
                color={getRoleColor(user.role)}
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Tag>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate("/profile/edit")}
              >
                Edit Profile
              </Button>
            </Space>
          </div>
        </div>

        {/* Profile Details */}
        <Descriptions
          bordered
          column={1}
          size="middle"
          labelStyle={{
            width: "200px",
            fontWeight: 600,
            backgroundColor: "#fafafa",
          }}
          contentStyle={{
            backgroundColor: "#fff",
            fontSize: 14,
          }}
        >
          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                Full Name
              </Space>
            }
          >
            {user.firstname} {user.lastname}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                Username
              </Space>
            }
          >
            {user.username}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <MailOutlined />
                Email Address
              </Space>
            }
          >
            {user.email}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                Role
              </Space>
            }
          >
            <Tag color={getRoleColor(user.role)} style={{ fontSize: 12 }}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                User ID
              </Space>
            }
          >
            {user.id}
          </Descriptions.Item>

          {user.about && (
            <Descriptions.Item
              label={
                <Space>
                  <UserOutlined />
                  About
                </Space>
              }
            >
              {user.about}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Additional Actions */}
      <Card
        style={{
          marginTop: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        title="Account Actions"
      >
        <Space wrap>
          <Button onClick={() => navigate("/my-bookings")}>
            View My Bookings
          </Button>
          <Button onClick={() => navigate("/my-favorites")}>
            View My Favorites
          </Button>
          <Button onClick={() => navigate("/settings")}>
            Account Settings
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default UserProfile;
