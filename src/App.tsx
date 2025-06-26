import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Layout, Space } from "antd";
import SearchBar_Hotels from "./components/SearchBar_Hotels";
import HotelDetails from "./components/HotelDetails";
import Register from "./components/Register";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import BookingList from "./components/BookingList";
import BookingListUsers from "./components/BookingList_users";
import FavoriteHotels from "./components/FavoriteHotels";
import UserProfile from "./components/UserProfile";
import UserProfileEdit from "./components/UserProfileEdit";
import UsersList from "./components/UsersList";
import UserDetail from "./components/UserDetail";
import TestingPage from "./components/TestingPage";
import { isAuthenticated, logout, getUserRole } from "./services/authService";
import bannerImage from "./assets/banner.png";
import "./App.css";

const { Header, Content, Footer } = Layout;

export const AUTH_STATE_CHANGE_EVENT = "authStateChange";

function Home() {
  return (
    <div style={{ textAlign: "center" }}>
      {/* Banner Image */}
      <div style={{ marginBottom: "32px" }}>
        <img
          src={bannerImage}
          alt="Wanderlust Travel Banner"
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
      </div>

      {/* Welcome Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#1890ff",
            marginBottom: "16px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Welcome to Wanderlust Travel
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#666",
            lineHeight: "1.6",
            marginBottom: "32px",
          }}
        >
          Discover amazing destinations, book your dream hotels, and create
          unforgettable memories with Wanderlust Travel. Your journey to
          extraordinary experiences starts here.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/search-hotels">
            <button
              style={{
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                padding: "12px 24px",
                fontSize: "16px",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(24,144,255,0.3)",
                transition: "all 0.3s ease",
              }}
            >
              Start Your Journey
            </button>
          </Link>

          <Link to="/register">
            <button
              style={{
                backgroundColor: "white",
                color: "#1890ff",
                border: "2px solid #1890ff",
                padding: "12px 24px",
                fontSize: "16px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Join Wanderlust
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchHotels() {
  return (
    <div>
      <h1>Search Hotels</h1>
      <SearchBar_Hotels />
    </div>
  );
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
        <Header
          style={{
            backgroundColor: "#1890ff",
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "100%",
            }}
          >
            {/* Company Logo/Name */}
            <Link
              to="/"
              style={{
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              🌍 Wanderlust Travel
            </Link>
            <nav>
              <Space size="middle">
                {/* Public links - always visible */}
                <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                  Home
                </Link>
                <Link
                  to="/search-hotels"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Search Hotels
                </Link>

                {/* Show these links only when logged out */}
                {!isLoggedIn && (
                  <>
                    <Link
                      to="/register"
                      style={{ color: "white", textDecoration: "none" }}
                    >
                      Register
                    </Link>
                    <Link
                      to="/login"
                      style={{ color: "white", textDecoration: "none" }}
                    >
                      Login
                    </Link>
                  </>
                )}

                {/* User-specific links - only when logged in */}
                {isLoggedIn && (
                  <>
                    {/* User profile - visible to all users */}
                    <Link
                      to="/profile"
                      style={{ color: "white", textDecoration: "none" }}
                    >
                      My Profile
                    </Link>

                    {/* User's own bookings - visible to all users */}
                    <Link
                      to="/my-bookings"
                      style={{ color: "white", textDecoration: "none" }}
                    >
                      My Bookings
                    </Link>

                    {/* User's favorite hotels - visible to all users */}
                    <Link
                      to="/my-favorites"
                      style={{ color: "white", textDecoration: "none" }}
                    >
                      My Favorites
                    </Link>

                    {/* Staff features - only for operators and admins */}
                    {isStaff() && (
                      <>
                        <Link
                          to="/booking-list"
                          style={{ color: "white", textDecoration: "none" }}
                        >
                          Manage Bookings
                        </Link>
                      </>
                    )}

                    {/* Admin only features */}
                    {userRole === "admin" && (
                      <>
                        <Link
                          to="/users-list"
                          style={{ color: "white", textDecoration: "none" }}
                        >
                          Users Management
                        </Link>
                      </>
                    )}

                    <Link
                      to="/"
                      onClick={handleLogout}
                      style={{
                        color: "white",
                        textDecoration: "none",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        padding: "4px 12px",
                        borderRadius: "4px",
                      }}
                    >
                      Logout
                    </Link>
                  </>
                )}
              </Space>
            </nav>
          </div>
        </Header>

        <Content style={{ padding: "50px", minHeight: "80vh" }}>
          <Routes>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="/search-hotels" element={<SearchHotels />} />
            <Route path="/hotels/:hotelId" element={<HotelDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            {/* User profile */}
            <Route
              path="/profile"
              element={isLoggedIn ? <UserProfile /> : <Login />}
            />
            {/* User profile edit */}
            <Route
              path="/profile/edit"
              element={isLoggedIn ? <UserProfileEdit /> : <Login />}
            />
            {/* User's own bookings */}
            <Route
              path="/my-bookings"
              element={isLoggedIn ? <BookingListUsers /> : <Login />}
            />
            {/* User's favorite hotels */}
            <Route
              path="/my-favorites"
              element={isLoggedIn ? <FavoriteHotels /> : <Login />}
            />
            {/* Staff Booking Management route - only for staff */}
            <Route
              path="/booking-list"
              element={isLoggedIn && isStaff() ? <BookingList /> : <Login />}
            />
            {/* Users Management - Admin only */}
            <Route
              path="/users-list"
              element={
                isLoggedIn && userRole === "admin" ? <UsersList /> : <Login />
              }
            />
            {/* User Detail - Admin only */}
            <Route
              path="/admin/users/:userId"
              element={
                isLoggedIn && userRole === "admin" ? <UserDetail /> : <Login />
              }
            />
            {/* Test Bookings route */}
            <Route path="/test-bookings" element={<TestingPage />} />
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />{" "}
            {/* Redirect all undefined routes */}
          </Routes>
        </Content>

        <Footer
          style={{
            textAlign: "center",
            backgroundColor: "#f0f2f5",
            borderTop: "1px solid #d9d9d9",
          }}
        >
          <p style={{ margin: 0, color: "#666" }}>
            © 2025 Wanderlust Travel - Your Journey Begins Here 🌍
          </p>
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
