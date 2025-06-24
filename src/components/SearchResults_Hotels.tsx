import React, { useState, useEffect } from "react";
import { List, Spin } from "antd";
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
    navigate(`/hotels/${hotelId}`);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {loading ? (
        <Spin tip="Loading results..." />
      ) : results.length === 0 ? (
        <p>No hotels found matching the criteria.</p>
      ) : (
        <List
          header={<h2>Search Results</h2>}
          bordered
          dataSource={results}
          renderItem={(item) => (
            <List.Item onClick={() => handleHotelClick(item.id)}>
              <div style={{ width: "100%", cursor: "pointer" }}>
                <h3>{item.name || "No Name Available"}</h3>
                <p>{item.description || "No Description Available"}</p>
                <p>Address: {item.address || "No Address Available"}</p>
                <p>City: {item.city || "No City Available"}</p>
                <p>Country: {item.country || "No Country Available"}</p>
                <p>Rating: {item.rating || "No Rating Available"}</p>
                <p>
                  Review Count: {item.review_count || "No Reviews Available"}
                </p>
                <p>
                  Cheapest Room: Original Price: $
                  {item.cheapest_room?.original_price
                    ? parseFloat(item.cheapest_room.original_price).toFixed(2)
                    : "N/A"}
                  , Discount Price: $
                  {item.cheapest_room?.discounted_price
                    ? parseFloat(item.cheapest_room.discounted_price).toFixed(2)
                    : "N/A"}
                </p>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name || "Hotel Image"}
                    style={{ width: "200px", height: "auto" }}
                  />
                )}
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default SearchResults_Hotels;
