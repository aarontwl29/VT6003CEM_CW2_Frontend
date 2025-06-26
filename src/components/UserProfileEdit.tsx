import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Avatar,
  Form,
  Input,
  Button,
  Space,
  message,
  Upload,
  Spin,
  Divider,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  SaveOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  type User,
} from "../services/userInfoService";
import { isAuthenticated } from "../services/authService";
import type { UploadProps } from "antd/es/upload/interface";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface EditFormData {
  firstname: string;
  lastname: string;
  about?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const UserProfileEdit: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        message.warning("Please log in to edit your profile.");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const userProfile = await getUserProfile();
        setUser(userProfile);

        // Set form values
        form.setFieldsValue({
          firstname: userProfile.firstname,
          lastname: userProfile.lastname,
          about: userProfile.about || "",
        });
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
  }, [navigate, form]);

  const handleSave = async (values: EditFormData) => {
    setSaving(true);
    try {
      // Prepare update data
      const updateData: {
        firstname: string;
        lastname: string;
        about?: string;
        oldPassword?: string;
        newPassword?: string;
      } = {
        firstname: values.firstname,
        lastname: values.lastname,
        about: values.about,
      };

      // Add password update if provided
      if (values.newPassword) {
        if (values.newPassword !== values.confirmPassword) {
          message.error("New passwords do not match!");
          setSaving(false);
          return;
        }
        if (!values.oldPassword) {
          message.error("Current password is required to change password!");
          setSaving(false);
          return;
        }
        updateData.oldPassword = values.oldPassword;
        updateData.newPassword = values.newPassword;
      }

      const updatedUser = await updateUserProfile(updateData);
      setUser(updatedUser);

      message.success("Profile updated successfully!");

      // Clear password fields
      form.setFieldsValue({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;

    setUploading(true);
    try {
      const result = await uploadAvatar(file as File);

      // Update user state with new avatar URL
      if (user) {
        setUser({ ...user, avatarurl: result.avatarUrl });
      }

      message.success(result.message);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error(
        error instanceof Error
          ? error.message
          : "Failed to upload avatar. Please try again."
      );
      if (onError) {
        onError(new Error("Upload failed"));
      }
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    customRequest: handleAvatarUpload,
    showUploadList: false,
    accept: "image/*",
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return false;
      }
      return true;
    },
  };

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

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/profile")}
          style={{ marginRight: 16 }}
        >
          Back to Profile
        </Button>
        <Title level={2} style={{ display: "inline-block", margin: 0 }}>
          Edit Profile
        </Title>
      </div>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Avatar Section */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Avatar
              size={120}
              src={user.avatarurl}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#1890ff",
                fontSize: 48,
              }}
            />
            <Upload {...uploadProps}>
              <Button
                type="primary"
                shape="circle"
                icon={<CameraOutlined />}
                loading={uploading}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  fontSize: 14,
                }}
                title="Change Avatar"
              />
            </Upload>
          </div>
          <div style={{ marginTop: 12 }}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} loading={uploading}>
                Upload New Avatar
              </Button>
            </Upload>
            <Text
              type="secondary"
              style={{ display: "block", marginTop: 8, fontSize: 12 }}
            >
              Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
            </Text>
          </div>
        </div>

        <Divider />

        {/* Profile Form */}
        <Form form={form} layout="vertical" onFinish={handleSave} size="large">
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              label="First Name"
              name="firstname"
              rules={[
                { required: true, message: "Please enter your first name!" },
                {
                  min: 1,
                  max: 32,
                  message: "First name must be 1-32 characters!",
                },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Enter your first name" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastname"
              rules={[
                { required: true, message: "Please enter your last name!" },
                {
                  min: 1,
                  max: 32,
                  message: "Last name must be 1-32 characters!",
                },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Enter your last name" />
            </Form.Item>
          </div>

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
              rows={4}
              placeholder="Tell us about yourself..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Divider>Change Password (Optional)</Divider>

          <Form.Item
            label="Current Password"
            name="oldPassword"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue("newPassword") && !value) {
                    return Promise.reject(
                      new Error("Please enter your current password!")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="Enter your current password" />
          </Form.Item>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              label="New Password"
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
              style={{ flex: 1 }}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
              style={{ flex: 1 }}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: 32 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                size="large"
              >
                Save Changes
              </Button>
              <Button size="large" onClick={() => navigate("/profile")}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserProfileEdit;
