import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Layout, Space } from "antd";
import SearchBar_Hotels from "./components/SearchBar_Hotels"; // Import the SearchBar component
import "./App.css";

const { Header, Content, Footer } = Layout;

function Home() {
  return <h1>Welcome to the Home Page</h1>;
}

function About() {
  return <h1>About Us</h1>;
}

function Dashboard() {
  return <h1>Dashboard</h1>;
}

function SearchHotels() {
  return (
    <div>
      <h1>Search Hotels</h1>
      <SearchBar_Hotels /> {/* Use the SearchBar component */}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Header>
          <nav>
            <Space>
              <Link to="/">Home</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/about">About</Link>
              <Link to="/search-hotels">Search Hotels</Link>
            </Space>
          </nav>
        </Header>
        <Content style={{ padding: "50px", minHeight: "80vh" }}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search-hotels" element={<SearchHotels />} />
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
