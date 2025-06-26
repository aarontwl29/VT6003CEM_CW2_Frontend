import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Layout, Space } from "antd";
import SearchBar_Hotels from "./components/SearchBar_Hotels";
import HotelDetails from "./components/HotelDetails";
import Register from "./components/Register";
import Login from "./components/Login";
import NotFound from "./components/NotFound"; // Import the NotFound component
import BookingList from "./components/BookingList";
import BookingListUsers from "./components/BookingList_users";
import TestingPage from "./components/TestingPage";
import { isAuthenticated, logout, getUserRole } from "./services/authService";
import "./App.css";

const { Header, Content, Footer } = Layout;

// Create a custom event for auth state changes, USEFUL !!
export const AUTH_STATE_CHANGE_EVENT = "authStateChange";

function Home() {
  return <h1>Welcome to the Home Page</h1>;
}

function SearchHotels() {
  return (
    <div>
      <h1>Search Hotels</h1>
      <SearchBar_Hotels />
    </div>
  );
}

// Simple role-specific pages
function UserDashboard() {
  return <h1>User Dashboard - Regular user features</h1>;
}

function StaffDashboard() {
  return <h1>Staff Dashboard - Common features for operators and admins</h1>;
}

function AdminPanel() {
  return <h1>Admin Panel - Admin only features</h1>;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState("");

  // Check authentication status and role when component mounts
  useEffect(() => {
    // Check auth function with throttling to prevent repeated calls with the same data
    function checkAuth() {
      const authenticated = isAuthenticated();

      // Only update if authentication status changes
      if (authenticated !== isLoggedIn) {
        setIsLoggedIn(authenticated);
      }

      // Get user role if authenticated
      if (authenticated) {
        const role = getUserRole();
        const roleKey = `${authenticated}-${role}`;

        // Only update if role changes
        if (roleKey !== lastCheck) {
          setUserRole(role);
          setLastCheck(roleKey);
        }
      } else if (userRole !== null) {
        // Clear role if not authenticated
        setUserRole(null);
        setLastCheck("");
      }
    }

    // Initial check
    checkAuth();

    // Listen for storage events (for cross-tab updates)
    window.addEventListener("storage", checkAuth);

    // Listen for custom auth state change events (for same-tab updates)
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);

    // Poll less frequently (5 seconds instead of 1 second)
    const interval = setInterval(checkAuth, 5000);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);
      clearInterval(interval);
    };
  }, [isLoggedIn, userRole, lastCheck]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();

    // Force update the login state
    setIsLoggedIn(false);
    setUserRole(null);
    setLastCheck("");
  };

  // Helper function to check if user is staff (either operator or admin)
  const isStaff = () => {
    return userRole === "operator" || userRole === "admin";
  };

  return (
    <Router>
      <Layout>
        <Header>
          <nav>
            <Space size="middle">
              {/* Public links - always visible */}
              <Link to="/">Home</Link>
              <Link to="/search-hotels">Search Hotels</Link>

              {/* Show these links only when logged out */}
              {!isLoggedIn && (
                <>
                  <Link to="/register">Register</Link>
                  <Link to="/login">Login</Link>
                </>
              )}

              {/* User-specific links - only when logged in */}
              {isLoggedIn && (
                <>
                  {/* Regular user dashboard - visible to all logged in users */}
                  <Link to="/user-dashboard">My Dashboard</Link>

                  {/* User's own bookings - visible to all users */}
                  <Link to="/my-bookings">My Bookings</Link>

                  {/* Staff features - only for operators and admins */}
                  {isStaff() && (
                    <>
                      <Link to="/staff-dashboard">Staff Dashboard</Link>
                      <Link to="/booking-list">Manage Bookings</Link>
                    </>
                  )}

                  {/* Admin only features */}
                  {userRole === "admin" && (
                    <Link to="/admin-panel">Admin Panel</Link>
                  )}

                  <Link to="/" onClick={handleLogout}>
                    Logout
                  </Link>
                </>
              )}
            </Space>
          </nav>
        </Header>

        <Content style={{ padding: "50px", minHeight: "80vh" }}>
          <Routes>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="/search-hotels" element={<SearchHotels />} />
            <Route path="/hotels/:hotelId" element={<HotelDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            {/* User routes */}
            <Route
              path="/user-dashboard"
              element={isLoggedIn ? <UserDashboard /> : <Login />}
            />
            {/* User's own bookings */}
            <Route
              path="/my-bookings"
              element={isLoggedIn ? <BookingListUsers /> : <Login />}
            />
            {/* Staff routes (operator and admin) */}
            <Route
              path="/staff-dashboard"
              element={isLoggedIn && isStaff() ? <StaffDashboard /> : <Login />}
            />
            {/* Staff Booking Management route - only for staff */}
            <Route
              path="/booking-list"
              element={isLoggedIn && isStaff() ? <BookingList /> : <Login />}
            />
            {/* Admin-only routes */}
            <Route
              path="/admin-panel"
              element={
                isLoggedIn && userRole === "admin" ? <AdminPanel /> : <Login />
              }
            />
            {/* Test Bookings route */}
            <Route path="/test-bookings" element={<TestingPage />} />
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />{" "}
            {/* Redirect all undefined routes */}
          </Routes>
        </Content>

        <Footer>
          <p>VT6003CEM Demo</p>
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
