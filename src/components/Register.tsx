import React, { useState } from "react";
import axios from "axios";
import { Input, Button, Form, message, Checkbox, Select } from "antd";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { api } from "../components/common/http-common";
import type { ValidateErrorEntity } from "rc-field-form/lib/interface";

// Define the type for form values
interface RegisterFormValues {
  firstname?: string; // Optional input
  lastname?: string; // Optional input
  username: string;
  about?: string;
  email: string;
  password: string;
  confirmPassword: string;
  isStaff?: boolean;
  signupCode?: string;
  staffRole?: string; // New field for staff role
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isStaff, setIsStaff] = useState(false); // State to toggle staff input visibility
  const navigate = useNavigate(); // Initialize useNavigate

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      if (values.password !== values.confirmPassword) {
        message.error("Passwords do not match!");
        return;
      }

      if (values.isStaff) {
        // Call staff registration API
        const response = await axios.post("STAFF_API_PLACEHOLDER_URL", {
          username: values.username,
          about: values.about,
          email: values.email,
          password: values.password,
          signupCode: values.signupCode,
          staffRole: values.staffRole, // Include staff role
        });

        if (response.status === 200 || response.status === 201) {
          message.success("Staff registered successfully!");
          navigate(-1); // Redirect to the previous page
        } else {
          message.error("Staff registration failed. Please try again.");
        }
      } else {
        // Call public user registration API
        const response = await axios.post(`${api.uri}/users/public/register`, {
          username: values.username,
          about: values.about,
          email: values.email,
          password: values.password,
        });

        if (response.status === 200 || response.status === 201) {
          message.success("User registered successfully!");
          navigate(-1); // Redirect to the previous page
        } else {
          message.error("User registration failed. Please try again.");
        }
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const serverError = error as {
          response?: { data?: { message?: string } };
        };
        message.error(
          serverError.response?.data?.message ||
            "An error occurred during registration."
        );
      } else {
        message.error("An error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (
    errorInfo: ValidateErrorEntity<RegisterFormValues>
  ) => {
    message.error("Please check the form fields and try again.");
    console.error("Validation Errors:", errorInfo);
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Register</h2>
      <Form
        name="register"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item label="First Name" name="firstname">
          <Input placeholder="Enter your first name (optional)" />
        </Form.Item>

        <Form.Item label="Last Name" name="lastname">
          <Input placeholder="Enter your last name (optional)" />
        </Form.Item>

        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter your username" />
        </Form.Item>

        <Form.Item label="About" name="about">
          <Input.TextArea placeholder="Tell us about yourself" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          rules={[{ required: true, message: "Please confirm your password!" }]}
        >
          <Input.Password placeholder="Confirm your password" />
        </Form.Item>

        <Form.Item>
          <Checkbox
            checked={isStaff}
            onChange={(e) => setIsStaff(e.target.checked)}
          >
            Are you a staff member?
          </Checkbox>
        </Form.Item>

        {isStaff && (
          <>
            <Form.Item
              label="Signup Code"
              name="signupCode"
              rules={[
                { required: true, message: "Please input your signup code!" },
              ]}
            >
              <Input placeholder="Enter your signup code" />
            </Form.Item>

            <Form.Item
              label="Staff Role"
              name="staffRole"
              rules={[
                { required: true, message: "Please select your staff role!" },
              ]}
            >
              <Select placeholder="Select your role">
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="operator">Operator</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
