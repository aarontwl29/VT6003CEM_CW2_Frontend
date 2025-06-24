import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Layout, Space } from "antd";
import SearchBar_Hotels from "./components/SearchBar_Hotels";
import HotelDetails from "./components/HotelDetails";
import Register from "./components/Register";
import Login from "./components/Login";
import { isAuthenticated, logout } from "./services/authService";
import "./App.css";

const { Header, Content, Footer } = Layout;

// Create a custom event for auth state changes
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status when component mounts
  useEffect(() => {
    // Check auth function
    function checkAuth() {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
    }

    // Initial check
    checkAuth();

    // Listen for storage events (for cross-tab updates)
    window.addEventListener("storage", checkAuth);

    // Listen for custom auth state change events (for same-tab updates)
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);

    // Poll for auth changes as a fallback
    const interval = setInterval(checkAuth, 2000);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();

    // Force update the login state
    setIsLoggedIn(false);

    // Dispatch custom event for other components
    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
  };

  return (
    <Router>
      <Layout>
        <Header>
          <nav>
            <Space size="middle">
              {/* Public links */}
              <Link to="/">Home</Link>
              <Link to="/search-hotels">Search Hotels</Link>

              {/* Show these links only when logged out */}
              {!isLoggedIn && (
                <>
                  <Link to="/register">Register</Link>
                  <Link to="/login">Login</Link>
                </>
              )}

              {/* Show logout only when logged in */}
              {isLoggedIn && (
                <Link to="/" onClick={handleLogout}>
                  Logout
                </Link>
              )}
            </Space>
          </nav>
        </Header>

        <Content style={{ padding: "50px", minHeight: "80vh" }}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/search-hotels" element={<SearchHotels />} />
            <Route path="/hotels/:hotelId" element={<HotelDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<div>Page Not Found</div>} />
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
