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
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUsersList,
  updateUserProfileById,
  type User,
} from "../services/userInfoService";
import { isAuthenticated, getCurrentUser } from "../services/authService";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface AdminEditFormData {
  firstname: string;
  lastname: string;
  about?: string;
  role: string;
  newPassword?: string;
}

const UserDetail: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    const fetchUserDetail = async () => {
      // Check if user is authenticated and is admin
      if (!isAuthenticated()) {
        message.warning("Please log in to access this page.");
        navigate("/login");
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== "admin") {
        message.error("Access denied. Admin role required.");
        navigate("/");
        return;
      }

      if (!userId) {
        message.error("Invalid user ID.");
        navigate("/users-list");
        return;
      }

      setLoading(true);
      try {
        // Get all users and find the specific user
        const usersList = await getUsersList(100, 1);
        const userDetail = usersList.find(
          (user) => user.id === parseInt(userId)
        );

        if (!userDetail) {
          message.error("User not found.");
          navigate("/users-list");
          return;
        }

        setUser(userDetail);
      } catch (error) {
        console.error("Error fetching user detail:", error);
        message.error(
          error instanceof Error
            ? error.message
            : "Failed to load user details. Please try again."
        );
        navigate("/users-list");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [navigate, userId]);

  const handleEditUser = () => {
    if (user) {
      form.setFieldsValue({
        firstname: user.firstname,
        lastname: user.lastname,
        about: user.about || "",
        role: user.role,
        newPassword: "",
      });
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async (values: AdminEditFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const updateData: {
        firstname: string;
        lastname: string;
        about?: string;
        role: string;
        newPassword?: string;
      } = {
        firstname: values.firstname,
        lastname: values.lastname,
        about: values.about,
        role: values.role,
      };

      // Add password if provided
      if (values.newPassword && values.newPassword.trim()) {
        updateData.newPassword = values.newPassword;
      }

      await updateUserProfileById(user.id, updateData);
      setEditModalVisible(false);
      message.success("User updated successfully!");

      // Reload the page to refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error updating user:", error);
      message.error(
        error instanceof Error
          ? error.message
          : "Failed to update user. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading user details...</Text>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text type="secondary">User not found.</Text>
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
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/users-list")}
          style={{ marginRight: 16 }}
        >
          Back to Users List
        </Button>
        <Title level={2} style={{ display: "inline-block", margin: 0 }}>
          User Details
        </Title>
      </div>

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
            #{user.id}
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

      {/* Admin Actions */}
      <Card
        style={{
          marginTop: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        title="Admin Actions"
      >
        <Space wrap>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEditUser}
          >
            Edit User
          </Button>
          <Button danger disabled>
            Disable User (Coming Soon)
          </Button>
          <Button disabled>View User Activity (Coming Soon)</Button>
        </Space>
      </Card>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveEdit}
          size="large"
        >
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              label="First Name"
              name="firstname"
              rules={[
                { required: true, message: "Please enter first name!" },
                {
                  min: 1,
                  max: 32,
                  message: "First name must be 1-32 characters!",
                },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastname"
              rules={[
                { required: true, message: "Please enter last name!" },
                {
                  min: 1,
                  max: 32,
                  message: "Last name must be 1-32 characters!",
                },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </div>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select placeholder="Select role">
              <Option value="user">User</Option>
              <Option value="operator">Operator</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="About"
            name="about"
            rules={[
              {
                max: 500,
                message: "About section cannot exceed 500 characters!",
              },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="About the user..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="New Password (Optional)"
            name="newPassword"
            rules={[
              () => ({
                validator(_, value) {
                  if (value && value.length < 6) {
                    return Promise.reject(
                      new Error("Password must be at least 6 characters!")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="Enter new password (leave empty to keep current)" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                Save Changes
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetail;
