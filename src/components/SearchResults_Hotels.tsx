import React, { useState, useEffect } from "react";
import { List, Spin, Tag, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { searchHotels } from "../services/hotelService";

export interface SearchResultsProps {
  searchParams: {
    country: string;
    city: string;
    startDate: string | null;
    endDate: string | null;
    personNumber: number;
    roomNumber: number;
  };
}

interface HotelResult {
  id: number;
  name: string;
  description?: string;
  city?: string;
  country?: string;
  address?: string;
  rating?: string;
  review_count?: number;
  image_url?: string;
  cheapest_room?: {
    original_price?: string;
    discounted_price?: string;
  };
}

const SearchResults_Hotels: React.FC<SearchResultsProps> = ({
  searchParams,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<HotelResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchHotels({
          country: searchParams.country,
          city: searchParams.city,
          start_date: searchParams.startDate,
          end_date: searchParams.endDate,
          personNumber: searchParams.personNumber,
          roomNumber: searchParams.roomNumber,
        });
        console.log("API Response:", data);
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching hotel results:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const handleHotelClick = (hotelId: number) => {
    navigate(`/hotels/${hotelId}`, {
      state: {
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
      },
    });
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin tip="Loading results..." />
        </div>
      ) : results.length === 0 ? (
        <p>No hotels found matching the criteria.</p>
      ) : (
        <List
          dataSource={results}
          renderItem={(item) => (
            <List.Item
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                display: "flex",
                alignItems: "flex-start",
                gap: "15px",
              }}
            >
              {/* Hotel Image */}
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name || "Hotel Image"}
                  style={{
                    width: "260px",
                    height: "208px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Right Content */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {/* Top: Name & Rating */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      margin: "0",
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#006ce4",
                      cursor: "pointer",
                      textAlign: "left",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flexGrow: 1,
                      marginRight: "10px",
                    }}
                    onClick={() => handleHotelClick(item.id)}
                  >
                    {item.name || "Hotel Name"}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0,
                    }}
                  >
                    <Tag color="blue">{item.rating || "N/A"}</Tag>
                    <span style={{ color: "#777" }}>
                      {item.review_count || 0} reviews
                    </span>
                  </div>
                </div>

                {/* Address, City, Description */}
                <div
                  style={{
                    marginTop: "8px",
                    color: "#555",
                    lineHeight: "1.4",
                    textAlign: "left",
                  }}
                >
                  <p style={{ margin: "4px 0" }}>
                    {item.address || "No Address"}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    {item.city}, {item.country}
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    {item.description || "No description available"}
                  </p>
                </div>

                {/* Deal & Stay Info */}
                <div
                  style={{
                    marginTop: "8px",
                    textAlign: "left", // Ensure content sticks to the left
                  }}
                >
                  <Tag color="green">Getaway Deal</Tag>
                  <p style={{ margin: "8px 0 0", color: "#999" }}>
                    1 night, 2 adults
                  </p>
                </div>

                {/* Price & Button */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    {item.cheapest_room?.original_price && (
                      <span
                        style={{
                          textDecoration: "line-through",
                          color: "red",
                          marginRight: "8px",
                        }}
                      >
                        USD$
                        {parseFloat(item.cheapest_room.original_price).toFixed(
                          2
                        )}{" "}
                      </span>
                    )}
                    {item.cheapest_room?.discounted_price && (
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#222",
                        }}
                      >
                        USD$
                        {parseFloat(
                          item.cheapest_room.discounted_price
                        ).toFixed(2)}{" "}
                      </span>
                    )}
                  </div>

                  <Button
                    type="primary"
                    onClick={() => handleHotelClick(item.id)}
                  >
                    See Availability
                  </Button>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default SearchResults_Hotels;
