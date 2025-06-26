import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  message,
  Spin,
  Card,
  Avatar,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Pagination,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getUsersList,
  updateUserProfileById,
  type User,
} from "../services/userInfoService";
import { isAuthenticated, getCurrentUser } from "../services/authService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface UserTableData extends User {
  key: string;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
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

      setLoading(true);
      try {
        const usersList = await getUsersList(50, 1); // Get more users for local filtering
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error("Error fetching users list:", error);
        message.error(
          error instanceof Error
            ? error.message
            : "Failed to load users list. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // Filter users based on search and role filter
  useEffect(() => {
    let filtered = users;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          user.firstname.toLowerCase().includes(searchText.toLowerCase()) ||
          user.lastname.toLowerCase().includes(searchText.toLowerCase()) ||
          user.username.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [users, searchText, roleFilter]);

  // Handle role editing
  const handleEditRole = (user: User) => {
    setEditingUserId(user.id);
    setEditingRole(user.role);
  };

  const handleSaveRole = async (userId: number) => {
    if (!editingRole) return;

    setSaving(true);
    try {
      await updateUserProfileById(userId, {
        role: editingRole,
      });

      setEditingUserId(null);
      setEditingRole("");
      message.success("User role updated successfully!");

      // Reload the page to refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error updating user role:", error);
      message.error(
        error instanceof Error
          ? error.message
          : "Failed to update user role. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole("");
  };

  const getRoleColor = (role: string) => {
    if (!role) return "default";

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

  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (_: unknown, record: UserTableData) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            src={record.avatarurl}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {record.firstname} {record.lastname}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              @{record.username}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Text style={{ fontSize: 13 }}>{email}</Text>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string, record: UserTableData) => {
        const isEditing = editingUserId === record.id;

        if (isEditing) {
          return (
            <Space>
              <Select
                value={editingRole}
                onChange={setEditingRole}
                style={{ minWidth: 100 }}
                size="small"
              >
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="operator">Operator</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={() => handleSaveRole(record.id)}
              />
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancelEdit}
              />
            </Space>
          );
        }

        return (
          <Space>
            <Tag color={getRoleColor(role || "user")} style={{ fontSize: 12 }}>
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
            </Tag>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
              title="Edit Role"
            />
          </Space>
        );
      },
    },
    {
      title: "User ID",
      dataIndex: "id",
      key: "id",
      render: (id: number) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          #{id}
        </Text>
      ),
    },
    {
      title: "About",
      dataIndex: "about",
      key: "about",
      render: (about: string | null) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {about
            ? about.length > 50
              ? `${about.substring(0, 50)}...`
              : about
            : "—"}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: UserTableData) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/users/${record.id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  // Get unique roles for filter dropdown
  const uniqueRoles = Array.from(
    new Set(users.map((user) => user.role))
  ).filter((role) => role && typeof role === "string");

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const tableData: UserTableData[] = paginatedUsers.map((user) => ({
    ...user,
    key: user.id.toString(),
  }));

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading users list...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Users Management
      </Title>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Filters and Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}
          >
            <Search
              placeholder="Search users by name, username, or email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 350 }}
              prefix={<SearchOutlined />}
            />

            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ minWidth: 120 }}
              prefix={<FilterOutlined />}
            >
              <Option value="all">All Roles</Option>
              {uniqueRoles.map((role) => (
                <Option key={role} value={role}>
                  {role
                    ? role.charAt(0).toUpperCase() + role.slice(1)
                    : "Unknown"}
                </Option>
              ))}
            </Select>
          </div>

          <Text type="secondary">
            Showing {filteredUsers.length} of {users.length} users
          </Text>
        </div>

        {/* Users Table */}
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="middle"
          scroll={{ x: 800 }}
          style={{ marginBottom: 16 }}
        />

        {/* Custom Pagination */}
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 16 }}
        >
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredUsers.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              if (size) setPageSize(size);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} users`
            }
          />
        </div>
      </Card>
    </div>
  );
};

export default UsersList;
