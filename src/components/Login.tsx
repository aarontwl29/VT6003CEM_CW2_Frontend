import React, { useState } from "react";
import { Input, Button, Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success("Login successful!");

      // Navigate to home page
      navigate("/");
    } catch (error: unknown) {
      // Handle different types of errors
      if (error && typeof error === "object" && "response" in error) {
        const serverError = error as {
          response?: { data?: { message?: string }; status?: number };
        };

        if (serverError.response?.status === 401) {
          message.error("Invalid username or password");
        } else {
          message.error(
            serverError.response?.data?.message ||
              "Login failed. Please try again."
          );
        }
      } else {
        message.error("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Login</h2>
      <Form name="login" layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter your username" size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter your password" size="large" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
          >
            Login
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          Don't have an account?{" "}
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
          >
            Register now!
          </a>
        </div>
      </Form>
    </div>
  );
};

export default Login;
